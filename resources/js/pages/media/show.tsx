import { Head, Link } from '@inertiajs/react';
import { Bell, Play } from 'lucide-react';
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
import type { Media, Season } from '@/types/media';

type MediaShowProps = {
    media: Media;
};

function seasonImage(media: Media, season: Season): string {
    if (season.image) {
        return season.image;
    }

    if (season.number === 3 && media.episodeNavigation[0]) {
        return media.episodeNavigation[0].image;
    }

    return season.number === 2 ? media.backdrop : media.poster;
}

function countryName(countryCode?: string): string | undefined {
    if (!countryCode) {
        return undefined;
    }

    return (
        new Intl.DisplayNames(['fr-FR'], { type: 'region' }).of(countryCode) ??
        countryCode
    );
}

export default function MediaShow({ media }: MediaShowProps): ReactElement {
    const isSeries = media.kind === 'series';
    const localizedCountry = countryName(media.countryCode);

    return (
        <main className="dark relative isolate h-dvh overflow-hidden bg-neutral-950 text-white">
            <Head title={media.title} />

            <img
                alt=""
                className="pointer-events-none fixed inset-0 -z-30 size-full object-cover opacity-25"
                src={media.backdrop}
            />
            <div className="pointer-events-none fixed inset-0 -z-20 bg-linear-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/60" />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-linear-to-t from-neutral-950 via-transparent to-black/30" />

            <ScrollArea className="h-dvh [&_[data-slot=scroll-area-scrollbar]]:opacity-80 [&_[data-slot=scroll-area-scrollbar]]:delay-0 [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-2 [&_[data-slot=scroll-area-thumb]]:bg-white/35">
                <div className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
                    <header>
                        <AppLogo className="text-white" />
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
                                <BreadcrumbPage className="text-white">
                                    {media.title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <section className="mt-8 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)_13rem] lg:items-center lg:gap-8">
                        <img
                            alt={`Affiche de ${media.title}`}
                            className="aspect-[2/3] w-44 rounded-2xl object-cover shadow-2xl shadow-black/50 sm:w-52 lg:w-full"
                            src={media.poster}
                        />

                        <div className="max-w-2xl">
                            <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="success">
                                    <span className="size-1.5 rounded-full bg-current" />
                                    {media.status}
                                </Badge>
                                <p className="text-sm text-white/60">
                                    {media.year} · {media.platform}
                                </p>
                            </div>
                            <h1 className="mt-5 font-heading text-5xl font-semibold tracking-[-0.065em] sm:text-7xl">
                                {media.title}
                            </h1>
                            {media.tagline && (
                                <p className="mt-3 text-sm font-medium text-white/75 sm:text-base">
                                    {media.tagline}
                                </p>
                            )}
                            <p className="mt-3 text-sm text-white/45">
                                {isSeries
                                    ? `${media.season} · ${media.progress?.total} épisodes`
                                    : 'Film'}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {media.genres.map((genre) => (
                                    <Badge key={genre} variant="outline">
                                        {genre}
                                    </Badge>
                                ))}
                            </div>
                            <p className="mt-5 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">
                                {media.description}
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                <Button>
                                    <Play
                                        aria-hidden="true"
                                        className="fill-current"
                                    />
                                    {isSeries
                                        ? 'Commencer le suivi'
                                        : 'À regarder'}
                                </Button>
                                <Button variant="secondary">
                                    <Bell aria-hidden="true" />
                                    Me prévenir
                                </Button>
                            </div>
                        </div>

                        <aside className="grid grid-cols-2 gap-x-6 gap-y-6 border-white/10 pt-6 text-sm max-lg:border-t sm:grid-cols-3 lg:grid-cols-1 lg:pt-0 lg:pl-7">
                            {media.rating && (
                                <div>
                                    <p className="text-2xl font-semibold text-emerald-400 tabular-nums">
                                        {Math.round(media.rating.average * 10)}%
                                    </p>
                                    <p className="mt-1 text-xs text-white/50">
                                        {new Intl.NumberFormat('fr-FR').format(
                                            media.rating.count,
                                        )}{' '}
                                        votes TMDB
                                    </p>
                                </div>
                            )}
                            {media.firstAirDate && (
                                <div>
                                    <p className="text-xs tracking-[0.12em] text-white/45 uppercase">
                                        Première diffusion
                                    </p>
                                    <p className="mt-1 font-medium text-white/85">
                                        {media.firstAirDate}
                                    </p>
                                </div>
                            )}
                            {localizedCountry && (
                                <div>
                                    <p className="text-xs tracking-[0.12em] text-white/45 uppercase">
                                        Pays
                                    </p>
                                    <p className="mt-1 font-medium text-white/85">
                                        {localizedCountry}
                                    </p>
                                </div>
                            )}
                        </aside>
                    </section>

                    {isSeries && (
                        <div className="mt-10 flex flex-col gap-8 pb-8 lg:mt-12 lg:gap-10">
                            <section aria-labelledby="seasons-title">
                                <h2
                                    className="text-xs font-semibold tracking-[0.16em] text-white/60 uppercase"
                                    id="seasons-title"
                                >
                                    Saisons
                                </h2>
                                <ScrollArea className="mt-5 h-auto w-full">
                                    <div className="flex w-max gap-3 pb-4">
                                        {media.seasons.map((season) => (
                                            <article
                                                className="relative aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-xl bg-white/10 sm:w-40"
                                                key={season.number}
                                            >
                                                <img
                                                    alt={`Affiche de la saison ${season.number} de ${media.title}`}
                                                    className="size-full object-cover"
                                                    src={seasonImage(
                                                        media,
                                                        season,
                                                    )}
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/70 to-transparent px-3 pt-14 pb-3">
                                                    <p className="text-xs font-semibold text-white">
                                                        Saison {season.number}
                                                    </p>
                                                    <p className="mt-0.5 text-[10px] text-white/60">
                                                        {season.episodeCount}{' '}
                                                        épisodes
                                                    </p>
                                                </div>
                                                <Badge
                                                    className="absolute top-2 right-2"
                                                    variant={
                                                        season.status ===
                                                        'Terminée'
                                                            ? 'secondary'
                                                            : 'success'
                                                    }
                                                >
                                                    {season.status}
                                                </Badge>
                                            </article>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </section>

                            {media.cast.length > 0 && (
                                <section aria-labelledby="cast-title">
                                    <h2
                                        className="text-xs font-semibold tracking-[0.16em] text-white/60 uppercase"
                                        id="cast-title"
                                    >
                                        Casting
                                    </h2>
                                    <ScrollArea className="mt-5 h-auto w-full">
                                        <div className="flex w-max gap-3 pb-4">
                                            {media.cast.map((member) => (
                                                <article
                                                    className="group relative w-28 shrink-0 overflow-hidden rounded-lg bg-zinc-900"
                                                    key={member.name}
                                                >
                                                    <div className="relative aspect-3/4">
                                                        <img
                                                            alt=""
                                                            className="object-cover transition-transform group-hover:scale-105"
                                                            src={member.image}
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/55 to-transparent px-3 pt-12 pb-3">
                                                            <p className="truncate text-xs font-medium text-white">
                                                                {member.name}
                                                            </p>
                                                            <p className="mt-0.5 truncate text-[10px] text-white/60">
                                                                {member.role}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </main>
    );
}
