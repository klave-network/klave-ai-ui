import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { Puzzle } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLlModels, useVlModels } from '@/hooks/use-klave-ai-store';

export const Route = createFileRoute('/_auth/models')({
    component: RouteComponent
});

function RouteComponent() {
    // Fetch LL and VL models separately
    const llModels = useLlModels();
    const vlModels = useVlModels();

    // Combine both model lists
    const models = [...llModels, ...vlModels];

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
                <div className="flex flex-col w-[250px] border-r shrink-0">
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-3">
                        {models.length === 0 && (
                            <p className="text-gray-500 text-sm italic">
                                No models available.
                            </p>
                        )}
                        {models.map(model => (
                            <Link
                                search
                                to="/models/$name"
                                params={{ name: model.name }}
                                key={model.name}
                                activeProps={{
                                    className: 'bg-sidebar-accent'
                                }}
                                className="border rounded-xl p-3 bg-sidebar text-sm flex gap-2 items-center hover:bg-sidebar-accent/80"
                            >
                                <div className="p-1 h-8 w-8 rounded-md text-white bg-kbl flex justify-center items-center">
                                    <Puzzle className="h-4" />
                                </div>
                                <span className="capitalize line-clamp-3">
                                    {model.name}
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        {model.metadata.description.brief}
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
