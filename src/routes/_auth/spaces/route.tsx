import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { File, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useRagDataSets } from '@/hooks/use-klave-ai-store';

export const Route = createFileRoute('/_auth/spaces')({
    component: RouteComponent
});

function RouteComponent() {
    const rags = useRagDataSets();

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-28 px-4 border-b">
                <p className="font-owners font-medium tracking-wide text-xl">
                    Manage Spaces
                </p>
                <Button className="mx-4 hover:cursor-pointer" asChild>
                    <Link to="/spaces/new">
                        Create space
                        {' '}
                        <Plus />
                    </Link>
                </Button>
            </div>
            <div className="flex h-full">
                <div className="flex flex-col w-[250px] border-r shrink-0">
                    <div className="h-12 p-4 text-sm border-b">
                        Available data spaces
                    </div>
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-3">
                        {rags
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
                                    <div className="text-center text-gray-500">
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
