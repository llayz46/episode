import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLogo from '@/components/app-logo';
import { CalendarEventDrawer } from '@/components/calendar-event-drawer';
import type { CalendarEvent } from '@/components/calendar-event-drawer';
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
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';
import { calendar, home } from '@/routes';

type CalendarPageProps = {
    events: CalendarEvent[];
    month: string;
    view: CalendarView;
};

type CalendarView = 'month' | 'week';

const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function formatMonth(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
}

function dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addMonths(year: number, month: number, amount: number): string {
    const date = new Date(year, month + amount, 1);

    return formatMonth(date.getFullYear(), date.getMonth());
}

function formatEventDate(date: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
    }).format(new Date(`${date}T12:00:00`));
}

function startOfWeek(date: Date): Date {
    const weekStart = new Date(date);
    const dayOffset = (weekStart.getDay() + 6) % 7;

    weekStart.setDate(weekStart.getDate() - dayOffset);

    return weekStart;
}

function CalendarEventCard({
    event,
    onSelect,
}: {
    event: CalendarEvent;
    onSelect: (event: CalendarEvent) => void;
}) {
    return (
        <button
            className="group relative aspect-[1.55] w-full overflow-hidden rounded-lg border border-white/25 bg-muted text-left text-white transition hover:border-white/45 hover:brightness-110"
            onClick={() => onSelect(event)}
            type="button"
        >
            {event.image && (
                <img
                    alt=""
                    className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                    src={event.image}
                />
            )}
            <span className="absolute inset-0 bg-black/45" />
            <span className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
                <span className="truncate text-[0.625rem] font-medium text-white/90">
                    {event.episode ?? 'Film'}
                </span>
                <Badge size="sm" variant="success">
                    À venir
                </Badge>
            </span>
            <span className="absolute inset-x-2 bottom-2 min-w-0">
                <span className="block truncate text-xs font-semibold">
                    {event.media.title}
                </span>
                <span className="mt-0.5 block truncate text-[0.625rem] text-white/70">
                    {event.title}
                </span>
            </span>
        </button>
    );
}

