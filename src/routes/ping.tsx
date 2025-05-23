import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ping')({
    component: RouteComponent
});

function RouteComponent() {
    return <div>Hello "/ping"!</div>;
}
