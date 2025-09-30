import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { Cloud, File, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useKlaveDriveId, useRagDataSets } from '@/hooks/use-klave-ai-store';
import { truncateId } from '@/lib/utils';

export const Route = createFileRoute('/_auth/spaces')({
    component: RouteComponent
});

function RouteComponent() {
    const rags = useRagDataSets();
    const klaveDriveId = useKlaveDriveId();

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-28 px-4 border-b">
                <h2 className="font-owners font-medium tracking-wide text-xl">
                    Spaces
                </h2>
                <Button className="mx-4 hover:cursor-pointer" asChild>
                    <Link to="/spaces/new">
                        <Plus />
                        Create space
                    </Link>
                </Button>
            </div>
            <div className="flex h-full">
                <div className="flex flex-col divide-y w-[250px] border-r shrink-0">
                    <div className="flex flex-col p-4 gap-2">
                        <h3 className="text-sm text-gray-500 font-owners font-medium tracking-wide">
                            My Drive
                        </h3>
                        <Link
                            search
                            to="/spaces/drive"
                            className="border rounded-xl p-3 bg-sidebar text-sm flex gap-2 items-center hover:bg-sidebar-accent/80"
                        >
                            <div className="p-1 h-8 w-8 rounded-md text-white bg-kbl flex justify-center items-center">
                                <Cloud className="h-4" />
                            </div>
                            <span className="capitalize line-clamp-3">
                                Drive ID
                                <br />
                                <span className="text-xs text-gray-500">
                                    {truncateId(klaveDriveId ?? '')}
                                </span>
                            </span>
                        </Link>
                    </div>
                    <div className="flex flex-col p-4 gap-2">
                        <h3 className="text-sm text-gray-500 font-owners font-medium tracking-wide">
                            My Spaces
                        </h3>
                        {rags.length > 0
                            ? (
                                    rags.map(rag => (
                                        <Link
                                            search
                                            to="/spaces/$name"
                                            params={{ name: rag.rag_id }}
                                            key={rag.rag_id}
                                            activeProps={{
                                                className: 'bg-sidebar-accent'
                                            }}
                                            className="border rounded-xl p-3 bg-sidebar text-sm flex gap-2 items-center hover:bg-sidebar-accent/80"
                                        >
                                            <div className="p-1 h-8 w-8 rounded-md text-white bg-kbl flex justify-center items-center">
                                                <File className="h-4" />
                                            </div>
                                            <span className="capitalize line-clamp-3">
                                                {rag.table_name}
                                                <br />
                                                <span className="text-xs text-gray-500">
                                                    {rag.model_name}
                                                </span>
                                            </span>
                                        </Link>
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
