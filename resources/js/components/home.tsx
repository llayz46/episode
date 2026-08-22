import { Head, Link, router } from '@inertiajs/react';
import { Bell, ChevronRight, CircleCheck, Play } from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { MediaDrawer } from '@/components/media-drawer';
import type { MediaDrawerItem } from '@/components/media-drawer';
import { Button } from '@/components/ui/button';
import {
    Progress,
    ProgressIndicator,
    ProgressTrack,
} from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { calendar, collection } from '@/routes';
import { reminder as mediaReminder, show as mediaShow } from '@/routes/media';

const fallbackFeaturedMedia: MediaDrawerItem = {
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=90',
    kind: 'series',
    nextEpisode: 'Prochain épisode · Vendredi 22 août',
    platform: 'Apple TV+',
    releasedEpisodes: 6,
    seasonComplete: '12 septembre',
    slug: 'silo-125988',
    status: 'airing',
    subtitle: 'Saison 3',
    title: 'Silo',
    totalEpisodes: 10,
    year: '2025',
};

type HomeProps = {
    bingeReady: MediaDrawerItem[];
    featuredMedia: MediaDrawerItem | null;
    trackedMedia: MediaDrawerItem[];
    upcomingReleases: Array<{
        date: string;
        episode: string;
        image: string;
        media: MediaDrawerItem;
        title: string;
    }>;
    week: {
        days: Array<{
            date: string;
            hasRelease: boolean;
        }>;
        highlight: MediaDrawerItem | null;
        releaseCount: number;
    };
};

function toDate(date: string): Date {
    return new Date(`${date}T12:00:00`);
}

function weekday(date: string): string {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'short' })
        .format(toDate(date))
        .replace('.', '');
}

function releaseDate(date: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        weekday: 'short',
    }).format(toDate(date));
}

