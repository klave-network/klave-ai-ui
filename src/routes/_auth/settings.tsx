import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/settings')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="flex flex-col items-center h-full">
            <div className="flex flex-col gap-6 items-center justify-center h-full">
                <h2 className="text-2xl md:text-4xl">
                    Welcome to Sanctum by Klave
                </h2>
                <p className="text-center max-w-xl">Manage your settings</p>
            </div>
        </div>
    );
}
