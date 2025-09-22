import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

import { MCPIcon } from '@/components/mcp-icon';
import { useMcpServers } from '@/hooks/use-klave-ai-store';

export const Route = createFileRoute('/_auth/mcp-servers')({
    component: RouteComponent
});

function RouteComponent() {
    const mcpServers = useMcpServers();
    console.log(mcpServers);
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center h-28 px-4 border-b">
                <p className="font-owners font-medium tracking-wide text-xl">Manage MCP Servers</p>
            </div>
            <div className="flex h-full">
                <div className="flex flex-col w-[250px] border-r shrink-0">
                    <div className="h-12 p-4 text-sm border-b">
                        Available servers loaded
                    </div>
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-3">
                        {mcpServers.length === 0 && (
                            <p className="text-gray-500 text-sm italic">
                                No servers available.
                            </p>
                        )}
                        {mcpServers.map(server => (
                            <Link
                                search
                                to="/mcp-servers/$id"
                                params={{ id: server.id }}
                                key={server.id}
                                activeProps={{
                                    className: 'bg-sidebar-accent'
                                }}
                                className="border rounded-xl p-3 bg-sidebar text-sm flex gap-2 items-center hover:bg-sidebar-accent/80"
                            >
                                <div className="p-1 h-8 w-8 rounded-md text-white bg-kbl flex justify-center items-center">
                                    <MCPIcon className="h-4" />
                                </div>
                                <span className="capitalize line-clamp-3">
                                    {server.name}
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        {server.description}
                                    </span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
