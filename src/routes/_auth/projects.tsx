import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/projects')({
    component: RouteComponent
});

function RouteComponent() {
    return <div>Hello "/_auth/projects"!</div>;
}
