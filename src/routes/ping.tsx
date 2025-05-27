import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

const searchSchema = z.object({
    g: z.string().optional(),
    d: z.string().optional()
});

export const Route = createFileRoute('/ping')({
    validateSearch: zodValidator(searchSchema),
    component: RouteComponent
});

function RouteComponent() {
    return <div>Hello "/ping"!</div>;
}
