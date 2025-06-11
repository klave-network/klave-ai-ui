import { createFileRoute, Outlet } from '@tanstack/react-router';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent
} from '@/components/ui/sidebar';
import { useFetch } from 'use-http';
import { CUR_USER_KEY } from '@/lib/constants';

export const Route = createFileRoute('/_auth/documents')({
    component: RouteComponent
});

function RouteComponent() {
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const filerUrl = import.meta.env.VITE_APP_KLAVE_AI_FILER;
    const { loading, error } = useFetch(`${filerUrl}/sets?user=${currentUser}`, {

    })

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading documents: {error.message}</div>;
    }

    return <div className="flex flex-col h-full">
        <div className='flex items-center h-28 px-5 border-b'>
            <b>Manage Documents</b>&nbsp;-&nbsp;Retreival Augmented Generation
        </div>
        <div className="flex h-full">
            <Sidebar
                collapsible="none"
                className="hidden flex-1 md:flex max-w-[300px] border-r shrink-0 bg-white"
            >
                <SidebarContent>
                    <SidebarGroup className="p-0">
                        <SidebarGroupContent className="flex flex-col">
                            {/* {Documents.map((Document, id) => (
                                <Link
                                    search
                                    to="/Documents/$name"
                                    params={{ name: Document.name }}
                                    key={id}
                                    activeProps={{
                                        className: 'bg-sidebar-accent'
                                    }}
                                    className="border-b border-border p-4 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                >
                                    <span className="capitalize">
                                        {Document.name}
                                    </span>
                                </Link>
                            ))} */}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            <Outlet />
        </div>
    </div>
}