export function Home({
    bingeReady,
    featuredMedia,
    trackedMedia,
    upcomingReleases,
    week,
}: HomeProps) {
    const [selectedMedia, setSelectedMedia] = useState<MediaDrawerItem | null>(
        null,
    );
    const featured = featuredMedia ?? fallbackFeaturedMedia;

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
                                alt={`Image de ${featured.title}`}
                                className="absolute inset-0 size-full object-cover object-center opacity-70"
                                src={featured.image}
                            />
                            <div className="absolute inset-0 bg-linear-to-r from-black via-black/45 to-transparent" />
                            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/30" />

                            <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
                                <AppLogo className="text-white" />
                                <div className="mt-auto flex max-w-xl flex-col gap-6 pb-28 sm:pb-36">
                                    <div className="flex flex-col gap-3">
                                        <p className="text-sm font-medium tracking-[0.18em] text-white/60 uppercase">
                                            {featured.platform} ·{' '}
                                            {featured.year}
                                        </p>
                                        <h1
                                            id="featured-title"
                                            className="font-heading text-6xl font-semibold tracking-[-0.08em] sm:text-8xl"
                                        >
                                            {featured.title}
                                        </h1>
                                        <p className="max-w-md text-base leading-7 text-white/70">
                                            {featured.status === 'airing'
                                                ? (featured.nextEpisode ??
                                                  'Diffusion en cours.')
                                                : 'Disponible à regarder, à votre rythme.'}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <Button
                                            render={
                                                <Link
                                                    href={mediaShow(
                                                        featured.slug ?? '',
                                                    )}
                                                    prefetch
                                                />
                                            }
                                        >
                                            <Play
                                                aria-hidden="true"
                                                className="fill-current"
                                            />
                                            Voir la série
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                featured.slug &&
                                                router.post(
                                                    mediaReminder(
                                                        featured.slug,
                                                    ),
                                                )
                                            }
                                            variant="secondary"
                                        >
                                            <Bell
                                                aria-hidden="true"
                                                className={
                                                    featured.remindersEnabled
                                                        ? 'fill-current'
                                                        : undefined
                                                }
                                            />
                                            {featured.remindersEnabled
                                                ? 'Rappel activé'
                                                : 'Me prévenir'}
                                        </Button>
                                    </div>
                                </div>
                                {trackedMedia.length > 0 && (
                                    <div className="absolute right-5 bottom-5 left-5 flex gap-3 overflow-x-auto sm:right-8 sm:bottom-8 sm:left-auto sm:w-[34rem] lg:right-12 lg:bottom-10">
                                        {trackedMedia.map((show) => (
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
                                )}
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
                                        render={
                                            <Link href={collection()} prefetch />
                                        }
                                        size="sm"
                                        variant="ghost"
                                    >
                                        Tout voir
                                        <ChevronRight aria-hidden="true" />
                                    </Button>
                                </div>
                                {bingeReady.length > 0 ? (
                                    <div className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
                                        {bingeReady.map((show) => (
                                            <button
                                                className="w-36 shrink-0 snap-start text-left sm:w-44"
                                                key={show.slug ?? show.title}
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
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Les séries complètes et les films déjà
                                        sortis de votre collection apparaîtront
                                        ici.
                                    </p>
                                )}
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
                                            render={
                                                <Link
                                                    href={calendar()}
                                                    prefetch
                                                />
                                            }
                                            size="sm"
                                            variant="ghost"
                                        >
                                            Calendrier
                                            <ChevronRight aria-hidden="true" />
                                        </Button>
                                    </div>
                                    {upcomingReleases.length > 0 ? (
                                        <div className="flex flex-col divide-y rounded-2xl border bg-card/40 px-5">
                                            {upcomingReleases.map((release) => (
                                                <button
                                                    className="flex w-full items-center gap-4 py-4 text-left"
                                                    key={`${release.date}-${release.media.slug}-${release.episode}`}
                                                    onClick={() =>
                                                        setSelectedMedia(
                                                            release.media,
                                                        )
                                                    }
                                                    type="button"
                                                >
                                                    <time className="w-14 shrink-0 text-sm font-medium text-muted-foreground tabular-nums">
                                                        {releaseDate(release.date)}
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
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Aucune sortie à venir parmi les
                                            séries et films que vous suivez.
                                        </p>
                                    )}
                                </div>
                                <aside className="flex flex-col gap-6 rounded-3xl border bg-card p-6 shadow-sm">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Cette semaine
                                            </p>
                                            <p className="mt-1 font-heading text-4xl font-semibold tracking-[-0.05em]">
                                                {week.releaseCount} sortie
                                                {week.releaseCount > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                        <Button
                                            render={
                                                <Link
                                                    href={calendar()}
                                                    prefetch
                                                />
                                            }
                                            size="sm"
                                            variant="ghost"
                                        >
                                            Voir tout
                                            <ChevronRight aria-hidden="true" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {week.days.map((weekDay) => (
                                            <div
                                                className="flex flex-col items-center gap-1.5"
                                                key={weekDay.date}
                                            >
                                                <span className="text-[0.65rem] text-muted-foreground uppercase">
                                                    {weekday(weekDay.date)}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'flex size-8 items-center justify-center rounded-full text-sm tabular-nums',
                                                        weekDay.hasRelease
                                                            ? 'bg-foreground text-background'
                                                            : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {toDate(weekDay.date).getDate()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {week.highlight ? (
                                        <div className="flex flex-col gap-3 rounded-2xl bg-muted/70 p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-medium">
                                                        {week.highlight.title} ·{' '}
                                                        {week.highlight.subtitle}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {week.highlight.seasonComplete
                                                            ? `Saison complète le ${week.highlight.seasonComplete}`
                                                            : week.highlight.nextEpisode}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-medium tabular-nums">
                                                    {week.highlight.releasedEpisodes}{' '}
                                                    /{' '}
                                                    {week.highlight.totalEpisodes}
                                                </span>
                                            </div>
                                            <Progress
                                                value={
                                                    week.highlight.releasedEpisodes &&
                                                    week.highlight.totalEpisodes
                                                        ? (week.highlight.releasedEpisodes /
                                                              week.highlight.totalEpisodes) *
                                                          100
                                                        : 0
                                                }
                                            >
                                                <ProgressTrack>
                                                    <ProgressIndicator />
                                                </ProgressTrack>
                                            </Progress>
                                        </div>
                                    ) : (
                                        <p className="rounded-2xl bg-muted/70 p-4 text-sm text-muted-foreground">
                                            Suivez une série en diffusion pour
                                            voir sa progression ici.
                                        </p>
                                    )}
                                </aside>
                            </section>
                        </div>
                    </div>
                </main>
            </ScrollArea>

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
