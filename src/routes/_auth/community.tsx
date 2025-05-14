import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/community')({
    component: RouteComponent
});

function RouteComponent() {
    return <div>Hello "/_auth/community"!</div>;
}
