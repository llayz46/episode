import { ChevronLeft, ChevronRight, Clock3, UsersRound } from 'lucide-react';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CastMember, EpisodeDetail, Season } from '@/types/media';

type MediaEpisodeDetailsProps = {
    cast: CastMember[];
    episodes: EpisodeDetail[];
    platform: string;
    season: string | null;
    title: string;
};

export function MediaEpisodeDetails({
    cast,
    episodes,
    platform,
    season,
    title,
}: MediaEpisodeDetailsProps): ReactElement | null {
    const firstUnavailableIndex = episodes.findIndex(
        (episode) => !episode.isAvailable,
    );
    const initialEpisodeIndex =
        firstUnavailableIndex > 0
            ? firstUnavailableIndex - 1
            : Math.max(episodes.length - 1, 0);
    const [selectedIndex, setSelectedIndex] = useState(initialEpisodeIndex);
    const selectedEpisode = episodes[selectedIndex];
    const previousEpisode = episodes[selectedIndex - 1];
    const nextEpisode = episodes[selectedIndex + 1];

    if (!selectedEpisode) {
        return null;
    }

    return (
        <section aria-label="Épisode actuel" className="flex flex-col gap-6">
            <div className="flex justify-end gap-1">
                <Button
                    aria-label="Épisode précédent"
                    disabled={!previousEpisode}
                    onClick={() => setSelectedIndex((index) => index - 1)}
                    size="sm"
                    variant="ghost"
                >
                    <ChevronLeft aria-hidden="true" />
                    {previousEpisode?.code ?? 'E–'}
                </Button>
                <Button
                    aria-label="Épisode suivant"
                    disabled={!nextEpisode}
                    onClick={() => setSelectedIndex((index) => index + 1)}
                    size="sm"
                    variant="ghost"
                >
                    {nextEpisode?.code ?? 'E–'}
                    <ChevronRight aria-hidden="true" />
                </Button>
            </div>

            <article className="grid overflow-hidden rounded-2xl bg-white/5 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                        <p className="text-sm text-white/55">
                            {title} · {season}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                                {selectedEpisode.code}
                            </Badge>
                            <Badge
                                variant={
                                    selectedEpisode.isAvailable
                                        ? 'success'
                                        : 'secondary'
                                }
                            >
                                {selectedEpisode.isAvailable
                                    ? 'Disponible'
                                    : 'À venir'}
                            </Badge>
                        </div>
                        <h2 className="mt-5 font-heading text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                            {selectedEpisode.title}
                        </h2>
                        <p className="mt-4 max-w-xl leading-7 text-white/70">
                            {selectedEpisode.description}
                        </p>
                    </div>
                    <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm">
                        <div>
                            <dt className="text-xs tracking-[0.12em] text-white/50 uppercase">
                                Diffusé
                            </dt>
                            <dd className="mt-1 text-white/80">
                                {selectedEpisode.airDate}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs tracking-[0.12em] text-white/50 uppercase">
                                Durée
                            </dt>
                            <dd className="mt-1 flex items-center gap-1.5 text-white/80">
                                <Clock3
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                                {selectedEpisode.duration}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs tracking-[0.12em] text-white/50 uppercase">
                                Plateforme
                            </dt>
                            <dd className="mt-1 text-white/80">{platform}</dd>
                        </div>
                    </dl>
                </div>
                <img
                    alt={`Image de l’épisode ${selectedEpisode.code}`}
                    className="aspect-video size-full min-h-60 object-cover lg:aspect-auto"
                    src={selectedEpisode.image}
                />
            </article>

            <div className="pt-4">
                <div className="flex items-center gap-2">
                    <UsersRound
                        aria-hidden="true"
                        className="size-4 text-white/60"
                    />
                    <h2 className="text-sm font-semibold tracking-[0.12em] text-white/80 uppercase">
                        Guest cast
                    </h2>
                </div>
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {cast.map((member) => (
                        <article
                            className="relative aspect-[3/4] w-36 shrink-0 overflow-hidden rounded-xl bg-white/10 sm:w-40"
                            key={member.name}
                        >
                            <img
                                alt=""
                                className="size-full object-cover"
                                src={member.image}
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/55 to-transparent px-3 pt-12 pb-3">
                                <p className="truncate text-sm font-medium text-white">
                                    {member.name}
                                </p>
                                <p className="mt-0.5 truncate text-xs text-white/60">
                                    {member.role}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export function OtherSeasons({
    poster,
    seasons,
    title,
}: {
    poster: string;
    seasons: Season[];
    title: string;
}): ReactElement | null {
    if (seasons.length < 2) {
        return null;
    }

    return (
        <section aria-label="Toutes les saisons" className="max-w-md">
            <article className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                <img
                    alt={`Affiche de ${title}`}
                    className="aspect-[2/3] w-10 rounded-md object-cover"
                    src={poster}
                />
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{title}</p>
                    <p className="mt-0.5 text-xs text-white/55">
                        Voir les {seasons.length} saisons
                    </p>
                </div>
            </article>
        </section>
    );
}
