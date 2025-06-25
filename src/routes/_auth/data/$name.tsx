import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/data/$name')({
    component: RouteComponent
});

function RouteComponent() {
    return <div>Hello "/_auth/data/$name"!</div>;
}
