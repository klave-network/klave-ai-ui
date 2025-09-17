import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/spaces/')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="w-full h-full p-4">
            <div className="flex flex-col gap-6 items-center justify-center h-full pb-32">
                <h2 className="text-2xl md:text-3xl">
                    Welcome to
                    {' '}
                    <b>Klave AI</b>
                </h2>
                <p className="text-center max-w-xl text-gray-500">
                    Select a space
                </p>
            </div>
        </div>
    );
}
