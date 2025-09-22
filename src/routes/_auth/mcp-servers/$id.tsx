import { createFileRoute } from '@tanstack/react-router';
import { CopyIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMcpServer } from '@/hooks/use-klave-ai-store';
import { copyToClipboard } from '@/lib/utils';

export const Route = createFileRoute('/_auth/mcp-servers/$id')({
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
            </div>
        </div>
    );
}
