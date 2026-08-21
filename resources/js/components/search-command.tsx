import { router, useHttp } from '@inertiajs/react';
import {
    ArrowDownIcon,
    ArrowUpIcon,
    Clapperboard,
    CornerDownLeftIcon,
} from 'lucide-react';
import type { PropsWithChildren, ReactElement } from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { store as importMedia } from '@/actions/App/Http/Controllers/MediaImportController';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandCollection,
    CommandDialog,
    CommandDialogPopup,
    CommandEmpty,
    CommandFooter,
    CommandInput,
    CommandItem,
    CommandList,
    CommandPanel,
} from '@/components/ui/command';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { search as tmdbSearch } from '@/routes/tmdb';
import { Badge } from './ui/badge';

type SearchType = 'movie' | 'tv';

type TmdbSearchResult = {
    tmdbId: number;
    type: 'movie' | 'tv';
    title: string;
    overview: string | null;
    year: string | null;
    posterUrl: string | null;
};

type TmdbSearchResponse = {
    results: TmdbSearchResult[];
};

const searchTypes: Record<SearchType, { label: string }> = {
    movie: {
        label: 'Films',
    },
    tv: {
        label: 'Séries',
    },
};

function normalizedTitle(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('fr-FR')
        .trim();
}

type SearchCommandProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

type SearchCommandContextValue = {
    openSearchCommand: () => void;
};

const SearchCommandContext = createContext<SearchCommandContextValue | null>(
    null,
);

export function SearchCommandProvider({
    children,
}: PropsWithChildren): ReactElement {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === 'k'
            ) {
                event.preventDefault();
                setIsOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        return router.on('start', () => setIsOpen(false));
    }, []);

    return (
        <SearchCommandContext.Provider
            value={{ openSearchCommand: () => setIsOpen(true) }}
        >
            {children}
            <SearchCommand onOpenChange={setIsOpen} open={isOpen} />
        </SearchCommandContext.Provider>
    );
}

export function useSearchCommand(): SearchCommandContextValue {
    const context = useContext(SearchCommandContext);

    if (context === null) {
        throw new Error(
            'useSearchCommand must be used within a SearchCommandProvider.',
        );
    }

    return context;
}

