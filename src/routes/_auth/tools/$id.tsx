import { createFileRoute } from '@tanstack/react-router';
import { CopyIcon, Hammer, Layers } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMcpServer } from '@/hooks/use-klave-ai-store';
import { copyToClipboard } from '@/lib/utils';

export const Route = createFileRoute('/_auth/tools/$id')({
    component: RouteComponent
});

function RouteComponent() {
    const { id } = Route.useParams();
    const mcpServer = useMcpServer(id);

    if (!mcpServer)
        return <div className="p-4">Loading MCP server details...</div>;

    return (
        <div className="space-y-2 w-full">
            <div className="h-12 p-4 font-bold capitalize">
                {mcpServer.name}
            </div>

            {/* MCP Server Information Section */}
            <div className="space-y-2">
                <div className="p-4 space-y-2">
                    <Label>MCP Server ID</Label>
                    <div className="flex items-center gap-2">
                        <Input disabled value={mcpServer.id} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 hover:cursor-pointer"
                            onClick={() =>
                                copyToClipboard(mcpServer.id, 'MCP Server ID')}
                        >
                            <CopyIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Copy MCP Server ID</span>
                        </Button>
                    </div>
                </div>

                <div className="p-4 space-y-2">
                    <Label>MCP Server URL</Label>
                    <div className="flex items-center gap-2">
                        <Input disabled value={mcpServer.url} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 hover:cursor-pointer"
                            onClick={() =>
                                copyToClipboard(mcpServer.url, 'MCP Server URL')}
                        >
                            <CopyIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Copy MCP Server URL</span>
                        </Button>
                    </div>
                </div>

                <div className="p-4 space-y-2">
                    <Label>MCP Server Description</Label>
                    <div className="flex items-center gap-2">
                        <Input disabled value={mcpServer.description.brief} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 hover:cursor-pointer"
                            onClick={() =>
                                copyToClipboard(mcpServer.description.brief, 'MCP Server Description')}
                        >
                            <CopyIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Copy MCP Server Description</span>
                        </Button>
                    </div>
                </div>

                <div className="p-4 flex gap-2">
                    <div className="flex items-center gap-2">
                        <Checkbox disabled checked={mcpServer.description.is_rag} />
                    </div>
                    <Label>RAG Mode</Label>
                </div>
            </div>

            <Separator className="my-4" />

            {/* Tools Section */}
            <div className="space-y-2">
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        {mcpServer.description.is_rag ? <Layers className="size-4" /> : <Hammer className="size-4" />}
                        <h3 className="font-semibold text-lg">
                            Available
                            {mcpServer.description.is_rag ? 'Spaces' : 'Tools'}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                            (
                            {mcpServer.tools.length}
                            )
                        </span>
                    </div>

                    {mcpServer.tools.length === 0
                        ? (
                                <div className="text-sm text-gray-500 italic">
                                    No tools available for this server
                                </div>
                            )
                        : (
                                <div className="space-y-3">
                                    {mcpServer.tools.map((tool, index) => (
                                        <div
                                            key={`${tool.name}-${index}`}
                                            className="border rounded-lg p-4 space-y-2 hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 space-y-1">
                                                    <div className="font-mono text-sm font-medium">
                                                        {tool.name}
                                                    </div>
                                                    {tool.description && (
                                                        <div className="text-sm text-muted-foreground line-clamp-3 [&>p]:inline [&_a]:text-klave-blue [&_a]:hover:underline">
                                                            <ReactMarkdown>{tool.description}</ReactMarkdown>
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-6 hover:cursor-pointer shrink-0"
                                                    onClick={() =>
                                                        copyToClipboard(tool.name, 'Tool name')}
                                                >
                                                    <CopyIcon className="h-3.5 w-3.5" />
                                                    <span className="sr-only">Copy tool name</span>
                                                </Button>
                                            </div>
                                            {tool.inputSchema && (
                                                <details className="text-xs">
                                                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                                        View input schema
                                                    </summary>
                                                    <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto whitespace-pre-wrap break-words max-w-full">
                                                        {JSON.stringify(tool.inputSchema, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                </div>
            </div>
        </div>
    );
}
