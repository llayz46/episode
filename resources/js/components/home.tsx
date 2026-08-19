import { Head } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    ChevronRight,
    CircleCheck,
    CircleUserRound,
    Compass,
    Home as HomeIcon,
    LibraryBig,
    Play,
    Search,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { MediaDrawer  } from '@/components/media-drawer';
import type {MediaDrawerItem} from '@/components/media-drawer';
import { useSearchCommand } from '@/components/search-command';
import { Button } from '@/components/ui/button';
import {
    Progress,
    ProgressIndicator,
    ProgressTrack,
} from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const featuredMedia: MediaDrawerItem = {
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=90',
    kind: 'series',
    nextEpisode: 'Prochain épisode · Vendredi 22 août',
    platform: 'Apple TV+',
    releasedEpisodes: 6,
    seasonComplete: '12 septembre',
    status: 'airing',
    subtitle: 'Saison 3',
    title: 'Silo',
    totalEpisodes: 10,
    year: '2025',
};

const bingeReady: MediaDrawerItem[] = [
    {
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=700&q=80',
        kind: 'series',
        platform: 'Apple TV+',
        status: 'binge-ready',
        title: 'Severance',
        subtitle: 'Saison 2 · 10 épisodes',
        totalEpisodes: 10,
        year: '2025',
    },
    {
        image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=700&q=80',
        kind: 'series',
        platform: 'Max',
        status: 'binge-ready',
        title: 'The Last of Us',
        subtitle: 'Saison 2 · 7 épisodes',
        totalEpisodes: 7,
        year: '2025',
    },
    {
        image: 'https://images.unsplash.com/photo-1586899028174-e7098604235b?auto=format&fit=crop&w=700&q=80',
        kind: 'series',
        platform: 'Disney+',
        status: 'binge-ready',
        title: 'Andor',
        subtitle: 'Saison 2 · 12 épisodes',
        totalEpisodes: 12,
        year: '2025',
    },
    {
        image: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=700&q=80',
        kind: 'series',
        platform: 'Disney+',
        status: 'binge-ready',
        title: 'The Bear',
        subtitle: 'Saison 4 · 10 épisodes',
        totalEpisodes: 10,
        year: '2025',
    },
    {
        image: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80',
        kind: 'series',
        platform: 'Disney+',
        status: 'binge-ready',
        title: 'Shōgun',
        subtitle: 'Saison 1 · 10 épisodes',
        totalEpisodes: 10,
        year: '2024',
    },
];

const upcomingReleases = [
    {
        date: 'Ven. 22',
        title: 'Silo',
        episode: 'S3E07',
        image: featuredMedia.image,
        media: featuredMedia,
    },
    {
        date: 'Lun. 25',
        title: 'Alien: Earth',
        episode: 'S1E04',
        image: bingeReady[1].image,
        media: {
            image: bingeReady[1].image,
            kind: 'series' as const,
            nextEpisode: 'Prochain épisode · Lundi 25 août',
            platform: 'Disney+',
            releasedEpisodes: 4,
            seasonComplete: '22 septembre',
            status: 'airing' as const,
            subtitle: 'Saison 1',
            title: 'Alien: Earth',
            totalEpisodes: 8,
            year: '2025',
        },
    },
    {
        date: 'Jeu. 28',
        title: 'The Thursday Murder Club',
        episode: 'Film · VOD',
        image: bingeReady[2].image,
        media: {
            image: bingeReady[2].image,
            kind: 'film' as const,
            platform: 'Netflix',
            status: 'binge-ready' as const,
            subtitle: 'Film · Disponible en VOD',
            title: 'The Thursday Murder Club',
            year: '2025',
        },
    },
];

