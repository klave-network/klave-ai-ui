import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { LOC_KEY } from '@/lib/constants';
import secretariumHandler from '@/lib/secretarium-handler';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

const searchSchema = z.object({
    g: z.string().optional(),
    d: z.string().optional()
});

export const Route = createFileRoute('/_auth')({
    component: RouteComponent,
    validateSearch: zodValidator(searchSchema),
    beforeLoad: async () => {
        // if there are no user keys in localStorage, redirect to login page
        const userKeys = localStorage.getItem(LOC_KEY);
        if (!userKeys || !secretariumHandler.isConnected()) {
            throw redirect({ to: '/login' });
        }
    },
    pendingComponent: () => (
        <div className="min-h-screen grid place-items-center">
            <div className="flex items-center gap-2">
                <span>Loading...</span>
            </div>
        </div>
    ),
    errorComponent: ({ error }) => (
        <div className="min-h-screen w-full flex flex-col items-center justify-center gap-2 text-center">
            <h2 className="text-xl font-semibold">
                Oops! Something went wrong.
            </h2>
            <span className="max-w-[500px] border border-red-500 bg-red-100 rounded-lg p-4">
                {error instanceof Error
                    ? error.message
                    : 'An unknown error occurred'}
            </span>
        </div>
    )
});

function RouteComponent() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex flex-1 flex-col">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
