import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/mcp-servers/')({
    component: RouteComponent
});

function RouteComponent() {
    return <div>Hello "/_auth/mcp-servers/"!</div>;
}
