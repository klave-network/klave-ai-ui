import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useUserChatSettings } from '@/store';
import { CUR_USER_KEY } from '@/lib/constants';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const formSchema = z.object({
    system_prompt: z.string().min(1, 'System prompt is required'),
    temperature: z.number().min(0).max(1),
    topp: z.number().min(0).max(1),
    steps: z.number().min(256).max(1024),
    sliding_window: z.boolean(),
    useRag: z.boolean()
});

type FormValues = z.infer<typeof formSchema>;

export const SettingsModal = () => {
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const { systemPrompt, steps, slidingWindow, useRag, topp, temperature } =
        useUserChatSettings(currentUser);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            system_prompt: systemPrompt,
            temperature: temperature,
            topp: topp,
            steps: steps,
            sliding_window: slidingWindow,
            useRag: useRag
        }
    });

    return (
        <Dialog>
            <DialogTrigger asChild className="ml-auto">
                <Button
                    size="icon"
                    variant="outline"
                    className="hover:cursor-pointer"
                >
                    <Settings2 className="text-gray-500" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Customize</DialogTitle>
                    <DialogDescription>
                        Configure your settings here.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-4">
                        <FormField
                            control={form.control}
                            name="system_prompt"
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
                            name="temperature"
                            render={({ field }) => (
                                <FormItem>
                                    {/* <FormLabel>Temperature</FormLabel> */}
                                    <FormControl>
                                        <SliderTooltip
                                            id="temperature"
                                            min={0}
                                            max={2}
                                            step={0.01}
                                            showTooltip={true}
                                            defaultValue={[field.value]}
                                            labelFor="temperature"
                                            labelTitle="Temperature"
                                            labelValue={field.value}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="topp"
                            render={({ field }) => (
                                <FormItem>
                                    {/* <FormLabel>Top-p</FormLabel> */}
                                    <FormControl>
                                        <SliderTooltip
                                            id="topp"
                                            min={0}
                                            max={1}
                                            step={0.1}
                                            showTooltip={true}
                                            defaultValue={[field.value]}
                                            labelFor="topp"
                                            labelTitle="Top-p"
                                            labelValue={field.value}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="steps"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Steps</FormLabel>
                                    <FormControl>
                                        <Select
                                            defaultValue={field.value.toString()}
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    id="steps"
                                                    placeholder="Steps"
                                                />
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
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sliding Window</FormLabel>
                                    <FormControl>
                                        <Switch
                                            id="sliding-window"
                                            checked={field.value}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="useRag"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Use RAG document</FormLabel>
                                    <FormControl>
                                        <Switch
                                            id="use-rag-document"
                                            checked={field.value}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <DialogFooter>
                    <div className="grid gap-3">
                        <Label>Add new RAG document</Label>
                        Upload RAG document
                    </div>
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
