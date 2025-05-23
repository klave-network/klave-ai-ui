import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Logo } from '@/components/logo';

export const Route = createFileRoute('/login')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Logo />
                <Outlet />
            </div>
        </div>
    );
}
