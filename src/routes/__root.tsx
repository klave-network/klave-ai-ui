import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
    component: () => (
        <>
            <Outlet />
            {import.meta.env.NODE_ENV === 'development' && (
                <TanStackRouterDevtools position="bottom-right" />
            )}
        </>
    )
});
