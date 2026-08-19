import { ArrowDownIcon, ArrowUpIcon, CornerDownLeftIcon } from 'lucide-react';
import type { PropsWithChildren, ReactElement } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import {
    Command,
    CommandDialog,
    CommandDialogPopup,
    CommandEmpty,
    CommandFooter,
    CommandGroup,
    CommandGroupLabel,
    CommandInput,
    CommandItem,
    CommandList,
    CommandPanel,
    CommandShortcut,
} from '@/components/ui/command';
import { Kbd, KbdGroup } from '@/components/ui/kbd';

type SearchType = 'all' | 'movie' | 'tv' | 'person';

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
    person: {
        label: 'Personnes',
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

    const handleSearchTypeChange = (value: SearchType) => {
        setSearchType(value);
    };

    return (
        <CommandDialog onOpenChange={onOpenChange} open={open}>
            <CommandDialogPopup className="dark">
                <Command>
                    <CommandInput placeholder="Rechercher un film, une série ou une personne" value={query} onChange={(e) => setQuery(e.target.value)} />
                    <div className="border-t px-4 py-2">
                        <div className="flex gap-1">
                            {(
                                Object.entries(searchTypes) as [
                                    SearchType,
                                    (typeof searchTypes)[SearchType],
                                ][]
                            ).map(([value, { label }]) => (
                                <button
                                    aria-pressed={searchType === value}
                                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                        searchType === value
                                            ? 'bg-white/10 text-white'
                                            : 'text-white/50 hover:text-white'
                                    }`}
                                    key={value}
                                    onClick={() =>
                                        handleSearchTypeChange(value)
                                    }
                                    type="button"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <CommandPanel>
                        {query.trim() === '' ? (
                            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Commencez à saisir pour rechercher
                            </div>
                        ) : (
                            <CommandList>
                                <CommandEmpty>
                                    Aucun résultat pour cette recherche.
                                </CommandEmpty>
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
