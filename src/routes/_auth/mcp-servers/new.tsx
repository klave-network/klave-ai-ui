import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { createMcpServer, getMcpServers } from '@/api/klave-ai-mcp-client';
import { Button } from '@/components/ui/button';
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

export const Route = createFileRoute('/_auth/mcp-servers/new')({
    component: RouteComponent
});

const formSchema = z.object({
    name: z.string().min(1, 'Server name is required'),
    description: z.string().min(1, 'Description is required'),
    url: z.string().url('Invalid URL'),
    apiKey: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

function RouteComponent() {
    const navigate = useNavigate();
    // Initialize react-hook-form with validation schema and default values
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            url: '',
            apiKey: ''
        }
    });

    const onSubmit = async (data: FormValues) => {
        try {
            const result = await createMcpServer({
                name: data.name,
                description: data.description,
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
            navigate({ to: `/mcp-servers/${result}`, search: true });
        }
        catch (error) {
            toast.error('Failed to add MCP server');
            console.error('Error adding MCP server:', error);
        }
    };

    return (
        <div className="p-4 flex flex-col gap-6 w-full">
            <h3 className="text-xl font-medium">New MCP server</h3>

            <Form {...form}>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                    id="mcp-server-form"
                >
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
                        name="description"
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
                                <FormLabel>API Key</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Enter API key"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        form="mcp-server-form"
                        disabled={!form.formState.isDirty}
                    >
                        Add server
                    </Button>
                </form>
            </Form>
        </div>
    );
}
