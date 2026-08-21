import { Home } from '@/components/home';
import type { MediaDrawerItem } from '@/components/media-drawer';

type HomePageProps = {
    featuredMedia: MediaDrawerItem | null;
    trackedMedia: MediaDrawerItem[];
};

export default function HomePage({
    featuredMedia,
    trackedMedia,
}: HomePageProps) {
    return <Home featuredMedia={featuredMedia} trackedMedia={trackedMedia} />;
}
