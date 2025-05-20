import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/models/')({
    component: RouteComponent
});

function RouteComponent() {
    return <div>Select a model</div>;
}
