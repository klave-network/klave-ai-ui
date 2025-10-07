import { createFileRoute, Outlet } from '@tanstack/react-router';

import { ModelCard } from '@/components/sidebar-cards/model-card';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLlModels, useMcpModels, useVlModels } from '@/hooks/use-klave-ai-store';

export const Route = createFileRoute('/_auth/models')({
    component: RouteComponent
});

function RouteComponent() {
    // Fetch LL and VL models separately
    const llModels = useLlModels();
    const vlModels = useVlModels();
    const mcpModels = useMcpModels();

    // Combine both model lists
    const models = [...llModels, ...vlModels, ...mcpModels];

    return (
        <div className="flex flex-col h-full">
            <header className="px-4 border-b flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <SidebarTrigger />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <p className="font-owners font-medium tracking-wide text-lg">Models</p>
            </header>
            <div className="flex h-full">
                <div className="flex flex-col w-[300px] border-r shrink-0">
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-3">
                        {models.length === 0 && (
                            <p className="text-gray-500 text-sm italic">
                                No models available.
                            </p>
                        )}
                        {models.map(model => (
                            <ModelCard
                                key={model.name}
                                name={model.name}
                                description={model.metadata.description.brief}
                            />
                        ))}
                    </div>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
