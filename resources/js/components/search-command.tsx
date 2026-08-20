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

type SearchType = 'all' | 'movie' | 'tv';

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
    all: {
        label: 'Tout',
    },
    movie: {
        label: 'Films',
    },
    tv: {
        label: 'Séries',
    },
};

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
    const [searchType, setSearchType] = useState<SearchType>('all');
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<TmdbSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchFailed, setSearchFailed] = useState<boolean>(false);
    const { cancel, submit } = useHttp();
    const requestId = useRef(0);
    
    const handleSearchTypeChange = (value: SearchType) => {
        setSearchType(value);
    };

    useEffect(() => {
        const normalizedQuery = query.trim();
        const currentRequestId = requestId.current + 1;

        requestId.current = currentRequestId;
        cancel();

        if (normalizedQuery.length < 2) {
            return;
        }

        const timeout = window.setTimeout(async () => {
            setIsSearching(true);
            setSearchFailed(false);

            try {
                const response = (await submit(
                    tmdbSearch({
                        query: { query: normalizedQuery, type: searchType },
                    }),
                )) as TmdbSearchResponse;

                if (requestId.current === currentRequestId) {
                    setResults(response.results);
                }
            } catch {
                if (requestId.current === currentRequestId) {
                    setResults([]);
                    setSearchFailed(true);
                }
            } finally {
                if (requestId.current === currentRequestId) {
                    setIsSearching(false);
                }
            }
        }, 300);

        return () => {
            window.clearTimeout(timeout);
            cancel();
        };
    }, [cancel, query, searchType, submit]);

    const importResult = (result: TmdbSearchResult): void => {
        router.post(
            importMedia(),
            {
                tmdb_id: result.tmdbId,
                type: result.type,
            },
            {
                onSuccess: () => onOpenChange(false),
            },
        );
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
                    items={results}
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
                    <CommandPanel>
                        {query.trim().length < 2 ? (
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
                                                        <span className="min-w-0 flex-1 ml-3">
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
                                                                <Badge variant="outline" size="sm">
                                                                    {result.type ===
                                                                    'movie'
                                                                        ? 'Film'
                                                                        : 'Série'}
                                                                </Badge>
                                                            </span>
                                                            <p className="mt-0.5 truncate text-[11px] leading-tight text-zinc-500">
                                                                {result.overview}
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
