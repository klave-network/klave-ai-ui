import { createFileRoute, Outlet } from '@tanstack/react-router';

import { DriveCard } from '@/components/sidebar-cards/drive-card';
import { SpaceCard } from '@/components/sidebar-cards/space-card';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useKlaveDriveId, useRagDataSets } from '@/hooks/use-klave-ai-store';

export const Route = createFileRoute('/_auth/spaces')({
    component: RouteComponent
});

function RouteComponent() {
    const rags = useRagDataSets();
    const klaveDriveId = useKlaveDriveId();

    return (
        <div className="flex flex-col h-full">
            <header className="px-4 border-b flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 flex-1">
                    <SidebarTrigger side="left" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <p className="font-owners font-medium tracking-wide text-lg">Spaces</p>
                </div>
            </header>
            <div className="flex h-full">
                <div className="flex flex-col divide-y w-[300px] border-r shrink-0">
                    <div className="flex flex-col p-3 gap-3">
                        <h3 className="text-sm text-gray-500 font-owners font-medium tracking-wide">
                            My Drive
                        </h3>
                        <DriveCard driveId={klaveDriveId ?? ''} />
                    </div>
                    <div className="flex flex-col p-3 gap-3">
                        <h3 className="text-sm text-gray-500 font-owners font-medium tracking-wide">
                            My Spaces
                        </h3>
                        {rags.length > 0
                            ? (
                                    rags.map(rag => (
                                        <SpaceCard
                                            key={rag.rag_id}
                                            ragId={rag.rag_id}
                                            tableName={rag.table_name}
                                            modelName={rag.model_name}
                                        />
                                    ))
                                )
                            : (
                                    <div className="text-sm italic text-gray-500">
                                        No data sets available
                                    </div>
                                )}
                    </div>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
