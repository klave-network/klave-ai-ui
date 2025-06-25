import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/data/')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="w-full h-full p-4">
            <div className="flex flex-col gap-6 items-center justify-center h-full">
                <h2 className="text-2xl md:text-3xl font-medium">
                    Select a data set
                </h2>
            </div>
        </div>
    );
}
