import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/settings')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="flex flex-col items-center h-full w-full">
            <div className="flex flex-col gap-6 items-center justify-center h-full pb-32">
                <h2 className="text-2xl md:text-3xl">Welcome to <b>Klave for AI</b></h2>
                <p className="text-center max-w-xl text-gray-500">Settings are not currently available</p>
            </div>
        </div>
    );
}
