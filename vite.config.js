import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import viteMkcert from 'vite-plugin-mkcert';

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
        tanstackRouter({ autoCodeSplitting: true }),
        viteReact(),
        tailwindcss()
    ],
    server: {
        host,
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, '')
            }
        }
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
