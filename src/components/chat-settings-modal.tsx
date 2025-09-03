import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useParams } from '@tanstack/react-router';
import { Settings2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { SliderTooltip } from '@/components/ui/slider-tooltip';
import { Switch } from '@/components/ui/switch';
import { CUR_USER_KEY } from '@/lib/constants';
import { storeActions, useUserChat, useUserChatSettings } from '@/store';

// Default chat settings fallback
const defaultChatSettings = {
    systemPrompt: 'You are a helpful assistant.',
    temperature: 0.8,
    topp: 0.9,
    steps: 256,
    slidingWindow: false,
    useRag: false,
    currentLlModel: '',
    currentVlModel: '',
    ragSpace: '',
    ragChunks: 2
};

const formSchema = z.object({
    systemPrompt: z.string().min(1, 'System prompt is required'),
    temperature: z
        .number()
        .min(0)
        .max(2, 'Temperature must be between 0 and 2'),
    topp: z.number().min(0).max(1, 'Top-p must be between 0 and 1'),
    steps: z.number().min(256).max(1024),
    slidingWindow: z.boolean(),
    useRag: z.boolean(),
    ragChunks: z.number().min(0).max(5, 'RAG chunks must be between 0 and 5')
});

type FormValues = z.infer<typeof formSchema>;

export function ChatSettingsModal() {
    const location = useLocation();
    const params = useParams({ strict: false });
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const currentChat = useUserChat(currentUser, params?.id ?? '');
    const chatSettings
        = useUserChatSettings(currentUser) ?? defaultChatSettings;

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Only enable settings editing in chat view
    const isInChatView = location.pathname === '/chat';

    // Initialize react-hook-form with validation schema and default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            systemPrompt: '',
            temperature: 0.8,
            topp: 0.9,
            steps: 256,
            slidingWindow: false,
            useRag: false,
            ragChunks: 3
        }
    });

    // When dialog opens or dependencies change, reset form with current settings
    useEffect(() => {
        if (!isDialogOpen)
            return;

        // Prefer current chat settings, fallback to global chatSettings
        const settings = currentChat?.chatSettings ?? chatSettings;

        form.reset({
            systemPrompt: settings.systemPrompt,
            temperature: settings.temperature,
            topp: settings.topp,
            steps: settings.steps,
            slidingWindow: settings.slidingWindow,
            useRag: settings.useRag,
            ragChunks: settings.ragChunks
        });
    }, [isDialogOpen, currentChat, chatSettings, form]);

    // Submit handler updates the store and closes dialog
    const onSubmit = (data: FormValues) => {
        if (!isInChatView) {
            toast.error('Settings can only be updated in chat view');
            return;
        }

        try {
            storeActions.updateChatSettings(currentUser, {
                systemPrompt: data.systemPrompt,
                temperature: data.temperature,
                topp: data.topp,
                steps: data.steps,
                slidingWindow: data.slidingWindow,
                useRag: data.useRag,
                ragChunks: data.ragChunks,
                // Keep model keys unchanged to avoid overwriting
                currentLlModel: chatSettings.currentLlModel,
                currentVlModel: chatSettings.currentVlModel,
                ragSpace: chatSettings.ragSpace
            });

            toast.success('Settings updated successfully');
            setIsDialogOpen(false);
        }
        catch (error) {
            toast.error('Failed to update settings');
            console.error('Error updating settings:', error);
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    className="hover:cursor-pointer"
                >
                    <Settings2 className="text-gray-500" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Customize</DialogTitle>
                    <DialogDescription>
                        Configure your AI assistant settings here.
                        {!isInChatView && (
                            <p className="mt-2 text-yellow-500 font-medium">
                                Settings can only be edited during chat
                                creation.
                            </p>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        className="space-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                        id="settings-form"
                    >
                        <FormField
                            control={form.control}
                            name="systemPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>System prompt</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your system prompt"
                                            disabled={!isInChatView}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="temperature"
                            render={({
                                field: { value, onChange, ref, ...field }
                            }) => (
                                <FormItem>
                                    <FormControl>
                                        <SliderTooltip
                                            id="temperature"
                                            min={0}
                                            max={2}
                                            step={0.01}
                                            defaultValue={[value]}
                                            onValueChange={([val]) =>
                                                isInChatView && onChange(val)}
                                            labelFor="temperature"
                                            labelTitle="Temperature"
                                            labelValue={value}
                                            disabled={!isInChatView}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="topp"
                            render={({
                                field: { value, onChange, ref, ...field }
                            }) => (
                                <FormItem>
                                    <FormControl>
                                        <SliderTooltip
                                            id="topp"
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            defaultValue={[value]}
                                            onValueChange={([val]) =>
                                                isInChatView && onChange(val)}
                                            labelFor="topp"
                                            labelTitle="Top-p"
                                            labelValue={value}
                                            disabled={!isInChatView}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="ragChunks"
                            render={({
                                field: { value, onChange, ref, ...field }
                            }) => (
                                <FormItem>
                                    <FormControl>
                                        <SliderTooltip
                                            id="ragChunks"
                                            min={0}
                                            max={5}
                                            step={1}
                                            defaultValue={[value]}
                                            onValueChange={([val]) =>
                                                isInChatView && onChange(val)}
                                            labelFor="ragChunks"
                                            labelTitle="RAG Chunks"
                                            labelValue={value}
                                            disabled={!isInChatView}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="steps"
                            render={({
                                field: { value, onChange, ...field }
                            }) => (
                                <FormItem>
                                    <FormLabel>Steps</FormLabel>
                                    <FormControl>
                                        <Select
                                            value={value.toString()}
                                            onValueChange={val =>
                                                isInChatView
                                                && onChange(Number(val))}
                                            disabled={!isInChatView}
                                            {...field}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Steps" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="256">
                                                        256
                                                    </SelectItem>
                                                    <SelectItem value="512">
                                                        512
                                                    </SelectItem>
                                                    <SelectItem value="1024">
                                                        1024
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="slidingWindow"
                            render={({
                                field: { value, onChange, ...field }
                            }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Sliding Window</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={value}
                                            onCheckedChange={checked =>
                                                isInChatView
                                                && onChange(checked)}
                                            disabled={!isInChatView}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter className="flex space-x-2 pt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        form="settings-form"
                        disabled={!form.formState.isDirty || !isInChatView}
                    >
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
