import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    CircleUserRound,
    Compass,
    Home as HomeIcon,
    LibraryBig,
    Search,
} from 'lucide-react';
import { useSearchCommand } from '@/components/search-command';
import { Button } from '@/components/ui/button';
import { Menu, MenuPopup, MenuTrigger } from '@/components/ui/menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { home } from '@/routes';
import type { Auth } from '@/types';

const toolbarItems = [
    { icon: HomeIcon, label: 'Accueil' },
    { icon: Compass, label: 'Découvrir' },
    { icon: CalendarDays, label: 'Calendrier' },
    { icon: Search, label: 'Rechercher' },
    { icon: LibraryBig, label: 'Bibliothèque' },
    { icon: CircleUserRound, label: 'Profil' },
];

export function FloatingToolbar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { component } = usePage();
    const { openSearchCommand } = useSearchCommand();
    const isSettings = component.startsWith('settings/');

    return (
        <nav
            aria-label="Navigation principale"
            className="fixed bottom-5 left-1/2 z-20 -translate-x-1/2 sm:bottom-7 sm:left-7 sm:translate-x-0"
        >
            <div className="dark flex items-center gap-1 rounded-2xl border-white/10 bg-neutral-950/85 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                {toolbarItems.map(({ icon: Icon, label }) => {
                    if (label === 'Profil') {
                        return (
                            <Menu key={label}>
                                <MenuTrigger
                                    render={
                                        <Button
                                            aria-current={
                                                isSettings ? 'page' : undefined
                                            }
                                            aria-label={label}
                                            size="icon-lg"
                                            variant={
                                                isSettings ? 'glass' : 'ghost'
                                            }
                                        />
                                    }
                                >
                                    <Icon aria-hidden="true" />
                                    <span className="sr-only">{label}</span>
                                </MenuTrigger>
                                <MenuPopup
                                    align="end"
                                    className="dark min-w-56 rounded-2xl border-white/10 bg-neutral-950/90 text-white shadow-2xl shadow-black/30 backdrop-blur-xl"
                                    side="top"
                                    sideOffset={12}
                                >
                                    <UserMenuContent user={auth.user} />
                                </MenuPopup>
                            </Menu>
                        );
                    }

                    if (label === 'Accueil') {
                        return (
                            <Button
                                aria-label={label}
                                key={label}
                                render={<Link href={home()} prefetch />}
                                size="icon-lg"
                                variant={
                                    component === 'home' ? 'glass' : 'ghost'
                                }
                            >
                                <Icon aria-hidden="true" />
                                <span className="sr-only">{label}</span>
                            </Button>
                        );
                    }

                    return (
                        <Button
                            aria-label={label}
                            key={label}
                            onClick={
                                label === 'Rechercher'
                                    ? openSearchCommand
                                    : undefined
                            }
                            size="icon-lg"
                            variant="ghost"
                        >
                            <Icon aria-hidden="true" />
                            <span className="sr-only">{label}</span>
                        </Button>
                    );
                })}
            </div>
        </nav>
    );
}
