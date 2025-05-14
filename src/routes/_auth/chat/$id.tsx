import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/chat/$id')({
    component: RouteComponent
});

function RouteComponent() {
    return <div>Hello "/_auth/chat/$id"!</div>;
}
