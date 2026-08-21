import { Link } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerPanel,
    DrawerPopup,
    DrawerTitle,
} from '@/components/ui/drawer';
import {
    Progress,
    ProgressIndicator,
    ProgressTrack,
} from '@/components/ui/progress';
import { show as mediaShow } from '@/routes/media';

export type MediaDrawerItem = {
    description?: string;
    genres?: string[];
    image: string;
    kind: 'film' | 'series';
    nextEpisode?: string;
    platform: string;
    rating?: number;
    releasedEpisodes?: number;
    seasonComplete?: string;
    slug?: string;
    status: 'airing' | 'binge-ready';
    subtitle: string;
    title: string;
    totalEpisodes?: number;
    voteCount?: number;
    year: string;
};

type MediaDrawerProps = {
    media: MediaDrawerItem | null;
    onOpenChange: (open: boolean) => void;
};

export function MediaDrawer({
    media,
    onOpenChange,
}: MediaDrawerProps): ReactElement {
    const isOpen = media !== null;
    const isAiring = media?.status === 'airing';
    const isSeries = media?.kind === 'series';
    const progress =
        media?.releasedEpisodes && media.totalEpisodes
            ? (media.releasedEpisodes / media.totalEpisodes) * 100
            : 0;

    return (
        <Drawer onOpenChange={onOpenChange} open={isOpen} position="right">
            <DrawerPopup position="right" showCloseButton variant="inset">
                {media && (
                    <>
                        <DrawerHeader className="gap-0 p-6 pb-3">
                            <div className="flex flex-wrap items-center gap-2 pe-8">
                                <Badge
                                    variant={isAiring ? 'success' : 'secondary'}
                                >
                                    {isAiring
                                        ? 'En diffusion'
                                        : isSeries
                                          ? 'Prête à binge'
                                          : 'Disponible'}
                                </Badge>
                                <Badge variant="outline">
                                    {isSeries ? 'Série' : 'Film'}
                                </Badge>
                            </div>
                            <p className="mt-4 pe-8 text-sm text-muted-foreground">
                                {media.platform} · {media.year}
                            </p>
                            <DrawerTitle className="mt-1 pe-8 text-3xl tracking-[-0.05em]">
                                {media.title}
                            </DrawerTitle>
                            <DrawerDescription className="mt-2 pe-8">
                                {media.subtitle}
                            </DrawerDescription>
                        </DrawerHeader>

                        <DrawerPanel className="flex flex-col gap-7 pt-5">
                            <div className="grid grid-cols-2 gap-2">
                                <Button>
                                    {isAiring
                                        ? 'Voir le suivi'
                                        : isSeries
                                          ? 'Commencer'
                                          : 'Regarder'}
                                </Button>
                                <Button variant="secondary">Me prévenir</Button>
                            </div>

                            {isAiring && (
                                <section className="flex flex-col gap-4 border-y py-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                                Diffusion
                                            </p>
                                            <p className="mt-1 font-medium">
                                                {media.nextEpisode}
                                            </p>
                                        </div>
                                        <Badge variant="outline">
                                            {media.releasedEpisodes} /{' '}
                                            {media.totalEpisodes}
                                        </Badge>
                                    </div>
                                    <Progress value={progress}>
                                        <ProgressTrack>
                                            <ProgressIndicator />
                                        </ProgressTrack>
                                    </Progress>
                                    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                                        <span>
                                            {media.releasedEpisodes} épisodes
                                            publiés
                                        </span>
                                        {media.seasonComplete && (
                                            <span>
                                                Saison complète le{' '}
                                                {media.seasonComplete}
                                            </span>
                                        )}
                                    </div>
                                </section>
                            )}

                            {(media.description || media.genres?.length) && (
                                <section className="flex flex-col gap-3">
                                    <h2 className="font-heading text-lg font-semibold">
                                        À propos
                                    </h2>
                                    {media.description && (
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {media.description}
                                        </p>
                                    )}
                                    {media.genres && (
                                        <div className="flex flex-wrap gap-2">
                                            {media.genres.map((genre) => (
                                                <Badge
                                                    key={genre}
                                                    variant="outline"
                                                >
                                                    {genre}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            )}

                            {media.rating !== undefined && (
                                <section className="flex items-center justify-between border-t pt-5">
                                    <div>
                                        <p className="text-xs tracking-[0.12em] text-muted-foreground uppercase">
                                            Communauté TMDB
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {media.voteCount
                                                ? `${new Intl.NumberFormat('fr-FR').format(media.voteCount)} votes`
                                                : 'Pas encore de votes'}
                                        </p>
                                    </div>
                                    <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                                        {Math.round(media.rating * 10)}%
                                    </p>
                                </section>
                            )}
                        </DrawerPanel>

                        <DrawerFooter>
                            <Button variant="secondary">
                                Ajouter une note
                            </Button>
                            {media.slug ? (
                                <Button
                                    render={
                                        <Link href={mediaShow(media.slug)} />
                                    }
                                >
                                    Voir la fiche complète
                                </Button>
                            ) : (
                                <Button disabled>
                                    Fiche bientôt disponible
                                </Button>
                            )}
                        </DrawerFooter>
                    </>
                )}
            </DrawerPopup>
        </Drawer>
    );
}
