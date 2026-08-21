import { Head, Link } from '@inertiajs/react';
import { Check, ChevronLeft, ChevronRight, Clock3, Star } from 'lucide-react';
import type { ReactElement } from 'react';
import AppLogo from '@/components/app-logo';
import { Badge } from '@/components/ui/badge';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { home } from '@/routes';
import {
    episode as mediaEpisode,
    season as mediaSeason,
    show as mediaShow,
} from '@/routes/media';
import type { CastMember, MediaEpisode } from '@/types/media';

type EpisodePageProps = {
    media: {
        backdrop: string;
        cast: CastMember[];
        platform: string;
        poster: string;
        slug: string;
        title: string;
    };
    season: {
        number: number;
        title: string;
    };
    episode: MediaEpisode;
};

function episodeCode(seasonNumber: number, episodeNumber: number): string {
    return `S${String(seasonNumber).padStart(2, '0')}E${String(episodeNumber).padStart(2, '0')}`;
}

function runtime(runtime: number | null): string {
    return runtime === null ? 'Durée inconnue' : `${runtime} min`;
}

export default function EpisodePage({
    media,
    season,
    episode,
}: EpisodePageProps): ReactElement {
    const code = episodeCode(season.number, episode.number);

    return (
        <main className="dark relative isolate h-dvh overflow-hidden bg-neutral-950 text-white">
            <Head title={`${code} · ${episode.title} · ${media.title}`} />

            <img
                alt=""
                className="pointer-events-none fixed inset-0 -z-30 size-full object-cover opacity-25 blur-sm"
                src={media.backdrop}
            />
            <div className="pointer-events-none fixed inset-0 -z-20 bg-linear-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/65" />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-linear-to-t from-neutral-950 via-transparent to-black/40" />

            <ScrollArea className="h-dvh [&_[data-slot=scroll-area-scrollbar]]:opacity-80 [&_[data-slot=scroll-area-scrollbar]]:delay-0 [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-2 [&_[data-slot=scroll-area-thumb]]:bg-white/35">
                <div className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
                    <header className="flex items-center justify-between gap-5">
                        <AppLogo className="text-white" />
                        <nav
                            aria-label="Navigation des épisodes"
                            className="flex items-center gap-4 text-sm"
                        >
                            {episode.previousNumber !== null && (
                                <Link
                                    className="inline-flex items-center gap-1 text-white/55 transition-colors hover:text-white"
                                    href={mediaEpisode({
                                        episode: episode.previousNumber,
                                        season: season.number,
                                        slug: media.slug,
                                    })}
                                    prefetch
                                >
                                    <ChevronLeft
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                    E{episode.previousNumber}
                                </Link>
                            )}
                            {episode.nextNumber !== null && (
                                <Link
                                    className="inline-flex items-center gap-1 text-white/55 transition-colors hover:text-white"
                                    href={mediaEpisode({
                                        episode: episode.nextNumber,
                                        season: season.number,
                                        slug: media.slug,
                                    })}
                                    prefetch
                                >
                                    E{episode.nextNumber}
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
                                <BreadcrumbLink
                                    render={
                                        <Link
                                            href={mediaSeason({
                                                season: season.number,
                                                slug: media.slug,
                                            })}
                                            prefetch
                                        />
                                    }
                                >
                                    {season.title}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator> / </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-white">
                                    {code}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <section className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.8fr)] lg:items-center lg:gap-12">
                        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40">
                            <img
                                alt={`Image de ${code}, ${episode.title}`}
                                className="aspect-video w-full object-cover"
                                src={episode.image}
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/45 to-transparent px-5 pt-20 pb-5 sm:px-7 sm:pb-6">
                                <Badge size="sm">{code}</Badge>
                            </div>
                        </div>

                        <div className="max-w-xl">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant={
                                        episode.isAvailable
                                            ? 'success'
                                            : 'secondary'
                                    }
                                >
                                    <span className="size-1.5 rounded-full bg-current" />
                                    {episode.isAvailable
                                        ? 'Disponible'
                                        : 'À venir'}
                                </Badge>
                                <Badge variant="secondary">{code}</Badge>
                                <p className="text-sm text-white/55">
                                    {season.title} · {media.platform}
                                </p>
                            </div>

                            <h1 className="mt-5 font-heading text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">
                                {episode.title}
                            </h1>
                            <p className="mt-3 text-sm text-white/50">
                                {episode.airedOn ?? 'Date inconnue'}
                            </p>
                            <p className="mt-6 text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
                                {episode.overview}
                            </p>

                            <div className="mt-7 flex flex-wrap gap-3">
                                <Button>
                                    <Check aria-hidden="true" />
                                    Marquer comme vu
                                </Button>
                                <Button variant="secondary">
                                    <Star aria-hidden="true" />
                                    Noter
                                </Button>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-5">
                                <div>
                                    <p className="text-xs tracking-[0.12em] text-white/45 uppercase">
                                        Note TMDB
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-emerald-400">
                                        {episode.rating === null
                                            ? '—'
                                            : `${Math.round(episode.rating * 10)}%`}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs tracking-[0.12em] text-white/45 uppercase">
                                        Votes
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-white/85">
                                        {new Intl.NumberFormat('fr-FR').format(
                                            episode.voteCount,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs tracking-[0.12em] text-white/45 uppercase">
                                        Durée
                                    </p>
                                    <p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-white/85">
                                        <Clock3
                                            aria-hidden="true"
                                            className="size-4 text-white/45"
                                        />
                                        {runtime(episode.runtime)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="pt-8">
                        {media.cast.length > 0 && (
                            <div className="mt-9">
                                <h2 className="text-xs font-semibold tracking-[0.16em] text-white/60 uppercase">
                                    Casting principal
                                </h2>
                                <ScrollArea className="mt-5 h-auto w-full">
                                    <div className="flex w-max gap-3 pb-4">
                                        {media.cast.map((member) => (
                                            <article
                                                className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-xl bg-white/10"
                                                key={member.name}
                                            >
                                                <img
                                                    alt=""
                                                    className="size-full object-cover"
                                                    src={member.image}
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/55 to-transparent px-2.5 pt-10 pb-2.5">
                                                    <p className="truncate text-xs font-medium text-white">
                                                        {member.name}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-[0.7rem] text-white/60">
                                                        {member.role}
                                                    </p>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </section>
                </div>
            </ScrollArea>
        </main>
    );
}
