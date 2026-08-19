import { createInertiaApp } from '@inertiajs/react';
import { AnchoredToastProvider, ToastProvider } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SearchCommandLayout from '@/layouts/search-command-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function FlashToastListener() {
    useFlashToast();

    return null;
}

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
                return [SearchCommandLayout, AppLayout, SettingsLayout];
            default:
                return [SearchCommandLayout, AppLayout];
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

// This will set light / dark mode on load...
initializeTheme();
