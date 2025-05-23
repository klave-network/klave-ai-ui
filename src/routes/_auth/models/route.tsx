import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent
} from '@/components/ui/sidebar';
import { useUserModels } from '@/store';
import { CUR_USER_KEY } from '@/lib/constants';

export const Route = createFileRoute('/_auth/models')({
    component: RouteComponent
});

function RouteComponent() {
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const models = useUserModels(currentUser);
    return (
        <div className="flex h-full">
            <Sidebar
                collapsible="none"
                className="hidden flex-1 md:flex max-w-[300px] border-r shrink-0"
            >
                <SidebarHeader className="gap-3.5 border-b p-4">
                    <div className="flex w-full items-center">
                        <h3 className="text-xl">Models</h3>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="p-0">
                        <SidebarGroupContent className="flex flex-col">
                            {models.map((model, id) => (
                                <Link
                                    to="/models/$name"
                                    params={{ name: model.name }}
                                    key={id}
                                    activeProps={{
                                        className: 'bg-sidebar-accent'
                                    }}
                                    className="border-b border-border p-4 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                    <span className="capitalize">
                                        {model.name}
                                    </span>
                                </Link>
                            ))}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <Outlet />
        </div>
    );
}
