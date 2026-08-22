import { Link } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerPanel,
    DrawerPopup,
    DrawerTitle,
} from '@/components/ui/drawer';
import { show as mediaShow } from '@/routes/media';

export type CalendarEvent = {
    date: string;
    episode?: string;
    image: string;
    kind: 'episode' | 'movie';
    media: {
        image: string;
        platform: string;
        slug: string;
        title: string;
    };
    title: string;
};

type CalendarEventDrawerProps = {
    event: CalendarEvent | null;
    onOpenChange: (open: boolean) => void;
};

function formatDate(date: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
}

export function CalendarEventDrawer({
    event,
    onOpenChange,
}: CalendarEventDrawerProps): ReactElement {
    return (
        <Drawer
            onOpenChange={onOpenChange}
            open={event !== null}
            position="right"
        >
            <DrawerPopup position="right" showCloseButton variant="inset">
                {event && (
                    <>
                        <DrawerHeader className="gap-0 p-6 pb-3">
                            <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 pe-8">
                                <div className="aspect-[2/3] overflow-hidden rounded-xl bg-muted">
                                    {event.media.image && (
                                        <img
                                            alt={`Affiche de ${event.media.title}`}
                                            className="size-full object-cover"
                                            src={event.media.image}
                                        />
                                    )}
                                </div>
                                <div className="min-w-0 pt-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="success">À venir</Badge>
                                        <Badge variant="outline">
                                            {event.episode ?? 'Film'}
                                        </Badge>
                                    </div>
                                    <p className="mt-4 text-sm text-muted-foreground">
                                        {event.media.platform}
                                    </p>
                                    <DrawerTitle className="mt-1 text-3xl tracking-[-0.05em]">
                                        {event.media.title}
                                    </DrawerTitle>
                                    <DrawerDescription className="mt-2">
                                        {event.title}
                                    </DrawerDescription>
                                </div>
                            </div>
                        </DrawerHeader>

                        <DrawerPanel className="flex flex-col gap-6 pt-5">
                            <section className="grid grid-cols-2 gap-4 border-y py-5">
                                <div>
                                    <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                        Sortie
                                    </p>
                                    <p className="mt-1.5 font-medium">
                                        {formatDate(event.date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                        Format
                                    </p>
                                    <p className="mt-1.5 font-medium">
                                        {event.kind === 'episode'
                                            ? 'Épisode'
                                            : 'Film'}
                                    </p>
                                </div>
                            </section>
                            <p className="text-sm leading-6 text-muted-foreground">
                                Cette sortie est affichée car{' '}
                                {event.media.title} fait partie de votre
                                collection.
                            </p>
                        </DrawerPanel>

                        <DrawerFooter>
                            <Button variant="secondary">Me prévenir</Button>
                            <Button
                                render={
                                    <Link href={mediaShow(event.media.slug)} />
                                }
                            >
                                Voir la fiche complète
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerPopup>
        </Drawer>
    );
}