const weekDays = [
    { day: 'Ven', date: '22', hasRelease: true },
    { day: 'Sam', date: '23', hasRelease: false },
    { day: 'Dim', date: '24', hasRelease: false },
    { day: 'Lun', date: '25', hasRelease: true },
    { day: 'Mar', date: '26', hasRelease: false },
    { day: 'Mer', date: '27', hasRelease: false },
    { day: 'Jeu', date: '28', hasRelease: true },
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
    const { openSearchCommand } = useSearchCommand();
    const [selectedMedia, setSelectedMedia] = useState<MediaDrawerItem | null>(
        null,
    );

    return (
        <>
            <Head title="Accueil" />
            <ScrollArea className="h-dvh bg-background [&_[data-slot=scroll-area-scrollbar]]:opacity-80 [&_[data-slot=scroll-area-scrollbar]]:delay-0 [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-2 [&_[data-slot=scroll-area-thumb]]:bg-foreground/50">
                <main className="min-h-screen bg-black text-foreground">
                    <section className="relative min-h-screen overflow-hidden">
                        <section
                            aria-labelledby="featured-title"
                            className="dark relative min-h-screen overflow-hidden bg-neutral-950 text-white"
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
                                            onClick={() =>
                                                setSelectedMedia(featuredMedia)
                                            }
                                        >
                                            <Play
                                                aria-hidden="true"
                                                className="fill-current"
                                            />
                                            Voir le suivi
                                        </Button>
                                        <Button variant="secondary">
                                            <Bell aria-hidden="true" />
                                            Me prévenir
                                        </Button>
                                    </div>
                                </div>
                                <div className="absolute right-5 bottom-5 left-5 flex gap-3 overflow-x-auto sm:right-8 sm:bottom-8 sm:left-auto sm:w-[34rem] lg:right-12 lg:bottom-10">
                                    {[
                                        bingeReady[3],
                                        bingeReady[0],
                                        bingeReady[2],
                                    ].map((show) => (
                                        <button
                                            className="w-36 shrink-0 rounded-2xl border border-white/10 bg-black/55 p-2 text-left text-white backdrop-blur-xl transition hover:bg-black/70"
                                            key={show.title}
                                            onClick={() =>
                                                setSelectedMedia(show)
                                            }
                                            type="button"
                                        >
                                            <img
                                                alt={`Poster de ${show.title}`}
                                                className="aspect-[1.35] w-full rounded-xl object-cover"
                                                src={show.image}
                                            />
                                            <span className="mt-2 block truncate text-sm font-medium">
                                                {show.title}
                                            </span>
                                            <span className="block truncate text-xs text-white/55">
                                                {show.subtitle}
                                            </span>
                                        </button>
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
                                    <Button size="sm" variant="ghost">
                                        Tout voir
                                        <ChevronRight aria-hidden="true" />
                                    </Button>
                                </div>
                                <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
                                    {bingeReady.map((show) => (
                                        <button
                                            className="w-36 shrink-0 snap-start text-left sm:w-44"
                                            key={show.title}
                                            onClick={() =>
                                                setSelectedMedia(show)
                                            }
                                            type="button"
                                        >
                                            <div className="aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-sm">
                                                <img
                                                    alt={`Poster de ${show.title}`}
                                                    className="size-full object-cover transition duration-500 hover:scale-105"
                                                    src={show.image}
                                                />
                                            </div>
                                            <span className="mt-3 block truncate font-medium">
                                                {show.title}
                                            </span>
                                            <span className="block text-sm text-muted-foreground">
                                                {show.subtitle}
                                            </span>
                                            <span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                <CircleCheck
                                                    aria-hidden="true"
                                                    className="size-3.5"
                                                />
                                                Prête à binge
                                            </span>
                                        </button>
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
                                        <Button size="sm" variant="ghost">
                                            Calendrier
                                            <ChevronRight aria-hidden="true" />
                                        </Button>
                                    </div>
                                    <div className="flex flex-col divide-y rounded-2xl border bg-card/40 px-5">
                                        {upcomingReleases.map((release) => (
                                            <button
                                                className="flex w-full items-center gap-4 py-4 text-left"
                                                key={`${release.title}-${release.episode}`}
                                                onClick={() =>
                                                    setSelectedMedia(
                                                        release.media,
                                                    )
                                                }
                                                type="button"
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
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <aside className="flex flex-col gap-6 rounded-3xl border bg-card p-6 shadow-sm">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Cette semaine
                                            </p>
                                            <p className="mt-1 font-heading text-4xl font-semibold tracking-[-0.05em]">
                                                3 sorties
                                            </p>
                                        </div>
                                        <Button size="sm" variant="ghost">
                                            Voir tout
                                            <ChevronRight aria-hidden="true" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {weekDays.map((weekDay) => (
                                            <div
                                                className="flex flex-col items-center gap-1.5"
                                                key={weekDay.date}
                                            >
                                                <span className="text-[0.65rem] text-muted-foreground uppercase">
                                                    {weekDay.day}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'flex size-8 items-center justify-center rounded-full text-sm tabular-nums',
                                                        weekDay.hasRelease
                                                            ? 'bg-foreground text-background'
                                                            : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {weekDay.date}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-3 rounded-2xl bg-muted/70 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-medium">
                                                    Silo · Saison 3
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Prête à binge le 12
                                                    septembre
                                                </p>
                                            </div>
                                            <span className="text-sm font-medium tabular-nums">
                                                6 / 10
                                            </span>
                                        </div>
                                        <Progress value={60}>
                                            <ProgressTrack>
                                                <ProgressIndicator />
                                            </ProgressTrack>
                                        </Progress>
                                    </div>
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
                    ))}
                </div>
            </nav>

            <MediaDrawer
                media={selectedMedia}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedMedia(null);
                    }
                }}
            />
        </>
    );
}
