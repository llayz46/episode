import { Head } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    ChevronRight,
    CircleUserRound,
    Compass,
    Home as HomeIcon,
    LibraryBig,
    Play,
    Search,
    Sparkles,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const bingeReady = [
    {
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80',
        title: 'Severance',
        subtitle: 'Saison 2',
    },
    {
        image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=700&q=80',
        title: 'The Last of Us',
        subtitle: 'Saison 2',
    },
    {
        image: 'https://images.unsplash.com/photo-1586899028174-e7098604235b?auto=format&fit=crop&w=700&q=80',
        title: 'Andor',
        subtitle: 'Saison 2',
    },
    {
        image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=700&q=80',
        title: 'The Bear',
        subtitle: 'Saison 4',
    },
    {
        image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80',
        title: 'Shōgun',
        subtitle: 'Saison 1',
    },
];

const upcomingReleases = [
    {
        date: 'Ven. 22',
        title: 'Silo',
        episode: 'S3E07',
        image: bingeReady[0].image,
    },
    {
        date: 'Lun. 25',
        title: 'Alien: Earth',
        episode: 'S1E04',
        image: bingeReady[1].image,
    },
    {
        date: 'Jeu. 28',
        title: 'The Thursday Murder Club',
        episode: 'Film · VOD',
        image: bingeReady[2].image,
    },
];

const navigationItems = [
    { icon: HomeIcon, label: 'Accueil', active: true },
    { icon: Compass, label: 'Découvrir' },
    { icon: CalendarDays, label: 'Calendrier' },
    { icon: Search, label: 'Rechercher' },
    { icon: LibraryBig, label: 'Bibliothèque' },
    { icon: CircleUserRound, label: 'Profil' },
];

