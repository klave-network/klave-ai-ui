import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { Circle } from 'lucide-react';

export const Route = createFileRoute('/login')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Link
                    to="/"
                    className="flex items-center gap-2 self-center font-medium"
                >
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Circle className="size-4" />
                    </div>
                    Sanctum
                </Link>
                <Outlet />
            </div>
        </div>
    );
}
