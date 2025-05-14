import { createFileRoute } from '@tanstack/react-router';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent
} from '@/components/ui/sidebar';

export const Route = createFileRoute('/_auth/models')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="flex h-full">
            <Sidebar
                collapsible="none"
                className="hidden flex-1 md:flex max-w-[300px] border-r"
            >
                <SidebarHeader className="gap-3.5 border-b p-4">
                    <div className="flex w-full items-center justify-between">
                        Models
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup className="px-0">
                        <SidebarGroupContent>some content</SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
            content
        </div>
    );
}
