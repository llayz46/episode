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
import { Kbd, KbdGroup } from "@/components/ui/kbd";

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
    return (
        <CommandDialog onOpenChange={onOpenChange} open={open}>
            <CommandDialogPopup className="dark">
                <Command>
                    <CommandInput placeholder="Rechercher une série, un film…" />
                    <CommandPanel>
                        <CommandList>
                            <CommandEmpty>
                                Aucun résultat pour cette recherche.
                            </CommandEmpty>
                            <CommandGroup>
                                <CommandGroupLabel>
                                    Accès rapide
                                </CommandGroupLabel>
                                <CommandItem
                                    onClick={() => onOpenChange(false)}
                                    value="silo saison 3"
                                >
                                    Silo · Saison 3
                                    <CommandShortcut>En cours</CommandShortcut>
                                </CommandItem>
                                <CommandItem
                                    onClick={() => onOpenChange(false)}
                                    value="calendrier sorties"
                                >
                                    Calendrier des sorties
                                </CommandItem>
                                <CommandItem
                                    onClick={() => onOpenChange(false)}
                                    value="bibliothèque watchlist"
                                >
                                    Ma bibliothèque
                                </CommandItem>
                            </CommandGroup>
                        </CommandList>
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
