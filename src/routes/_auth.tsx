import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { LOC_KEY } from '@/lib/constants';
import secretariumHandler from '@/lib/secretarium-handler';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { Logo } from '@/components/logo';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingDots } from '@/components/loading-dots';

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
        if (!userKeys) {
            throw redirect({ to: '/login' });
        }
        if (!secretariumHandler.isConnected()) {
            throw redirect({ to: '/login' });
        }
    },
    pendingComponent: () => (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-sidebar p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl mb-5 flex flex-col text-center justify-center">
                                <Logo className='mb-8' />
                                <span className='text-gray-400'>Loading</span><br />
                                <div className="flex flex-col justify-center items-center text-center mb-4">
                                    <LoadingDots />
                                </div>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    ),
    errorComponent: ({ error }) => (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-sidebar p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-xl mb-5 flex flex-col justify-center">
                                <Logo className='mb-8' />
                                <span className='text-gray-400'>Oops! Something went wrong</span><br />
                                <span className="block text-sm max-w-[500px] border border-red-500 bg-red-100 rounded-lg p-3">
                                    {error instanceof Error
                                        ? error.message
                                        : 'An unknown error occurred'}
                                </span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>
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
