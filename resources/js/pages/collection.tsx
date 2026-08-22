import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    CirclePlay,
    Clock3,
    Film,
    LibraryBig,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLogo from '@/components/app-logo';
import { MediaDrawer } from '@/components/media-drawer';
import type { MediaDrawerItem } from '@/components/media-drawer';
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
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs';
import { home } from '@/routes';

type CollectionItem = MediaDrawerItem & {
    isFeatured: boolean;
    libraryStatus: string;
    poster: string;
};

type CollectionPageProps = {
    items: CollectionItem[];
    total: number;
};

type CollectionTab = 'all' | 'to-watch' | 'watching' | 'completed';

const statusLabels: Record<string, string> = {
    completed: 'Terminé',
    following: 'À suivre',
    watching: 'En cours',
    watchlist: 'À voir',
};

function matchesTab(item: CollectionItem, tab: CollectionTab): boolean {
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

    const tabs: Array<{
        count: number;
        icon: typeof LibraryBig;
        label: string;
        value: CollectionTab;
    }> = [
        { count: counts.all, icon: LibraryBig, label: 'Tout', value: 'all' },
        {
            count: counts.toWatch,
            icon: CirclePlay,
            label: 'À voir',
            value: 'to-watch',
        },
        {
            count: counts.watching,
            icon: Clock3,
            label: 'En cours',
            value: 'watching',
        },
        {
            count: counts.completed,
            icon: CheckCircle2,
            label: 'Terminés',
            value: 'completed',
        },
    ];

    return (
        <>
            <Head title="Collection" />

            <main className="min-h-screen bg-background pb-28 text-foreground sm:pb-12">
                <div className="mx-auto w-full max-w-[1600px] px-5 pt-8 sm:px-8 sm:pt-12 lg:px-12">
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
                                <BreadcrumbPage>Collection</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <header className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                        <div className="max-w-2xl">
                            <p className="text-sm text-muted-foreground">
                                Votre bibliothèque personnelle
                            </p>
                            <h1 className="mt-2 font-heading text-5xl font-semibold tracking-[-0.065em] sm:text-6xl">
                                Collection
                            </h1>
                        </div>
                        <p className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-right">
                            {total} titres, dont {counts.toWatch} à voir et{' '}
                            {counts.watching} en cours.
                        </p>
                    </header>

                    <Tabs className="mt-10" defaultValue="all">
                        <TabsList
                            className="max-w-full justify-start overflow-x-auto"
                            size="sm"
                        >
                            {tabs.map((tab) => {
                                const Icon = tab.icon;

                                return (
                                    <TabsTab key={tab.value} value={tab.value}>
                                        <Icon aria-hidden="true" />
                                        {tab.label}
                                        <Badge size="sm" variant="secondary">
                                            {tab.count}
                                        </Badge>
                                    </TabsTab>
                                );
                            })}
                        </TabsList>

                        {tabs.map((tab) => {
                            const filteredItems = items.filter((item) =>
                                matchesTab(item, tab.value),
                            );

                            return (
                                <TabsPanel
                                    className="pt-7"
                                    key={tab.value}
                                    value={tab.value}
                                >
                                    <div className="mb-6 flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                {tab.value === 'all'
                                                    ? 'Les derniers ajouts à votre bibliothèque'
                                                    : `Vos titres ${tab.label.toLocaleLowerCase('fr-FR')}`}
                                            </p>
                                            <h2 className="mt-1 font-heading text-2xl font-semibold tracking-[-0.04em]">
                                                {filteredItems.length}{' '}
                                                {filteredItems.length > 1
                                                    ? 'titres'
                                                    : 'titre'}
                                            </h2>
                                        </div>
                                        {total > 0 && (
                                            <p className="hidden text-sm text-muted-foreground sm:block">
                                                Sélectionnez une affiche pour
                                                gérer un titre.
                                            </p>
                                        )}
                                    </div>

                                    {filteredItems.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                            {filteredItems.map((item) => (
                                                <article key={item.slug}>
                                                    <button
                                                        aria-label={`Gérer ${item.title}`}
                                                        className="group w-full text-left"
                                                        onClick={() =>
                                                            setSelectedMedia(
                                                                item,
                                                            )
                                                        }
                                                        type="button"
                                                    >
                                                        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-focus-visible:-translate-y-1 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                                                            {item.poster ? (
                                                                <img
                                                                    alt={`Affiche de ${item.title}`}
                                                                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                                                                    src={
                                                                        item.poster
                                                                    }
                                                                />
                                                            ) : (
                                                                <div className="flex size-full items-center justify-center text-muted-foreground">
                                                                    <Film
                                                                        aria-hidden="true"
                                                                        className="size-8"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                                                            <div className="absolute top-2 left-2">
                                                                {item.isFeatured && (
                                                                    <Badge
                                                                        className="border border-white/20 bg-black/85 text-white shadow-lg backdrop-blur-md"
                                                                        size="sm"
                                                                    >
                                                                        En avant
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <Badge
                                                                className="absolute right-2 bottom-2 border border-white/20 bg-black/85 text-white shadow-lg backdrop-blur-md"
                                                                size="sm"
                                                            >
                                                                {statusLabels[
                                                                    item
                                                                        .libraryStatus
                                                                ] ??
                                                                    item.libraryStatus}
                                                            </Badge>
                                                        </div>
                                                        <div className="mt-3 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h3 className="truncate font-medium">
                                                                    {item.title}
                                                                </h3>
                                                                <span className="shrink-0 text-xs text-muted-foreground">
                                                                    {item.year}
                                                                </span>
                                                            </div>
                                                            <p className="mt-1 truncate text-sm text-muted-foreground">
                                                                {item.subtitle}{' '}
                                                                ·{' '}
                                                                {item.platform}
                                                            </p>
                                                        </div>
                                                    </button>
                                                </article>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/30 px-6 py-12 text-center">
                                            <div className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm">
                                                <LibraryBig
                                                    aria-hidden="true"
                                                    className="size-5 text-primary"
                                                />
                                            </div>
                                            <h3 className="mt-5 font-heading text-xl font-semibold">
                                                Cette étagère est vide.
                                            </h3>
                                            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                                Ajoutez des films et des séries
                                                depuis la recherche pour les
                                                retrouver ici.
                                            </p>
                                            <Button
                                                render={
                                                    <Link
                                                        href={home()}
                                                        prefetch
                                                    />
                                                }
                                                size="sm"
                                                variant="secondary"
                                            >
                                                Découvrir des titres
                                            </Button>
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
