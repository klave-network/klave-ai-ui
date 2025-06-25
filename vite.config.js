import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import viteMkcert from 'vite-plugin-mkcert';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

const host = undefined;
// const host = 'demo.ai.ui.127.0.0.1.sslip.io';

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [
        viteMkcert({
            keyFileName: 'demo-ai-ui-dev-key.pem',
            certFileName: 'demo-ai-ui-dev-cert.pem',
            hosts: [host, 'localhost'].filter(Boolean)
        }),
        TanStackRouterVite({ autoCodeSplitting: true }),
        viteReact(),
        tailwindcss()
    ],
    server: {
        host
    },
    test: {
        globals: true,
        environment: 'jsdom'
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    }
});
