import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/templates')({
    component: RouteComponent
});

function RouteComponent() {
    return <div>Hello "/_auth/templates"!</div>;
}
