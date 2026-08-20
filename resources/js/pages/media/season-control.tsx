import { Head, Link } from '@inertiajs/react';
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    Play,
    UsersRound,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';
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
import { home } from '@/routes';
import type { Media } from '@/types/media';

type SeasonControlProps = {
    media: Media;
};

export default function SeasonControl({
    media,
}: SeasonControlProps): ReactElement {
    const firstUnavailableIndex = media.episodeNavigation.findIndex(
        (episode) => !episode.isAvailable,
    );
    const initialEpisodeIndex =
        firstUnavailableIndex > 0
            ? firstUnavailableIndex - 1
            : Math.max(media.episodeNavigation.length - 1, 0);
    const [selectedIndex, setSelectedIndex] = useState(initialEpisodeIndex);
    const selectedEpisode = media.episodeNavigation[selectedIndex];
    const previousEpisode = media.episodeNavigation[selectedIndex - 1];
    const nextEpisode = media.episodeNavigation[selectedIndex + 1];

    if (!selectedEpisode) {
        return (
            <main className="min-h-screen bg-background">
                <Head title={media.title} />
            </main>
        );
    }

    return (
        <main className="dark relative isolate min-h-screen overflow-hidden bg-neutral-950 text-white">
            <Head title={`${media.title} · ${selectedEpisode.code}`} />

            <img
                alt=""
                className="pointer-events-none fixed inset-0 -z-30 size-full scale-105 object-cover object-center opacity-70 blur-sm"
                src={media.backdrop}
            />
            <div className="pointer-events-none fixed inset-0 -z-20 bg-linear-to-r from-black via-black/65 to-black/35" />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-linear-to-t from-black via-black/45 to-black/30" />

            <div className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
                <header className="flex items-center justify-between gap-5">
                    <AppLogo className="text-white" />
                    <div className="flex gap-1">
                        <Button
                            aria-label="Épisode précédent"
                            disabled={!previousEpisode}
                            onClick={() =>
                                setSelectedIndex((index) => index - 1)
                            }
                            size="sm"
                            variant="ghost"
                        >
                            <ChevronLeft aria-hidden="true" />
                            {previousEpisode?.code ?? 'E–'}
                        </Button>
                        <Button
                            aria-label="Épisode suivant"
                            disabled={!nextEpisode}
                            onClick={() =>
                                setSelectedIndex((index) => index + 1)
                            }
                            size="sm"
                            variant="ghost"
                        >
                            {nextEpisode?.code ?? 'E–'}
                            <ChevronRight aria-hidden="true" />
                        </Button>
                    </div>
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
                            <BreadcrumbPage className="text-white/60">
                                {media.title}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator> / </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-white/60">
                                {media.season}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator> / </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbPage className="text-white">
                                {selectedEpisode.code}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,30rem)] lg:items-center lg:gap-14">
                    <div className="max-w-2xl">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="success">
                                <span className="size-1.5 rounded-full bg-current" />
                                {selectedEpisode.isAvailable
                                    ? 'Disponible'
                                    : 'À venir'}
                            </Badge>
                            <p className="text-sm text-white/60">
                                {media.season} · {media.platform}
                            </p>
                        </div>

                        <h1 className="mt-5 font-heading text-5xl font-semibold tracking-[-0.065em] sm:text-7xl">
                            {selectedEpisode.title}
                        </h1>
                        <p className="mt-3 text-base text-white/60 sm:text-lg">
                            {selectedEpisode.code} · {selectedEpisode.airDate} ·{' '}
                            {selectedEpisode.duration}
                        </p>
                        <p className="mt-6 max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                            {selectedEpisode.description}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button>
                                <Play
                                    aria-hidden="true"
                                    className="fill-current"
                                />
                                Commencer le suivi
                            </Button>
                            <Button variant="secondary">
                                <Bell aria-hidden="true" />
                                Me prévenir
                            </Button>
                        </div>
                    </div>

                    <div>
                        <img
                            alt={`Image de l’épisode ${selectedEpisode.code}`}
                            className="aspect-video w-full rounded-2xl object-cover shadow-2xl shadow-black/50"
                            src={selectedEpisode.image}
                        />
                        <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-black/55 p-3 text-white backdrop-blur-xl">
                            <img
                                alt={`Affiche de ${media.title}`}
                                className="aspect-2/3 w-8 rounded-md object-cover"
                                src={media.poster}
                            />
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                    {media.title}
                                </p>
                                <p className="mt-0.5 text-xs text-white/55">
                                    Voir toutes les saisons
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    aria-labelledby="series-title"
                    className="mt-12 border-t border-white/10 pt-10"
                >
                    <div>
                        <div className="flex items-center gap-2">
                            <UsersRound
                                aria-hidden="true"
                                className="size-4 text-white/60"
                            />
                            <h2
                                className="text-sm font-semibold tracking-[0.12em] text-white/80 uppercase"
                                id="series-title"
                            >
                                Casting
                            </h2>
                        </div>
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
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
                    </div>
                </section>
            </div>
        </main>
    );
}
