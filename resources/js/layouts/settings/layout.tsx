import { Link } from '@inertiajs/react';
import { MonitorCog, ShieldCheck, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const settingsNavItems: NavItem[] = [
    {
        title: 'Profil',
        href: edit(),
        icon: UserRound,
    },
    {
        title: 'Sécurité',
        href: editSecurity(),
        icon: ShieldCheck,
    },
    {
        title: 'Apparence',
        href: editAppearance(),
        icon: MonitorCog,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 lg:py-14">
            <header className="max-w-2xl">
                <p className="text-sm text-muted-foreground">Mon espace</p>
                <h1 className="mt-1 font-heading text-4xl font-semibold tracking-[-0.05em]">
                    Réglages
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Gérez votre profil, la sécurité de votre compte et
                    l’apparence d’Episode.
                </p>
            </header>

            <nav
                aria-label="Réglages"
                className="mt-8 flex w-full gap-1 rounded-2xl border bg-card/60 p-1 sm:w-fit"
            >
                {settingsNavItems.map((item, index) => (
                    <Button
                        aria-current={
                            isCurrentOrParentUrl(item.href) ? 'page' : undefined
                        }
                        key={`${toUrl(item.href)}-${index}`}
                        size="sm"
                        variant={
                            isCurrentOrParentUrl(item.href)
                                ? 'secondary'
                                : 'ghost'
                        }
                        render={<Link href={item.href} />}
                    >
                        {item.icon && <item.icon aria-hidden="true" />}
                        {item.title}
                    </Button>
                ))}
            </nav>

            <section className="mt-8 flex max-w-2xl flex-col gap-5 [&>div]:rounded-2xl [&>div]:border [&>div]:bg-card/60 [&>div]:p-6 [&>div]:shadow-xs/5 sm:[&>div]:p-7">
                {children}
            </section>
        </div>
    );
}
