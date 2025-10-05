import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { Hammer, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMcpServers } from '@/hooks/use-klave-ai-store';

export const Route = createFileRoute('/_auth/mcp-servers')({
    component: RouteComponent
});

function RouteComponent() {
    const mcpServers = useMcpServers();

    return (
        <div className="flex flex-col h-full">
            <header className="px-4 border-b flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <SidebarTrigger />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <p className="font-owners font-medium tracking-wide text-lg">MCP Servers</p>
                <Button className="ml-auto hover:cursor-pointer" asChild>
                    <Link to="/tools/new">
                        <Plus />
                        New MCP Server
                    </Link>
                </Button>
            </header>
            <div className="flex h-full">
                <div className="flex flex-col w-[250px] border-r shrink-0">
                    <div className="h-12 p-4 text-sm border-b">
                        Available tools loaded
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
                                to="/tools/$id"
                                params={{ id: server.id }}
                                key={server.id}
                                activeProps={{
                                    className: 'bg-sidebar-accent'
                                }}
                                className="border rounded-xl p-3 bg-sidebar text-sm flex gap-2 items-center hover:bg-sidebar-accent/80"
                            >
                                <div className="p-1 h-8 w-8 rounded-md text-white bg-kbl flex justify-center items-center">
                                    <Hammer className="size-4" />
                                </div>
                                <span className="capitalize line-clamp-3">
                                    {server.name}
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        {server.description.brief}
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
