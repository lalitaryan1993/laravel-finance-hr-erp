import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { tmpdir } from 'os';

export default defineConfig({
    cacheDir: resolve(tmpdir(), 'vite-ai-fms'),
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
            '~': resolve(__dirname, 'resources'),
        },
    },
    server: {
        host: 'localhost',
        port: 5173,
        hmr: { host: 'localhost' },
        watch: { ignored: ['**/storage/framework/views/**'] },
    },
});