export default function CalendarPage({
    events,
    month,
    view,
}: CalendarPageProps) {
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
        null,
    );
    const [viewMode, setViewMode] = useState<CalendarView>(view);
    const [year, monthNumber] = month.split('-').map(Number);
    const firstDay = new Date(year, monthNumber - 1, 1);
    const lastDay = new Date(year, monthNumber, 0);
    const leadingDays = (firstDay.getDay() + 6) % 7;
    const calendarDays = Math.ceil((leadingDays + lastDay.getDate()) / 7) * 7;
    const monthLabel = new Intl.DateTimeFormat('fr-FR', {
        month: 'long',
        year: 'numeric',
    }).format(firstDay);
    const todayDate = new Date();
    const today = dateKey(todayDate);
    const eventsByDay = useMemo(
        () =>
            events.reduce<Record<string, CalendarEvent[]>>((days, event) => {
                days[event.date] ??= [];
                days[event.date].push(event);

                return days;
            }, {}),
        [events],
    );
    const days = Array.from({ length: calendarDays }, (_, index) => {
        const date = new Date(year, monthNumber - 1, index - leadingDays + 1);

        return {
            date,
            events: eventsByDay[dateKey(date)] ?? [],
            isCurrentMonth: date.getMonth() === monthNumber - 1,
            isToday: dateKey(date) === today,
        };
    });
    const weekAnchor =
        todayDate.getFullYear() === year &&
        todayDate.getMonth() === monthNumber - 1
            ? todayDate
            : firstDay;
    const weekDates = Array.from({ length: 7 }, (_, index) => {
        const date = startOfWeek(weekAnchor);

        date.setDate(date.getDate() + index);

        return {
            date,
            events: eventsByDay[dateKey(date)] ?? [],
            isToday: dateKey(date) === today,
        };
    });
    const eventGroups = useMemo(
        () =>
            Object.entries(eventsByDay).sort(([firstDate], [secondDate]) =>
                firstDate.localeCompare(secondDate),
            ),
        [eventsByDay],
    );

    return (
        <>
            <Head title="Calendrier" />
            <ScrollArea className="h-dvh bg-background [&_[data-slot=scroll-area-scrollbar]]:opacity-80 [&_[data-slot=scroll-area-scrollbar]]:delay-0 [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-2 [&_[data-slot=scroll-area-thumb]]:bg-foreground/50">
                <main className="min-h-screen bg-background pb-28 text-foreground sm:pb-12">
                    <div className="mx-auto flex w-full max-w-[1600px] flex-col px-5 py-6 sm:px-8 sm:py-8 lg:px-12">
                        <Link href={home()} prefetch>
                            <AppLogo />
                        </Link>

                        <Breadcrumb className="mt-12">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink
                                        render={<Link href={home()} prefetch />}
                                    >
                                        Accueil
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator> / </BreadcrumbSeparator>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Calendrier</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <header className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Vos sorties suivies
                                </p>
                                <h1 className="mt-2 font-heading text-5xl font-semibold tracking-[-0.065em] sm:text-6xl">
                                    Calendrier
                                </h1>
                            </div>
                            <p className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-right">
                                Les prochains épisodes et films de votre
                                collection, sans bruit extérieur.
                            </p>
                        </header>

                        <section
                            aria-labelledby="calendar-month"
                            className="mt-10"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <h2
                                    className="font-heading text-2xl font-semibold tracking-[-0.04em] capitalize"
                                    id="calendar-month"
                                >
                                    {monthLabel}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Button
                                        render={
                                            <Link
                                                href={calendar({
                                                    query: {
                                                        month: addMonths(
                                                            year,
                                                            monthNumber - 1,
                                                            -1,
                                                        ),
                                                        view: viewMode,
                                                    },
                                                })}
                                                preserveScroll
                                            />
                                        }
                                        size="sm"
                                        variant="outline"
                                    >
                                        Précédent
                                    </Button>
                                    <Button
                                        render={
                                            <Link
                                                href={calendar({
                                                    query: { view: viewMode },
                                                })}
                                                preserveScroll
                                            />
                                        }
                                        size="sm"
                                        variant="secondary"
                                    >
                                        Aujourd’hui
                                    </Button>
                                    <Button
                                        render={
                                            <Link
                                                href={calendar({
                                                    query: {
                                                        month: addMonths(
                                                            year,
                                                            monthNumber - 1,
                                                            1,
                                                        ),
                                                        view: viewMode,
                                                    },
                                                })}
                                                preserveScroll
                                            />
                                        }
                                        size="sm"
                                        variant="outline"
                                    >
                                        Suivant
                                    </Button>
                                </div>
                            </div>

                            <Tabs
                                className="mt-6"
                                onValueChange={(value) =>
                                    setViewMode(value as CalendarView)
                                }
                                value={viewMode}
                            >
                                <TabsList size="sm">
                                    <TabsTab value="month">Mois</TabsTab>
                                    <TabsTab value="week">Semaine</TabsTab>
                                </TabsList>

                                <TabsPanel className="pt-6" value="month">
                                    <div className="overflow-x-auto pb-2">
                                        <div className="min-w-[48rem] overflow-hidden rounded-2xl border border-border">
                                            <div className="grid grid-cols-7 border-b border-border bg-muted/40">
                                                {weekDays.map((day) => (
                                                    <p
                                                        className="px-3 py-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase"
                                                        key={day}
                                                    >
                                                        {day}
                                                    </p>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-7">
                                                {days.map((day) => (
                                                    <div
                                                        className="min-h-36 border-r border-b border-border p-2.5"
                                                        key={dateKey(day.date)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span
                                                                className={
                                                                    day.isToday
                                                                        ? 'flex size-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground'
                                                                        : day.isCurrentMonth
                                                                          ? 'text-sm font-medium'
                                                                          : 'text-sm text-muted-foreground/50'
                                                                }
                                                            >
                                                                {day.date.getDate()}
                                                            </span>
                                                            {day.events.length >
                                                                0 && (
                                                                <Badge
                                                                    size="sm"
                                                                    variant="secondary"
                                                                >
                                                                    {
                                                                        day
                                                                            .events
                                                                            .length
                                                                    }
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-3 flex flex-col gap-1.5">
                                                            {day.events.map(
                                                                (event) => (
                                                                    <CalendarEventCard
                                                                        event={
                                                                            event
                                                                        }
                                                                        key={`${event.kind}-${event.media.slug}-${event.title}`}
                                                                        onSelect={
                                                                            setSelectedEvent
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </TabsPanel>

                                <TabsPanel className="pt-6" value="week">
                                    <div className="overflow-x-auto pb-2">
                                        <div className="grid min-w-[56rem] grid-cols-7 overflow-hidden rounded-2xl border border-border">
                                            {weekDates.map((day) => (
                                                <section
                                                    className="min-h-72 border-r border-border p-4 last:border-r-0"
                                                    key={dateKey(day.date)}
                                                >
                                                    <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                                        {
                                                            weekDays[
                                                                (day.date.getDay() +
                                                                    6) %
                                                                    7
                                                            ]
                                                        }
                                                    </p>
                                                    <p
                                                        className={
                                                            day.isToday
                                                                ? 'mt-2 flex size-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground'
                                                                : 'mt-2 text-xl font-semibold tracking-[-0.04em]'
                                                        }
                                                    >
                                                        {day.date.getDate()}
                                                    </p>
                                                    <div className="mt-5 flex flex-col gap-2">
                                                        {day.events.length >
                                                        0 ? (
                                                            day.events.map(
                                                                (event) => (
                                                                    <CalendarEventCard
                                                                        event={
                                                                            event
                                                                        }
                                                                        key={`${event.kind}-${event.media.slug}-${event.title}`}
                                                                        onSelect={
                                                                            setSelectedEvent
                                                                        }
                                                                    />
                                                                ),
                                                            )
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground">
                                                                Aucune sortie
                                                            </p>
                                                        )}
                                                    </div>
                                                </section>
                                            ))}
                                        </div>
                                    </div>
                                </TabsPanel>
                            </Tabs>
                        </section>

                        <section className="mt-12 border-t pt-6">
                            <div className="flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        {events.length} sortie
                                        {events.length > 1 ? 's' : ''} ce mois
                                    </p>
                                    <h2 className="mt-1 font-heading text-2xl font-semibold tracking-[-0.04em]">
                                        Prochaines sorties
                                    </h2>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Sélectionnez une sortie pour ses détails.
                                </p>
                            </div>

                            {eventGroups.length > 0 ? (
                                <div className="mt-6 divide-y border-y">
                                    {eventGroups.map(([date, dayEvents]) => (
                                        <div
                                            className="grid gap-3 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
                                            key={date}
                                        >
                                            <p className="text-sm font-medium capitalize">
                                                {formatEventDate(date)}
                                            </p>
                                            <div className="flex flex-col gap-1">
                                                {dayEvents.map((event) => (
                                                    <button
                                                        className="flex items-center justify-between gap-4 rounded-lg p-2 text-left transition hover:bg-muted"
                                                        key={`${event.kind}-${event.media.slug}-${event.title}`}
                                                        onClick={() =>
                                                            setSelectedEvent(
                                                                event,
                                                            )
                                                        }
                                                        type="button"
                                                    >
                                                        <span className="flex min-w-0 items-center gap-3">
                                                            {event.media
                                                                .image && (
                                                                <img
                                                                    alt=""
                                                                    className="h-11 w-8 shrink-0 rounded-md object-cover"
                                                                    src={
                                                                        event
                                                                            .media
                                                                            .image
                                                                    }
                                                                />
                                                            )}
                                                            <span className="min-w-0">
                                                                <span className="block truncate font-medium">
                                                                    {
                                                                        event
                                                                            .media
                                                                            .title
                                                                    }
                                                                </span>
                                                                <span className="mt-1 block truncate text-sm text-muted-foreground">
                                                                    {event.episode
                                                                        ? `${event.episode} · ${event.title}`
                                                                        : event.title}
                                                                </span>
                                                            </span>
                                                        </span>
                                                        <Badge variant="outline">
                                                            {
                                                                event.media
                                                                    .platform
                                                            }
                                                        </Badge>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-5 text-sm text-muted-foreground">
                                    Aucune sortie suivie ce mois-ci.
                                </p>
                            )}
                        </section>
                    </div>
                </main>
            </ScrollArea>
            <CalendarEventDrawer
                event={selectedEvent}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedEvent(null);
                    }
                }}
            />
        </>
    );
}
