import {
    Bell,
    CalendarDays,
    Check,
    Clapperboard,
    Clock3,
    Play,
    Star,
} from 'lucide-react';
import type { ReactElement } from 'react';
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

export type MediaDrawerItem = {
    image: string;
    kind: 'film' | 'series';
    platform: string;
    status: 'airing' | 'binge-ready';
    subtitle: string;
    title: string;
    totalEpisodes?: number;
    releasedEpisodes?: number;
    nextEpisode?: string;
    seasonComplete?: string;
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
                            <div className="flex gap-4 pe-8">
                                <img
                                    alt={`Poster de ${media.title}`}
                                    className="aspect-[2/3] w-24 rounded-xl object-cover shadow-sm"
                                    src={media.image}
                                />
                                <div className="min-w-0 self-center">
                                    <p className="truncate text-sm text-muted-foreground">
                                        {media.platform} · {media.year}
                                    </p>
                                    <DrawerTitle className="mt-1 truncate text-2xl tracking-[-0.04em]">
                                        {media.title}
                                    </DrawerTitle>
                                    <DrawerDescription className="mt-2">
                                        {media.subtitle}
                                    </DrawerDescription>
                                </div>
                            </div>
                        </DrawerHeader>

                        <DrawerPanel className="flex flex-col gap-6 pt-5">
                            <div className="grid grid-cols-2 gap-2">
                                <Button>
                                    <Play
                                        aria-hidden="true"
                                        className="fill-current"
                                    />
                                    {isAiring
                                        ? 'Voir le suivi'
                                        : isSeries
                                          ? 'Commencer'
                                          : 'Regarder'}
                                </Button>
                                <Button variant="secondary">
                                    <Bell aria-hidden="true" />
                                    Me prévenir
                                </Button>
                            </div>

                            {isAiring && (
                                <section className="flex flex-col gap-3 rounded-2xl bg-muted/70 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium">
                                                Diffusion en cours
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {media.nextEpisode}
                                            </p>
                                        </div>
                                        <span className="text-sm font-medium tabular-nums">
                                            {media.releasedEpisodes} /{' '}
                                            {media.totalEpisodes}
                                        </span>
                                    </div>
                                    <Progress value={progress}>
                                        <ProgressTrack>
                                            <ProgressIndicator />
                                        </ProgressTrack>
                                    </Progress>
                                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CalendarDays aria-hidden="true" />
                                        Saison complète le{' '}
                                        {media.seasonComplete}
                                    </p>
                                </section>
                            )}

                            <section className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Statut
                                    </p>
                                    <p className="mt-2 flex items-center gap-2 font-medium">
                                        {isAiring ? (
                                            <Clock3 aria-hidden="true" />
                                        ) : (
                                            <Check aria-hidden="true" />
                                        )}
                                        {isAiring
                                            ? 'À regarder plus tard'
                                            : isSeries
                                              ? 'Prête à binge'
                                              : 'Disponible'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border p-4">
                                    <p className="text-sm text-muted-foreground">
                                        Ma note
                                    </p>
                                    <p className="mt-2 flex items-center gap-2 font-medium">
                                        <Star aria-hidden="true" />
                                        Pas encore notée
                                    </p>
                                </div>
                            </section>

                            <section className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Clapperboard aria-hidden="true" />
                                    <h2 className="font-heading text-lg font-semibold">
                                        À propos
                                    </h2>
                                </div>
                                <p className="text-sm leading-6 text-muted-foreground">
                                    Ajoute cette œuvre à tes listes, suis sa
                                    diffusion et garde une trace de ton
                                    visionnage au même endroit.
                                </p>
                            </section>
                        </DrawerPanel>

                        <DrawerFooter>
                            <Button variant="secondary">
                                Ajouter une note
                            </Button>
                            <Button>Voir la fiche complète</Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerPopup>
        </Drawer>
    );
}