export function SearchCommand({
    open,
    onOpenChange,
}: SearchCommandProps): ReactElement {
    const [searchType, setSearchType] = useState<SearchType>('tv');
    const [query, setQuery] = useState<string>('');
    const [resultsByType, setResultsByType] = useState<
        Record<SearchType, TmdbSearchResult[]>
    >({ movie: [], tv: [] });
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchFailed, setSearchFailed] = useState<boolean>(false);
    const { cancel: cancelMovieSearch, submit: submitMovieSearch } = useHttp();
    const { cancel: cancelSeriesSearch, submit: submitSeriesSearch } =
        useHttp();
    const requestId = useRef(0);
    const hasSearchQuery = query.trim().length >= 2;

    const handleSearchTypeChange = (value: SearchType) => {
        setSearchType(value);
    };

    useEffect(() => {
        const normalizedQuery = query.trim();
        const currentRequestId = requestId.current + 1;

        requestId.current = currentRequestId;
        cancelMovieSearch();
        cancelSeriesSearch();

        if (normalizedQuery.length < 2) {
            return;
        }

        const timeout = window.setTimeout(async () => {
            setIsSearching(true);
            setSearchFailed(false);

            const [movieResponse, seriesResponse] = await Promise.allSettled([
                submitMovieSearch(
                    tmdbSearch({
                        query: { query: normalizedQuery, type: 'movie' },
                    }),
                ),
                submitSeriesSearch(
                    tmdbSearch({
                        query: { query: normalizedQuery, type: 'tv' },
                    }),
                ),
            ]);

            if (requestId.current === currentRequestId) {
                setResultsByType({
                    movie:
                        movieResponse.status === 'fulfilled'
                            ? (movieResponse.value as TmdbSearchResponse)
                                  .results
                            : [],
                    tv:
                        seriesResponse.status === 'fulfilled'
                            ? (seriesResponse.value as TmdbSearchResponse)
                                  .results
                            : [],
                });
                setSearchFailed(
                    movieResponse.status === 'rejected' &&
                        seriesResponse.status === 'rejected',
                );
                setIsSearching(false);
            }
        }, 300);

        return () => {
            window.clearTimeout(timeout);
            cancelMovieSearch();
            cancelSeriesSearch();
        };
    }, [
        cancelMovieSearch,
        cancelSeriesSearch,
        query,
        submitMovieSearch,
        submitSeriesSearch,
    ]);

    const alternateSearchType = searchType === 'tv' ? 'movie' : 'tv';
    const suggestedResult = hasSearchQuery
        ? resultsByType[alternateSearchType].find(
              (result) =>
                  normalizedTitle(result.title) === normalizedTitle(query),
          )
        : undefined;
    const suggestedTypeLabel =
        alternateSearchType === 'movie' ? 'film' : 'série';
    const switchLabel =
        alternateSearchType === 'movie' ? 'Voir les films' : 'Voir les séries';

    const importResult = (result: TmdbSearchResult): void => {
        router.post(importMedia(), {
            tmdb_id: result.tmdbId,
            type: result.type,
        });
    };

    return (
        <CommandDialog onOpenChange={onOpenChange} open={open}>
            <CommandDialogPopup className="dark">
                <Command
                    filter={null}
                    itemToStringValue={(item: unknown) => {
                        const result = item as TmdbSearchResult;

                        return `${result.title} ${result.year ?? ''}`;
                    }}
                    items={hasSearchQuery ? resultsByType[searchType] : []}
                >
                    <CommandInput
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Rechercher un film ou une série"
                        value={query}
                    />
                    <div className="border-t px-4 py-2">
                        <div className="flex gap-1">
                            {(
                                Object.entries(searchTypes) as [
                                    SearchType,
                                    (typeof searchTypes)[SearchType],
                                ][]
                            ).map(([value, { label }]) => (
                                <Button
                                    aria-pressed={searchType === value}
                                    key={value}
                                    onClick={() =>
                                        handleSearchTypeChange(value)
                                    }
                                    size="sm"
                                    type="button"
                                    variant={
                                        searchType === value
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </div>
                    {suggestedResult && (
                        <div className="flex items-center justify-between gap-3 border-t px-4 py-2">
                            <p className="min-w-0 truncate text-xs text-muted-foreground">
                                Vous cherchez peut-être le {suggestedTypeLabel}{' '}
                                <span className="font-medium text-foreground">
                                    {suggestedResult.title}
                                    {suggestedResult.year &&
                                        ` (${suggestedResult.year})`}
                                </span>
                            </p>
                            <Button
                                onClick={() =>
                                    handleSearchTypeChange(alternateSearchType)
                                }
                                size="sm"
                                type="button"
                                variant="ghost"
                            >
                                {switchLabel}
                            </Button>
                        </div>
                    )}
                    <CommandPanel>
                        {!hasSearchQuery ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Saisissez au moins deux caractères pour
                                rechercher.
                            </div>
                        ) : (
                            <CommandList>
                                {isSearching ? (
                                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        Recherche en cours...
                                    </div>
                                ) : searchFailed ? (
                                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        La recherche est indisponible.
                                    </div>
                                ) : (
                                    <>
                                        <CommandCollection>
                                            {(result: TmdbSearchResult) => {
                                                return (
                                                    <CommandItem
                                                        key={`${result.type}-${result.tmdbId}`}
                                                        onClick={() =>
                                                            importResult(result)
                                                        }
                                                        value={result}
                                                    >
                                                        {result.posterUrl ? (
                                                            <img
                                                                alt=""
                                                                className="aspect-2/3 w-9 rounded-sm object-cover"
                                                                src={
                                                                    result.posterUrl
                                                                }
                                                            />
                                                        ) : (
                                                            <div className="flex aspect-2/3 w-9 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                                                                <Clapperboard />
                                                            </div>
                                                        )}
                                                        <span className="ml-3 min-w-0 flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="truncate text-sm font-medium text-white">
                                                                    {
                                                                        result.title
                                                                    }
                                                                </span>
                                                                <span className="shrink-0 text-xxs text-zinc-500">
                                                                    {
                                                                        result.year
                                                                    }
                                                                </span>
                                                            </div>

                                                            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <Badge
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    {result.type ===
                                                                    'movie'
                                                                        ? 'Film'
                                                                        : 'Série'}
                                                                </Badge>
                                                            </span>
                                                            <p className="mt-0.5 truncate text-[11px] leading-tight text-zinc-500">
                                                                {
                                                                    result.overview
                                                                }
                                                            </p>
                                                        </span>
                                                    </CommandItem>
                                                );
                                            }}
                                        </CommandCollection>
                                        <CommandEmpty>
                                            Aucun résultat pour cette recherche.
                                        </CommandEmpty>
                                    </>
                                )}
                            </CommandList>
                        )}
                    </CommandPanel>
                    <CommandFooter>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <KbdGroup>
                                    <Kbd>
                                        <ArrowUpIcon />
                                    </Kbd>
                                    <Kbd>
                                        <ArrowDownIcon />
                                    </Kbd>
                                </KbdGroup>
                                <span>Naviguer</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Kbd>
                                    <CornerDownLeftIcon />
                                </Kbd>
                                <span>Ouvrir</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Kbd>Echap</Kbd>
                            <span>Fermer</span>
                        </div>
                    </CommandFooter>
                </Command>
            </CommandDialogPopup>
        </CommandDialog>
    );
}
