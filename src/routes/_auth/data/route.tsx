import { createFileRoute, Outlet, Link } from '@tanstack/react-router';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export const Route = createFileRoute('/_auth/data')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="flex h-full">
            <Sidebar
                collapsible="none"
                className="hidden flex-1 md:flex min-w-[300px] border-r shrink-0"
            >
                <SidebarHeader className="gap-3.5 border-b p-4">
                    <div className="flex w-full items-center">
                        <h3 className="text-xl font-medium">Data sets</h3>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="p-0">
                        <SidebarGroupContent className="flex flex-col">
                            data sets
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <Button className="mt-4 mx-4 hover:cursor-pointer" asChild>
                        <Link to="/data/new">
                            Upload file <Upload />
                        </Link>
                    </Button>
                </SidebarContent>
            </Sidebar>
            <Outlet />
        </div>
    );
}
