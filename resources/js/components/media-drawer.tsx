import { Link, router } from '@inertiajs/react';
import { Bell, Check, Play, Star } from 'lucide-react';
import { useState } from 'react';
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
    Menu,
    MenuGroup,
    MenuGroupLabel,
    MenuPopup,
    MenuRadioGroup,
    MenuRadioItem,
    MenuTrigger,
} from '@/components/ui/menu';
import {
    Progress,
    ProgressIndicator,
    ProgressTrack,
} from '@/components/ui/progress';
import {
    feature as featureMedia,
    follow as followMedia,
    rating as rateMedia,
    reminder as mediaReminder,
    show as mediaShow,
} from '@/routes/media';

export type MediaDrawerItem = {
    description?: string;
    genres?: string[];
    image: string;
    isFeatured?: boolean;
    isFollowed?: boolean;
    kind: 'film' | 'series';
    nextEpisode?: string;
    platform: string;
    rating?: number;
    releasedEpisodes?: number;
    remindersEnabled?: boolean;
    seasonComplete?: string;
    slug?: string;
    status: 'airing' | 'binge-ready';
    subtitle: string;
    title: string;
    totalEpisodes?: number;
    userRating?: number;
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
    const [optimisticMedia, setOptimisticMedia] = useState<
        Record<string, MediaDrawerItem>
    >({});
    const drawerMedia =
        media?.slug && optimisticMedia[media.slug]
            ? optimisticMedia[media.slug]
            : media;

    const isOpen = drawerMedia !== null;
    const isAiring = drawerMedia?.status === 'airing';
    const isSeries = drawerMedia?.kind === 'series';
    const progress =
        drawerMedia?.releasedEpisodes && drawerMedia.totalEpisodes
            ? (drawerMedia.releasedEpisodes / drawerMedia.totalEpisodes) * 100
            : 0;

    function updateDrawerMedia(
        update: (current: MediaDrawerItem) => MediaDrawerItem,
    ): void {
        if (!drawerMedia?.slug) {
            return;
        }

        setOptimisticMedia((current) => ({
            ...current,
            [drawerMedia.slug as string]: update(drawerMedia),
        }));
    }

    function restoreDrawerMedia(previousMedia: MediaDrawerItem): void {
        if (!previousMedia.slug) {
            return;
        }

        setOptimisticMedia((current) => ({
            ...current,
            [previousMedia.slug as string]: previousMedia,
        }));
    }

    function toggleReminder(): void {
        if (!drawerMedia?.slug) {
            return;
        }

        const previousMedia = drawerMedia;

        updateDrawerMedia((current) => ({
            ...current,
            remindersEnabled: !current.remindersEnabled,
        }));
        router.post(mediaReminder(drawerMedia.slug), {}, {
            onError: () => restoreDrawerMedia(previousMedia),
            preserveScroll: true,
        });
    }

    function follow(): void {
        if (!drawerMedia?.slug || drawerMedia.isFollowed) {
            return;
        }

        const previousMedia = drawerMedia;

        updateDrawerMedia((current) => ({ ...current, isFollowed: true }));
        router.post(followMedia(drawerMedia.slug), {}, {
            onError: () => restoreDrawerMedia(previousMedia),
            preserveScroll: true,
        });
    }

    function feature(): void {
        if (!drawerMedia?.slug || drawerMedia.isFeatured) {
            return;
        }

        const previousMedia = drawerMedia;

        updateDrawerMedia((current) => ({ ...current, isFeatured: true }));
        router.post(featureMedia(drawerMedia.slug), {}, {
            onError: () => restoreDrawerMedia(previousMedia),
            preserveScroll: true,
        });
    }

    function rate(rating: number): void {
        if (!drawerMedia?.slug) {
            return;
        }

        const previousMedia = drawerMedia;

        updateDrawerMedia((current) => ({ ...current, userRating: rating }));
        router.post(rateMedia(drawerMedia.slug), { rating }, {
            onError: () => restoreDrawerMedia(previousMedia),
            preserveScroll: true,
        });
    }

    return (
        <Drawer onOpenChange={onOpenChange} open={isOpen} position="right">
            <DrawerPopup position="right" showCloseButton variant="inset">
                {drawerMedia && (
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
                                {drawerMedia.platform} · {drawerMedia.year}
                            </p>
                            <DrawerTitle className="mt-1 pe-8 text-3xl tracking-[-0.05em]">
                                {drawerMedia.title}
                            </DrawerTitle>
                            <DrawerDescription className="mt-2 pe-8">
                                {drawerMedia.subtitle}
                            </DrawerDescription>
                        </DrawerHeader>

                        <DrawerPanel className="flex flex-col gap-7 pt-5">
                            <div className="grid grid-cols-2 gap-2">
                                {drawerMedia.slug ? (
                                    <Button
                                        render={
                                            <Link
                                                href={mediaShow(
                                                    drawerMedia.slug,
                                                )}
                                                prefetch
                                            />
                                        }
                                    >
                                        <Play
                                            aria-hidden="true"
                                            className="fill-current"
                                        />
                                        Voir la fiche
                                    </Button>
                                ) : (
                                    <Button disabled>
                                        Fiche bientôt disponible
                                    </Button>
                                )}
                                <Button
                                    disabled={!drawerMedia.slug}
                                    onClick={toggleReminder}
                                    variant="secondary"
                                >
                                    <Bell
                                        aria-hidden="true"
                                        className={
                                            drawerMedia.remindersEnabled
                                                ? 'fill-current'
                                                : undefined
                                        }
                                    />
                                    {drawerMedia.remindersEnabled
                                        ? 'Rappel activé'
                                        : 'Me prévenir'}
                                </Button>
                            </div>

                            {isAiring && (
                                <section className="flex flex-col gap-4 border-y py-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                                Diffusion
                                            </p>
                                            <p className="mt-1 font-medium">
                                                {drawerMedia.nextEpisode}
                                            </p>
                                        </div>
                                        <Badge variant="outline">
                                            {drawerMedia.releasedEpisodes} /{' '}
                                            {drawerMedia.totalEpisodes}
                                        </Badge>
                                    </div>
                                    <Progress value={progress}>
                                        <ProgressTrack>
                                            <ProgressIndicator />
                                        </ProgressTrack>
                                    </Progress>
                                    <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                                        <span>
                                            {drawerMedia.releasedEpisodes} épisodes
                                            publiés
                                        </span>
                                        {drawerMedia.seasonComplete && (
                                            <span>
                                                Saison complète le{' '}
                                                {drawerMedia.seasonComplete}
                                            </span>
                                        )}
                                    </div>
                                </section>
                            )}

                            {(drawerMedia.description ||
                                drawerMedia.genres?.length) && (
                                <section className="flex flex-col gap-3">
                                    <h2 className="font-heading text-lg font-semibold">
                                        À propos
                                    </h2>
                                    {drawerMedia.description && (
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {drawerMedia.description}
                                        </p>
                                    )}
                                    {drawerMedia.genres && (
                                        <div className="flex flex-wrap gap-2">
                                            {drawerMedia.genres.map((genre) => (
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

                            {drawerMedia.rating !== undefined && (
                                <section className="flex items-center justify-between border-t pt-5">
                                    <div>
                                        <p className="text-xs tracking-[0.12em] text-muted-foreground uppercase">
                                            Communauté TMDB
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {drawerMedia.voteCount
                                                ? `${new Intl.NumberFormat('fr-FR').format(drawerMedia.voteCount)} votes`
                                                : 'Pas encore de votes'}
                                        </p>
                                    </div>
                                    <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                                        {Math.round(drawerMedia.rating * 10)}%
                                    </p>
                                </section>
                            )}
                        </DrawerPanel>

                        <DrawerFooter>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    disabled={
                                        !drawerMedia.slug ||
                                        drawerMedia.isFollowed
                                    }
                                    onClick={follow}
                                    variant="secondary"
                                >
                                    {drawerMedia.isFollowed && (
                                        <Check aria-hidden="true" />
                                    )}
                                    {drawerMedia.isFollowed
                                        ? 'Suivi'
                                        : 'Suivre'}
                                </Button>
                                <Menu>
                                    <MenuTrigger
                                        render={
                                            <Button
                                                disabled={!drawerMedia.slug}
                                                variant="secondary"
                                            />
                                        }
                                    >
                                        <Star
                                            aria-hidden="true"
                                            className={
                                                drawerMedia.userRating !==
                                                undefined
                                                    ? 'fill-current'
                                                    : undefined
                                            }
                                        />
                                        {drawerMedia.userRating !== undefined
                                            ? `${drawerMedia.userRating}/10`
                                            : 'Noter'}
                                    </MenuTrigger>
                                    <MenuPopup className="dark min-w-36">
                                        <MenuGroup>
                                            <MenuGroupLabel>
                                                Votre note
                                            </MenuGroupLabel>
                                            <MenuRadioGroup
                                                onValueChange={(value) =>
                                                    rate(Number(value))
                                                }
                                                value={
                                                    drawerMedia.userRating?.toString() ??
                                                    ''
                                                }
                                            >
                                                {Array.from(
                                                    { length: 10 },
                                                    (_, index) => index + 1,
                                                ).map((rating) => (
                                                    <MenuRadioItem
                                                        key={rating}
                                                        value={rating.toString()}
                                                    >
                                                        {rating}/10
                                                    </MenuRadioItem>
                                                ))}
                                            </MenuRadioGroup>
                                        </MenuGroup>
                                    </MenuPopup>
                                </Menu>
                            </div>
                            <Button
                                disabled={
                                    !drawerMedia.slug ||
                                    drawerMedia.isFeatured
                                }
                                onClick={feature}
                                variant={
                                    drawerMedia.isFeatured
                                        ? 'secondary'
                                        : 'outline'
                                }
                            >
                                {drawerMedia.isFeatured && (
                                    <Check aria-hidden="true" />
                                )}
                                {drawerMedia.isFeatured
                                    ? 'En avant sur l’accueil'
                                    : 'Mettre en avant'}
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerPopup>
        </Drawer>
    );
}
