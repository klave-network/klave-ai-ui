import { useLocation, useParams } from '@tanstack/react-router';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { SliderTooltip } from '@/components/ui/slider-tooltip';
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
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { useUserChatSettings, useUserChat, storeActions } from '@/store';
import { CUR_USER_KEY } from '@/lib/constants';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const formSchema = z.object({
    system_prompt: z.string().min(1, 'System prompt is required'),
    temperature: z
        .number()
        .min(0)
        .max(2, 'Temperature must be between 0 and 2'),
    topp: z.number().min(0).max(1, 'Top-p must be between 0 and 1'),
    steps: z.number().min(256).max(1024),
    sliding_window: z.boolean(),
    useRag: z.boolean(),
    ragChunks: z.number().min(0).max(5, 'Top-p must be between 0 and 5')
});

type FormValues = z.infer<typeof formSchema>;

export const SettingsModal = () => {
    const location = useLocation();
    const params = useParams({ strict: false });
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const currentChat = useUserChat(currentUser, params?.id ?? '');
    const {
        systemPrompt,
        steps,
        slidingWindow,
        useRag,
        topp,
        temperature,
        modelName,
        ragChunks
    } = useUserChatSettings(currentUser);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Check if we're in chat view
    const isInChatView = location.pathname === '/chat';

    // Create the form
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            system_prompt: '',
            temperature: 0.8,
            topp: 0.9,
            steps: 256,
            sliding_window: false,
            useRag: false,
            ragChunks: 3
        }
    });

    // Update form values when dialog opens or when currentChat/settings change
    useEffect(() => {
        if (isDialogOpen) {
            // Use currentChat settings if available, otherwise fall back to global settings
            const settings = currentChat?.chatSettings
                ? currentChat.chatSettings
                : {
                      systemPrompt,
                      temperature,
                      topp,
                      steps,
                      slidingWindow,
                      useRag,
                      ragChunks
                  };

            // Reset the form with current values
            form.reset({
                system_prompt: settings.systemPrompt,
                temperature: settings.temperature,
                topp: settings.topp,
                steps: settings.steps,
                sliding_window: settings.slidingWindow,
                useRag: settings.useRag,
                ragChunks: settings.ragChunks
            });
        }
    }, [
        isDialogOpen,
        currentChat,
        systemPrompt,
        temperature,
        topp,
        steps,
        slidingWindow,
        useRag,
        form
    ]);

    // Debug logging
    useEffect(() => {
        if (isDialogOpen) {
            console.log('Dialog opened with settings:', {
                currentChat: currentChat ? 'exists' : 'null',
                chatSettings: currentChat?.chatSettings,
                globalSettings: {
                    systemPrompt,
                    temperature,
                    topp,
                    steps,
                    slidingWindow,
                    useRag,
                    ragChunks
                },
                formValues: form.getValues()
            });
        }
    }, [isDialogOpen, currentChat, form]);

    const onSubmit = (data: FormValues) => {
        if (!isInChatView) {
            toast.error('Settings can only be updated in chat view');
            return;
        }

        try {
            storeActions.updateChatSettings(currentUser, {
                systemPrompt: data.system_prompt,
                temperature: data.temperature,
                topp: data.topp,
                steps: data.steps,
                slidingWindow: data.sliding_window,
                useRag: data.useRag,
                modelName: modelName,
                ragSpace: '',
                ragChunks: data.ragChunks
            });

            toast.success('Settings updated successfully');
            setIsDialogOpen(false);
        } catch (error) {
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
                            name="system_prompt"
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
                                field: { value, onChange, ...field }
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
                                                isInChatView && onChange(val)
                                            }
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
                                field: { value, onChange, ...field }
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
                                                isInChatView && onChange(val)
                                            }
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
                                field: { value, onChange, ...field }
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
                                                isInChatView && onChange(val)
                                            }
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
                                            onValueChange={(val) =>
                                                isInChatView &&
                                                onChange(Number(val))
                                            }
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
                            name="sliding_window"
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
                                            onCheckedChange={(checked) =>
                                                isInChatView &&
                                                onChange(checked)
                                            }
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
};
