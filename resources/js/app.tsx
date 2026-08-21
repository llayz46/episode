import { createInertiaApp } from '@inertiajs/react';
import { AnchoredToastProvider, ToastProvider } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AuthLayout from '@/layouts/auth-layout';
import SearchCommandLayout from '@/layouts/search-command-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

declare global {
    interface Window {
        episodeInertiaStarted?: boolean;
    }
}

function FlashToastListener() {
    useFlashToast();

    return null;
}

if (!window.episodeInertiaStarted) {
    window.episodeInertiaStarted = true;

    createInertiaApp({
        title: (title) => (title ? `${title} - ${appName}` : appName),
        layout: (name) => {
            switch (true) {
                case name === 'home':
                    return SearchCommandLayout;
                case name === 'auth/login':
                    return null;
                case name.startsWith('auth/'):
                    return [SearchCommandLayout, AuthLayout];
                case name.startsWith('settings/'):
                    return [SearchCommandLayout, SettingsLayout];
                default:
                    return SearchCommandLayout;
            }
        },
        strictMode: true,
        withApp(app) {
            return (
                <TooltipProvider>
                    <ToastProvider>
                        <AnchoredToastProvider>
                            {app}
                            <FlashToastListener />
                        </AnchoredToastProvider>
                    </ToastProvider>
                </TooltipProvider>
            );
        },
        progress: {
            color: '#4B5563',
        },
    });

    initializeTheme();
}
