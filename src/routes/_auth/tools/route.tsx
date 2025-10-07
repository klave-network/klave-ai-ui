import { createFileRoute, Outlet } from '@tanstack/react-router';

import { NewMcpServerDialog } from '@/components/modals/new-mcp-server-dialog';
import { ToolCard } from '@/components/sidebar-cards/tool-card';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useMcpServers } from '@/hooks/use-klave-ai-store';

export const Route = createFileRoute('/_auth/tools')({
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
                <p className="font-owners font-medium tracking-wide text-lg">Tools</p>
                <NewMcpServerDialog />
            </header>
            <div className="flex h-full">
                <div className="flex flex-col w-[300px] border-r shrink-0">
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-3">
                        {mcpServers.length === 0 && (
                            <p className="text-gray-500 text-sm italic">
                                No tools available.
                            </p>
                        )}
                        {mcpServers.map(server => (
                            <ToolCard
                                key={server.id}
                                id={server.id}
                                name={server.name}
                                description={server.description.brief}
                            />
                        ))}
                    </div>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
