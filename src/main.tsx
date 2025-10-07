import { createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { Toaster } from '@/components/ui/sonner';

// React Flow styles
import '@xyflow/react/dist/style.css';

import './styles.css';
import secretariumHandler from './lib/secretarium-handler.ts';
import reportWebVitals from './reportWebVitals.ts';
// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Initialize multiple SCP connections with different gateway configurations
secretariumHandler.initializeMultiple({
    'thranduil1:5035': import.meta.env.VITE_APP_SECRETARIUM_GATEWAYS_1,
    'gimli1:5036': import.meta.env.VITE_APP_SECRETARIUM_GATEWAYS_2,
    'gimli1:5037': import.meta.env.VITE_APP_SECRETARIUM_GATEWAYS_3,
    'klave-prod': import.meta.env.VITE_APP_SECRETARIUM_GATEWAYS_4
});
// Create a new router instance
const router = createRouter({
    routeTree,
    context: {},
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    /* eslint-disable ts/consistent-type-definitions */
    interface Register {
        router: typeof router;
    }
}

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <StrictMode>
            <RouterProvider router={router} />
            <Toaster />
        </StrictMode>
    );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
