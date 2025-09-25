import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/chat/agent/')({
    component: RouteComponent
});

function RouteComponent() {
    return <div>Hello "/_auth/chat/agent/"!</div>;
}
