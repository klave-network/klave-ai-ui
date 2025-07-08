import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { useUserModels } from '@/store';
import { CUR_USER_KEY } from '@/lib/constants';
import { Puzzle } from 'lucide-react';

export const Route = createFileRoute('/_auth/models')({
    component: RouteComponent
});

function RouteComponent() {
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const models = useUserModels(currentUser);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center h-28 px-5 border-b">
                <b>Manage Models</b>
            </div>
            <div className="flex h-full">
                <div className="flex flex-col w-[250px] border-r shrink-0">
                    <div className="h-12 p-4 text-xs border-b">
                        Available models loaded
                    </div>
                    <div className="flex flex-col gap-3 flex-1 overflow-y-auto p-3">
                        {models.map((model) => (
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
                                        {model.description.brief}
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
