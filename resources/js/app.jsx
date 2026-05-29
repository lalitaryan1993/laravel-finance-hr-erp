import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Toaster } from 'react-hot-toast';

const appName = import.meta.env.VITE_APP_NAME || 'AI-FMS';

createInertiaApp({
    title: (title) => `${title} — ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <App {...props} />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'hsl(var(--card))',
                            color: 'hsl(var(--card-foreground))',
                            border: '1px solid hsl(var(--border))',
                        },
                    }}
                />
            </>,
        );
    },
    progress: {
        color: '#3b82f6',
        showSpinner: true,
    },
});
