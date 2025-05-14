import { createFileRoute, Outlet } from '@tanstack/react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export const Route = createFileRoute('/_auth')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex flex-1 flex-col gap-4">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