export function Home() {
    return (
        <>
            <Head title="Accueil" />
            <ScrollArea className="h-dvh bg-background [&_[data-slot=scroll-area-scrollbar]]:opacity-80 [&_[data-slot=scroll-area-scrollbar]]:delay-0 [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-2 [&_[data-slot=scroll-area-thumb]]:bg-foreground/50">
                <main className="min-h-screen bg-black text-foreground">
                    <section className="relative min-h-screen overflow-hidden">
                        <section
                            aria-labelledby="featured-title"
                            className="relative min-h-screen overflow-hidden bg-neutral-950 text-white"
                        >
                            <img
                                alt="Paysage montagneux sous une lumière froide"
                                className="absolute inset-0 size-full object-cover object-center opacity-70"
                                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=90"
                            />
                            <div className="absolute inset-0 bg-linear-to-r from-black via-black/45 to-transparent" />
                            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/30" />

                            <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
                                <AppLogo className="text-white" />
                                <div className="mt-auto flex max-w-xl flex-col gap-6 pb-28 sm:pb-36">
                                    <div className="flex items-center gap-2 text-sm text-white/65">
                                        <Sparkles
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                        À regarder plus tard
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <p className="text-sm font-medium tracking-[0.18em] text-white/60 uppercase">
                                            Apple TV+ · 2025
                                        </p>
                                        <h1
                                            id="featured-title"
                                            className="font-heading text-6xl font-semibold tracking-[-0.08em] sm:text-8xl"
                                        >
                                            SILO
                                        </h1>
                                        <p className="max-w-md text-base leading-7 text-white/70">
                                            Il reste quatre semaines avant que
                                            la saison soit prête à être dévorée
                                            d’une traite.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            className="rounded-full bg-white px-6 text-black hover:bg-white/90"
                                            size="lg"
                                        >
                                            <Play
                                                aria-hidden="true"
                                                className="fill-current"
                                            />
                                            Voir le suivi
                                        </Button>
                                        <Button
                                            className="rounded-full border-white/15 bg-white/10 px-6 text-white hover:bg-white/20"
                                            size="lg"
                                            variant="outline"
                                        >
                                            <Bell aria-hidden="true" />
                                            Me prévenir
                                        </Button>
                                    </div>
                                </div>
                                <div className="absolute right-5 bottom-5 left-5 flex gap-3 overflow-x-auto sm:right-8 sm:bottom-8 sm:left-auto sm:w-[34rem] lg:right-12 lg:bottom-10">
                                    {[
                                        {
                                            image: bingeReady[3].image,
                                            subtitle: 'Saison complète',
                                            title: 'The Bear',
                                        },
                                        {
                                            image: bingeReady[0].image,
                                            subtitle: 'À reprendre · E04',
                                            title: 'Severance',
                                        },
                                        {
                                            image: bingeReady[2].image,
                                            subtitle: 'Saison 2',
                                            title: 'Andor',
                                        },
                                    ].map((show) => (
                                        <article
                                            className="w-36 shrink-0 rounded-2xl border border-white/10 bg-black/55 p-2 text-white backdrop-blur-xl"
                                            key={show.title}
                                        >
                                            <img
                                                alt={`Poster de ${show.title}`}
                                                className="aspect-[1.35] w-full rounded-xl object-cover"
                                                src={show.image}
                                            />
                                            <h2 className="mt-2 truncate text-sm font-medium">
                                                {show.title}
                                            </h2>
                                            <p className="truncate text-xs text-white/55">
                                                {show.subtitle}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </section>

                    <div className="rounded-t-[2rem] bg-background pt-10 pb-28 sm:rounded-t-[2.5rem] sm:pt-12 sm:pb-8">
                        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-14 px-5 sm:px-8 lg:px-12">
                            <section
                                aria-labelledby="binge-ready-title"
                                className="flex flex-col gap-5"
                            >
                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            À commencer sans attendre
                                        </p>
                                        <h2
                                            id="binge-ready-title"
                                            className="font-heading text-2xl font-semibold tracking-[-0.04em]"
                                        >
                                            Prêtes à binge
                                        </h2>
                                    </div>
                                    <Button
                                        className="rounded-full"
                                        size="sm"
                                        variant="ghost"
                                    >
                                        Tout voir
                                        <ChevronRight aria-hidden="true" />
                                    </Button>
                                </div>
                                <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
                                    {bingeReady.map((show) => (
                                        <article
                                            className="group w-36 shrink-0 snap-start sm:w-44"
                                            key={show.title}
                                        >
                                            <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted">
                                                <img
                                                    alt={`Poster de ${show.title}`}
                                                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                                                    src={show.image}
                                                />
                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />
                                                <span className="absolute right-2 bottom-2 rounded-full bg-white/90 px-2.5 py-1 text-[0.68rem] font-semibold text-black backdrop-blur-sm">
                                                    Complète
                                                </span>
                                            </div>
                                            <h3 className="mt-3 truncate font-medium">
                                                {show.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {show.subtitle}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            </section>

                            <section
                                aria-labelledby="upcoming-title"
                                className="grid gap-6 pb-8 lg:grid-cols-[minmax(0,1fr)_360px]"
                            >
                                <div className="flex flex-col gap-5">
                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Les sept prochains jours
                                            </p>
                                            <h2
                                                id="upcoming-title"
                                                className="font-heading text-2xl font-semibold tracking-[-0.04em]"
                                            >
                                                Prochaines sorties
                                            </h2>
                                        </div>
                                        <Button
                                            className="rounded-full"
                                            size="sm"
                                            variant="ghost"
                                        >
                                            Calendrier
                                            <ChevronRight aria-hidden="true" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col divide-y rounded-2xl border bg-card/40 px-5">
                                        {upcomingReleases.map((release) => (
                                            <article
                                                className="flex items-center gap-4 py-4"
                                                key={`${release.title}-${release.episode}`}
                                            >
                                                <time className="w-14 shrink-0 text-sm font-medium text-muted-foreground tabular-nums">
                                                    {release.date}
                                                </time>
                                                <img
                                                    alt=""
                                                    className="size-11 rounded-xl object-cover"
                                                    src={release.image}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate font-medium">
                                                        {release.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {release.episode}
                                                    </p>
                                                </div>
                                                <ChevronRight
                                                    aria-hidden="true"
                                                    className="size-4 text-muted-foreground"
                                                />
                                            </article>
                                        ))}
                                    </div>
                                </div>
                                <aside className="flex flex-col justify-end rounded-2xl bg-muted/60 p-6">
                                    <p className="text-sm text-muted-foreground">
                                        Cette semaine
                                    </p>
                                    <p className="mt-2 font-heading text-4xl font-semibold tracking-[-0.05em]">
                                        3 sorties
                                    </p>
                                    <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                                        La saison de Silo sera entièrement
                                        disponible dans 21 jours.
                                    </p>
                                </aside>
                            </section>
                        </div>
                    </div>
                </main>
            </ScrollArea>

            <nav
                aria-label="Navigation principale"
                className="fixed bottom-5 left-1/2 z-20 -translate-x-1/2 sm:bottom-7 sm:left-7 sm:translate-x-0"
            >
                <div
                    className={cn(
                        'flex items-center gap-1 p-1.5 text-white shadow-2xl shadow-black/30 backdrop-blur-xl',
                        'rounded-2xl border-white/10 bg-neutral-950/85',
                    )}
                >
                    {navigationItems.map(({ active, icon: Icon, label }) => (
                        <Button
                            aria-label={label}
                            className={cn(
                                'rounded-xl text-white/60 hover:bg-white/10 hover:text-white',
                                active &&
                                    'bg-white/12 text-white hover:bg-white/16',
                            )}
                            key={label}
                            size="icon-lg"
                            variant="ghost"
                        >
                            <Icon aria-hidden="true" />
                            <span className="sr-only">{label}</span>
                        </Button>
                    ))}
                </div>
            </nav>
        </>
    );
}
