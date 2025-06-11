import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/documents/')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="flex flex-col items-center h-full p-4">
            <div className="flex flex-col gap-6 items-center justify-center h-full">
                <h2 className="text-2xl md:text-4xl ">Select a set</h2>
            </div>
        </div>
    );
}
