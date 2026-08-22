import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { MediaDrawer } from '@/components/media-drawer';
import type { MediaDrawerItem } from '@/components/media-drawer';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';

type CollectionItem = MediaDrawerItem & {
    isFeatured: boolean;
    libraryStatus: string;
};

type CollectionPageProps = {
    items: CollectionItem[];
    total: number;
};

const statusLabels: Record<string, string> = {
    completed: 'Terminé',
    following: 'À suivre',
    watching: 'En cours',
    watchlist: 'À voir',
};

function matchesTab(item: CollectionItem, tab: string): boolean {
    if (tab === 'all') {
        return true;
    }

    if (tab === 'to-watch') {
        return ['following', 'watchlist'].includes(item.libraryStatus);
    }

    return item.libraryStatus === tab;
}

export default function CollectionPage({ items, total }: CollectionPageProps) {
    const [selectedMedia, setSelectedMedia] = useState<MediaDrawerItem | null>(
        null,
    );
    const counts = useMemo(
        () => ({
            all: total,
            completed: items.filter(
                (item) => item.libraryStatus === 'completed',
            ).length,
            toWatch: items.filter((item) =>
                ['following', 'watchlist'].includes(item.libraryStatus),
            ).length,
            watching: items.filter((item) => item.libraryStatus === 'watching')
                .length,
        }),
        [items, total],
    );

    const tabs = [
        { count: counts.all, label: 'Tout', value: 'all' },
        { count: counts.toWatch, label: 'À voir', value: 'to-watch' },
        { count: counts.watching, label: 'En cours', value: 'watching' },
        { count: counts.completed, label: 'Terminés', value: 'completed' },
    ];

    return (
        <>
            <Head title="Collection" />
            <main className="min-h-screen bg-background pb-28 text-foreground sm:pb-12">
                <div className="mx-auto flex w-full max-w-[1600px] flex-col px-5 pt-8 sm:px-8 sm:pt-12 lg:px-12">
                    <header className="max-w-2xl">
                        <p className="text-sm text-muted-foreground">
                            Votre espace personnel
                        </p>
                        <h1 className="mt-2 font-heading text-5xl font-semibold tracking-[-0.065em] sm:text-6xl">
                            Collection
                        </h1>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                            Retrouve les films et séries que tu suis, à voir ou
                            déjà terminés.
                        </p>
                    </header>

                    <Tabs className="mt-10" defaultValue="all">
                        <TabsList size="sm">
                            {tabs.map((tab) => (
                                <TabsTab key={tab.value} value={tab.value}>
                                    {tab.label}
                                    <Badge size="sm" variant="secondary">
                                        {tab.count}
                                    </Badge>
                                </TabsTab>
                            ))}
                        </TabsList>

                        {tabs.map((tab) => {
                            const filteredItems = items.filter((item) =>
                                matchesTab(item, tab.value),
                            );

                            return (
                                <TabsPanel
                                    className="pt-8"
                                    key={tab.value}
                                    value={tab.value}
                                >
                                    {filteredItems.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5 xl:grid-cols-6">
                                            {filteredItems.map((item) => (
                                                <article key={item.slug}>
                                                    <button
                                                        className="group w-full text-left"
                                                        onClick={() =>
                                                            setSelectedMedia(
                                                                item,
                                                            )
                                                        }
                                                        type="button"
                                                    >
                                                        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-muted">
                                                            {item.image ? (
                                                                <img
                                                                    alt={`Affiche de ${item.title}`}
                                                                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                                                                    src={
                                                                        item.image
                                                                    }
                                                                />
                                                            ) : null}
                                                            {item.isFeatured && (
                                                                <Badge className="absolute top-2 left-2">
                                                                    En avant
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="mt-3 flex flex-col gap-1">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h2 className="truncate font-medium">
                                                                    {item.title}
                                                                </h2>
                                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                                    {item.year}
                                                                </span>
                                                            </div>
                                                            <p className="truncate text-sm text-muted-foreground">
                                                                {item.subtitle}{' '}
                                                                ·{' '}
                                                                {item.platform}
                                                            </p>
                                                            <Badge
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                {statusLabels[
                                                                    item
                                                                        .libraryStatus
                                                                ] ??
                                                                    item.libraryStatus}
                                                            </Badge>
                                                        </div>
                                                    </button>
                                                </article>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex min-h-64 max-w-xl flex-col justify-center border-y py-10">
                                            <p className="font-medium">
                                                Rien ici pour le moment.
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Ajoute des films ou des séries
                                                depuis la recherche pour
                                                construire cette liste.
                                            </p>
                                        </div>
                                    )}
                                </TabsPanel>
                            );
                        })}
                    </Tabs>
                </div>
            </main>
            <MediaDrawer
                media={selectedMedia}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedMedia(null);
                    }
                }}
            />
        </>
    );
}
