import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from '@tanstack/react-router';
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
import { SliderTooltip } from '@/components/ui/slider-tooltip';
import { CUR_USER_KEY } from '@/lib/constants';
import { storeActions, useUserChat, useUserLenseSettings } from '@/store';

// Default chat settings fallback
const defaultLenseSettings = {
    systemPrompt: 'You are a helpful assistant.',
    userPrompt: 'What do you see?',
    snapshotFrequency: 10000
};

const formSchema = z.object({
    systemPrompt: z.string().min(1, 'System prompt is required'),
    userPrompt: z.string().min(1, 'User prompt is required'),
    snapshotFrequency: z.number().min(0, 'Snapshot frequency must be a positive number')
});

type FormValues = z.infer<typeof formSchema>;

export function LenseSettingsModal() {
    const params = useParams({ strict: false });
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const currentChat = useUserChat(currentUser, params?.id ?? '');
    const chatSettings
        = useUserLenseSettings(currentUser) ?? defaultLenseSettings;

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Initialize react-hook-form with validation schema and default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            systemPrompt: 'You are a helpful assistant.',
            userPrompt: 'What do you see?',
            snapshotFrequency: 10000
        }
    });

    // When dialog opens or dependencies change, reset form with current settings
    useEffect(() => {
        if (!isDialogOpen)
            return;

        form.reset({
            systemPrompt: chatSettings.systemPrompt,
            userPrompt: chatSettings.userPrompt,
            snapshotFrequency: chatSettings.snapshotFrequency
        });
    }, [isDialogOpen, currentChat, chatSettings, form]);

    // Submit handler updates the store and closes dialog
    const onSubmit = (data: FormValues) => {
        try {
            storeActions.updateLenseSettings(currentUser, {
                systemPrompt: data.systemPrompt,
                userPrompt: data.userPrompt,
                snapshotFrequency: data.snapshotFrequency
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
                        Configure your AI lense assistant settings here.
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
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="userPrompt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>User prompt</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your prompt"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="snapshotFrequency"
                            render={({
                                field: { value, onChange, ref, ...field }
                            }) => (
                                <FormItem>
                                    <FormControl>
                                        <SliderTooltip
                                            id="snapshotFrequency"
                                            min={0}
                                            max={10000}
                                            step={500}
                                            defaultValue={[value]}
                                            onValueChange={([val]) => onChange(val)}
                                            labelFor="snapshotFrequency"
                                            labelTitle="Snapshot Frequency (ms)"
                                            labelValue={value}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
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
                        disabled={!form.formState.isDirty}
                    >
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
