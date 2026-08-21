import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { ReactElement } from 'react';
import AppLogo from '@/components/app-logo';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { home } from '@/routes';
import {
    episode as mediaEpisode,
    season as mediaSeason,
    show as mediaShow,
} from '@/routes/media';
import type { MediaSeason, SeasonEpisode } from '@/types/media';

type SeasonPageProps = {
    media: {
        backdrop: string;
        slug: string;
        title: string;
    };
    season: MediaSeason;
};

function episodeRuntime(runtime: number | null): string | null {
    return runtime === null ? null : `${runtime} min`;
}

function episodeRating(episode: SeasonEpisode): string {
    return episode.rating === null
        ? '—'
        : `${Math.round(episode.rating * 10)}%`;
}

export default function SeasonPage({
    media,
    season,
}: SeasonPageProps): ReactElement {
    return (
        <main className="dark relative isolate h-dvh overflow-hidden bg-neutral-950 text-white">
            <Head title={`${media.title} · ${season.title}`} />

            <img
                alt=""
                className="pointer-events-none fixed inset-0 -z-30 size-full object-cover opacity-20"
                src={media.backdrop}
            />
            <div className="pointer-events-none fixed inset-0 -z-20 bg-linear-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/65" />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-linear-to-t from-neutral-950 via-transparent to-black/35" />

            <ScrollArea className="h-dvh [&_[data-slot=scroll-area-scrollbar]]:opacity-80 [&_[data-slot=scroll-area-scrollbar]]:delay-0 [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-2 [&_[data-slot=scroll-area-thumb]]:bg-white/35">
                <div className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
                    <header className="flex items-center justify-between gap-5">
                        <AppLogo className="text-white" />
                        <nav
                            aria-label="Navigation des saisons"
                            className="flex items-center gap-4 text-sm"
                        >
                            {season.previousNumber !== null && (
                                <Link
                                    className="inline-flex items-center gap-1 text-white/55 transition-colors hover:text-white"
                                    href={mediaSeason({
                                        season: season.previousNumber,
                                        slug: media.slug,
                                    })}
                                    prefetch
                                >
                                    <ChevronLeft
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    S{season.previousNumber}
                                </Link>
                            )}
                            {season.nextNumber !== null && (
                                <Link
                                    className="inline-flex items-center gap-1 text-white/55 transition-colors hover:text-white"
                                    href={mediaSeason({
                                        season: season.nextNumber,
                                        slug: media.slug,
                                    })}
                                    prefetch
                                >
                                    S{season.nextNumber}
                                    <ChevronRight
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </Link>
                            )}
                        </nav>
                    </header>

                    <Breadcrumb className="mt-12 lg:mt-16">
                        <BreadcrumbList className="text-white/60">
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    render={<Link href={home()} prefetch />}
                                >
                                    Accueil
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator> / </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    render={
                                        <Link
                                            href={mediaShow(media.slug)}
                                            prefetch
                                        />
                                    }
                                >
                                    {media.title}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator> / </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-white">
                                    Saison {season.number}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <section className="mt-8">
                        <h1 className="font-heading text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                            {season.title}
                        </h1>
                        <p className="mt-3 text-sm text-white/45">
                            {season.episodeCount} épisodes
                        </p>
                    </section>

                    <section
                        className="mt-12 pb-12 lg:mt-16"
                        aria-labelledby="episodes-title"
                    >
                        <div className="flex items-baseline justify-between gap-4">
                            <h2
                                className="text-xs font-semibold tracking-[0.16em] text-white/60 uppercase"
                                id="episodes-title"
                            >
                                Épisodes
                            </h2>
                            <p className="text-xs text-white/40">
                                {season.episodes.length} au total
                            </p>
                        </div>

                        <ol className="mt-5 flex flex-col gap-3">
                            {season.episodes.map((episode) => (
                                <li key={episode.number}>
                                    <Link
                                        className="grid min-h-28 overflow-hidden rounded-xl border border-white/8 bg-white/6 transition-colors hover:bg-white/9 sm:grid-cols-[10rem_minmax(0,1fr)_8rem]"
                                        href={mediaEpisode({
                                            episode: episode.number,
                                            season: season.number,
                                            slug: media.slug,
                                        })}
                                        prefetch
                                    >
                                        <img
                                            alt=""
                                            className="h-28 w-full object-cover sm:h-full"
                                            src={episode.image}
                                        />

                                        <div className="min-w-0 px-4 py-3 sm:px-5 sm:py-4">
                                            <h3 className="text-sm font-medium text-white sm:text-base">
                                                <span className="text-white/55">
                                                    E{episode.number}
                                                </span>{' '}
                                                {episode.title}
                                            </h3>
                                            <p className="mt-1 text-xs text-white/45">
                                                {[
                                                    episode.airedOn,
                                                    episodeRuntime(
                                                        episode.runtime,
                                                    ),
                                                ]
                                                    .filter(Boolean)
                                                    .join(' · ') ||
                                                    'Date inconnue'}
                                            </p>
                                            <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55 sm:text-sm">
                                                {episode.overview ??
                                                    'Aucun synopsis n’est disponible pour cet épisode.'}
                                            </p>
                                        </div>

                                        <div className="flex items-start justify-end px-4 py-3 sm:px-5 sm:py-4">
                                            <p className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                                                {episode.rating !== null && (
                                                    <Star
                                                        aria-hidden="true"
                                                        className="size-3.5 fill-current"
                                                    />
                                                )}
                                                {episodeRating(episode)}
                                                <span className="text-xs font-normal text-white/45">
                                                    (
                                                    {new Intl.NumberFormat(
                                                        'fr-FR',
                                                    ).format(episode.voteCount)}
                                                    )
                                                </span>
                                            </p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>
            </ScrollArea>
        </main>
    );
}
