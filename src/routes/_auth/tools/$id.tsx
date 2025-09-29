import { createFileRoute } from '@tanstack/react-router';
import { CopyIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        </div>
    );
}
