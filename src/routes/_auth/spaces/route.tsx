import { createFileRoute, Outlet, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';
import { truncateId } from '@/lib/utils';
import { useUserRagDataSets } from '@/store';
import { CUR_USER_KEY } from '@/lib/constants';

export const Route = createFileRoute('/_auth/spaces')({
    component: RouteComponent
});

function RouteComponent() {
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const rags = useUserRagDataSets(currentUser);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-28 px-4 border-b">
                <b>Manage Spaces</b>
                <Button className="mx-4 hover:cursor-pointer" asChild>
                    <Link to="/spaces/new">
                        Upload files <Upload />
                    </Link>
                </Button>
            </div>
            <div className="flex h-full">
                <div className="flex flex-col w-[250px] border-r shrink-0">
                    <div className="h-12 p-4 text-xs border-b">
                        Available data spaces
                    </div>
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-3">
                        {rags ? (
                            rags.map((rag) => (
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
                        ) : (
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
