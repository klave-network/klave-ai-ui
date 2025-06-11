import { createFileRoute, Outlet } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

const searchSchema = z.object({
    g: z.string().optional(),
    d: z.string().optional()
});

export const Route = createFileRoute('/login')({
    validateSearch: zodValidator(searchSchema),
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-sidebar p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Outlet />
            </div>
        </div>
    );
}
