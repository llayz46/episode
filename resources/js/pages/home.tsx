import type { ComponentProps, ReactElement } from 'react';
import { Home } from '@/components/home';

type HomePageProps = ComponentProps<typeof Home>;

export default function HomePage(props: HomePageProps): ReactElement {
    return <Home {...props} />;
}
