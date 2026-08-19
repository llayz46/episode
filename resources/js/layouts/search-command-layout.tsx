import type { PropsWithChildren, ReactElement } from 'react';
import { FloatingToolbar } from '@/components/floating-toolbar';
import { SearchCommandProvider } from '@/components/search-command';

export default function SearchCommandLayout({
    children,
}: PropsWithChildren): ReactElement {
    return (
        <SearchCommandProvider>
            {children}
            <FloatingToolbar />
        </SearchCommandProvider>
    );
}
