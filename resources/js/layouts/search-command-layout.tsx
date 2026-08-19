import type { PropsWithChildren, ReactElement } from 'react';
import { SearchCommandProvider } from '@/components/search-command';

export default function SearchCommandLayout({
    children,
}: PropsWithChildren): ReactElement {
    return <SearchCommandProvider>{children}</SearchCommandProvider>;
}
