import { Link, router } from '@inertiajs/react';
import { Bell, Check, Clock3, Play, Star } from 'lucide-react';
import type { ReactElement } from 'react';
import { useState } from 'react';
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
    feature as featureMedia,
    rating as rateMedia,
    reminder as mediaReminder,
    show as mediaShow,
} from '@/routes/media';

export type CalendarEvent = {
    date: string;
    episode?: string;
    image: string;
    kind: 'episode' | 'movie';
    media: {
        backdrop: string;
        description: string | null;
        genres: string[];
        image: string;
        isFeatured: boolean;
        platform: string;
        remindersEnabled: boolean;
        slug: string;
        title: string;
        userRating: number | null;
    };
    overview: string | null;
    runtime: number | null;
    season?: string;
    title: string;
    voteAverage: number | null;
    voteCount: number;
};

type CalendarEventDrawerProps = {
    event: CalendarEvent | null;
    onOpenChange: (open: boolean) => void;
};

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
}

function runtime(value: number | null): string {
    return value === null ? '—' : `${value} min`;
}

export function CalendarEventDrawer({
    event,
    onOpenChange,
}: CalendarEventDrawerProps): ReactElement {
    const [optimisticEvents, setOptimisticEvents] = useState<
        Record<string, CalendarEvent>
    >({});
    const calendarEvent =
        event && optimisticEvents[event.media.slug]
            ? optimisticEvents[event.media.slug]
            : event;

    function updateEvent(
        update: (current: CalendarEvent) => CalendarEvent,
    ): void {
        if (!calendarEvent) {
            return;
        }

        setOptimisticEvents((current) => ({
            ...current,
            [calendarEvent.media.slug]: update(calendarEvent),
        }));
    }

    function restoreEvent(previousEvent: CalendarEvent): void {
        setOptimisticEvents((current) => ({
            ...current,
            [previousEvent.media.slug]: previousEvent,
        }));
    }

    function toggleReminder(): void {
        if (!calendarEvent) {
            return;
        }

        const previousEvent = calendarEvent;

        updateEvent((current) => ({
            ...current,
            media: {
                ...current.media,
                remindersEnabled: !current.media.remindersEnabled,
            },
        }));
        router.post(mediaReminder(calendarEvent.media.slug), {}, {
            onError: () => restoreEvent(previousEvent),
            preserveScroll: true,
        });
    }

    function rate(rating: number): void {
        if (!calendarEvent) {
            return;
        }

        const previousEvent = calendarEvent;

        updateEvent((current) => ({
            ...current,
            media: { ...current.media, userRating: rating },
        }));
        router.post(rateMedia(calendarEvent.media.slug), { rating }, {
            onError: () => restoreEvent(previousEvent),
            preserveScroll: true,
        });
    }

    function feature(): void {
        if (!calendarEvent || calendarEvent.media.isFeatured) {
            return;
        }

        const previousEvent = calendarEvent;

        updateEvent((current) => ({
            ...current,
            media: { ...current.media, isFeatured: true },
        }));
        router.post(featureMedia(calendarEvent.media.slug), {}, {
            onError: () => restoreEvent(previousEvent),
            preserveScroll: true,
        });
    }

    return (
        <Drawer
            onOpenChange={onOpenChange}
            open={calendarEvent !== null}
            position="right"
        >
            <DrawerPopup position="right" showCloseButton variant="inset">
                {calendarEvent && (
                    <>
                        <DrawerHeader className="gap-0 p-6 pb-3">
                            <div className="flex flex-wrap items-center gap-2 pe-8">
                                <Badge variant="success">À venir</Badge>
                                <Badge variant="outline">
                                    {calendarEvent.episode ?? 'Film'}
                                </Badge>
                            </div>
                            <p className="mt-4 pe-8 text-sm text-muted-foreground">
                                {calendarEvent.season
                                    ? `${calendarEvent.season} · ${calendarEvent.media.platform}`
                                    : calendarEvent.media.platform}
                            </p>
                            <DrawerTitle className="mt-1 pe-8 text-3xl tracking-[-0.05em]">
                                {calendarEvent.title}
                            </DrawerTitle>
                            <DrawerDescription className="mt-2 pe-8">
                                {calendarEvent.media.title}
                            </DrawerDescription>
                        </DrawerHeader>

                        <DrawerPanel className="flex flex-col gap-7 pt-5">
                            <div className="overflow-hidden rounded-2xl bg-muted">
                                <img
                                    alt={`Image de ${calendarEvent.title}`}
                                    className="aspect-video w-full object-cover"
                                    src={calendarEvent.image}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-y py-5">
                                <div>
                                    <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                        Sortie
                                    </p>
                                    <p className="mt-1.5 text-sm font-medium">
                                        {formatDate(calendarEvent.date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                        Durée
                                    </p>
                                    <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium">
                                        <Clock3
                                            aria-hidden="true"
                                            className="size-3.5 text-muted-foreground"
                                        />
                                        {runtime(calendarEvent.runtime)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                        TMDB
                                    </p>
                                    <p className="mt-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                        {calendarEvent.voteAverage === null
                                            ? '—'
                                            : `${Math.round(calendarEvent.voteAverage * 10)}%`}
                                    </p>
                                </div>
                            </div>

                            {calendarEvent.overview && (
                                <section className="flex flex-col gap-3">
                                    <h2 className="font-heading text-lg font-semibold">
                                        À propos de cette sortie
                                    </h2>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {calendarEvent.overview}
                                    </p>
                                </section>
                            )}

                            {(calendarEvent.media.description ||
                                calendarEvent.media.genres.length > 0) && (
                                <section className="flex flex-col gap-3 border-t pt-5">
                                    <div>
                                        <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                            Dans votre collection
                                        </p>
                                        <h2 className="mt-1 font-heading text-lg font-semibold">
                                            {calendarEvent.media.title}
                                        </h2>
                                    </div>
                                    {calendarEvent.media.description && (
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {calendarEvent.media.description}
                                        </p>
                                    )}
                                    {calendarEvent.media.genres.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {calendarEvent.media.genres.map(
                                                (genre) => (
                                                    <Badge
                                                        key={genre}
                                                        variant="outline"
                                                    >
                                                        {genre}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    )}
                                </section>
                            )}

                            {calendarEvent.voteCount > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    {new Intl.NumberFormat('fr-FR').format(
                                        calendarEvent.voteCount,
                                    )}{' '}
                                    votes sur TMDB
                                </p>
                            )}
                        </DrawerPanel>

                        <DrawerFooter className="!flex-col !items-stretch gap-4 pt-5 sm:!flex-col">
                            <div className="grid w-full grid-cols-2 gap-3">
                                <Button
                                    render={
                                        <Link
                                            href={mediaShow(
                                                calendarEvent.media.slug,
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
                                <Button
                                    onClick={toggleReminder}
                                    variant="secondary"
                                >
                                    <Bell
                                        aria-hidden="true"
                                        className={
                                            calendarEvent.media.remindersEnabled
                                                ? 'fill-current'
                                                : undefined
                                        }
                                    />
                                    {calendarEvent.media.remindersEnabled
                                        ? 'Rappel activé'
                                        : 'Me prévenir'}
                                </Button>
                            </div>
                            <div className="grid w-full grid-cols-2 gap-3">
                                <Menu>
                                    <MenuTrigger
                                        render={<Button variant="secondary" />}
                                    >
                                        <Star
                                            aria-hidden="true"
                                            className={
                                                calendarEvent.media.userRating !==
                                                null
                                                    ? 'fill-current'
                                                    : undefined
                                            }
                                        />
                                        {calendarEvent.media.userRating !== null
                                            ? `${calendarEvent.media.userRating}/10`
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
                                                    calendarEvent.media.userRating?.toString() ??
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
                                <Button
                                    disabled={calendarEvent.media.isFeatured}
                                    onClick={feature}
                                    variant={
                                        calendarEvent.media.isFeatured
                                            ? 'secondary'
                                            : 'outline'
                                    }
                                >
                                    {calendarEvent.media.isFeatured && (
                                        <Check aria-hidden="true" />
                                    )}
                                    {calendarEvent.media.isFeatured
                                        ? 'En avant'
                                        : 'Mettre en avant'}
                                </Button>
                            </div>
                        </DrawerFooter>
                    </>
                )}
            </DrawerPopup>
        </Drawer>
    );
}
