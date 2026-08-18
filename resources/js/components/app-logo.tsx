import { cn } from '@/lib/utils';

export default function AppLogo({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'font-heading text-lg font-normal tracking-[-0.055em] lowercase',
                className,
            )}
        >
            episode.
        </span>
    );
}
