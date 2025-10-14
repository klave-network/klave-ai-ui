import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { createMcpServer, getMcpServers } from '@/api/klave-ai-mcp-client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { storeActions } from '@/store';

const formSchema = z.object({
    name: z.string().min(1, 'Server name is required'),
    brief: z.string().min(1, 'Description is required'),
    is_rag: z.boolean(),
    url: z.string().url('Invalid URL'),
    apiKey: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export function NewMcpServerDialog() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            brief: '',
            is_rag: false,
            url: '',
            apiKey: ''
        }
    });

    const onSubmit = async (data: FormValues) => {
        setIsProcessing(true);
        try {
            await createMcpServer({
                name: data.name,
                description: {
                    brief: data.brief,
                    is_rag: data.is_rag
                },
                url: data.url,
                auth_type: data.apiKey ? 'ApiKey' : 'None',
                auth_config: {
                    auth_type: data.apiKey ? 'ApiKey' : 'None',
                    token: data.apiKey || null,
                    username: null,
                    password: null
                },
                init_config: {
                    protocolVersion: '2024-11-05',
                    capabilities: {
                        roots: { list_changed: false },
                        sampling: {}
                    },
                    clientInfo: {
                        name: 'Klave Financial MCP Client',
                        version: '1.0.0'
                    }
                }
            });

            const mcpServers = await getMcpServers();
            storeActions.addMcpServers(mcpServers);
            toast.success('MCP server added successfully');
            form.reset();
            setOpen(false);
            navigate({ to: '/', search: true });
        }
        catch (error) {
            toast.error('Failed to add MCP server');
            console.error('Error adding MCP server:', error);
        }
        finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="ml-auto">
                    <Plus />
                    New MCP Server
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New MCP Server</DialogTitle>
                    <DialogDescription>
                        Create a new MCP server. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                        <div className="grid gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Server Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter MCP server name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="brief"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Server Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter MCP server description"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter MCP server URL"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="apiKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Key (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter API key"
                                                type="password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="is_rag"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="!mt-0">Uses RAG</FormLabel>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" disabled={isProcessing} type="button">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isProcessing || !form.formState.isDirty}>
                                {isProcessing ? 'Creating...' : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
