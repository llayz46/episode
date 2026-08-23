import { Head, Link, router } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { store as importMedia } from '@/actions/App/Http/Controllers/MediaImportController';
import { home } from '@/routes';
import { show as mediaShow } from '@/routes/media';
import type { Person, PersonCredit } from '@/types/person';

type PersonShowProps = {
    person: Person;
};

function FilmographyCard({ credit }: { credit: PersonCredit }): ReactElement {
    const content = (
        <>
            <div className="relative aspect-[2/3] overflow-hidden bg-white/10">
                {credit.poster ? (
                    <img
                        alt={`Affiche de ${credit.title}`}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        src={credit.poster}
                    />
                ) : (
                    <div className="flex size-full items-end bg-linear-to-br from-white/15 to-white/5 p-3">
                        <span className="text-xs font-medium text-white/70">
                            {credit.title}
                        </span>
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/65 to-transparent px-3 pt-12 pb-3">
                    <p className="text-[10px] font-medium tracking-[0.14em] text-white/60 uppercase">
                        {credit.type === 'movie' ? 'Film' : 'Série'}
                        {credit.year && ` · ${credit.year}`}
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-white">
                        {credit.title}
                    </p>
                    {credit.role && (
                        <p className="mt-0.5 truncate text-xs text-white/60">
                            {credit.role}
                        </p>
                    )}
                </div>
            </div>
        </>
    );

    return credit.slug ? (
        <Link
            className="group block overflow-hidden rounded-xl bg-white/10"
            href={mediaShow(credit.slug)}
            prefetch
        >
            {content}
        </Link>
    ) : (
        <button
            aria-label={`Découvrir ${credit.title}`}
            className="group overflow-hidden rounded-xl bg-white/10 text-start"
            onClick={() =>
                router.post(importMedia(), {
                    tmdb_id: credit.tmdbId,
                    type: credit.type,
                })
            }
            type="button"
        >
            {content}
        </button>
    );
}

export default function PersonShow({ person }: PersonShowProps): ReactElement {
    const portraitInitial = person.name.charAt(0).toUpperCase();
    const [isBiographyExpanded, setIsBiographyExpanded] = useState(false);

    return (
        <main className="dark relative isolate h-dvh overflow-hidden bg-neutral-950 text-white">
            <Head title={person.name} />

            {person.profile && (
                <img
                    alt=""
                    className="pointer-events-none fixed inset-0 -z-30 size-full scale-110 object-cover opacity-20 blur-3xl"
                    src={person.profile}
                />
            )}
            <div className="pointer-events-none fixed inset-0 -z-20 bg-linear-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/70" />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-linear-to-t from-neutral-950 via-transparent to-black/30" />

            <ScrollArea className="h-dvh [&_[data-slot=scroll-area-scrollbar]]:opacity-80 [&_[data-slot=scroll-area-scrollbar]]:delay-0 [&_[data-slot=scroll-area-scrollbar][data-orientation=vertical]]:w-2 [&_[data-slot=scroll-area-thumb]]:bg-white/35">
                <div className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
                    <header>
                        <AppLogo className="text-white" />
                    </header>

                    <Breadcrumb className="mt-12 lg:mt-16">
                        <BreadcrumbList className="text-white/60">
                            <BreadcrumbItem>
                                <BreadcrumbLink
                                    render={<Link href={home()} prefetch />}
                                >
                                    Accueil
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator> / </BreadcrumbSeparator>
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-white">
                                    {person.name}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <section className="mt-8 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)_13rem] lg:items-start lg:gap-8">
                        {person.profile ? (
                            <img
                                alt={`Portrait de ${person.name}`}
                                className="aspect-[2/3] w-44 rounded-2xl object-cover shadow-2xl shadow-black/50 sm:w-52 lg:w-full"
                                src={person.profile}
                            />
                        ) : (
                            <div className="flex aspect-[2/3] w-44 items-center justify-center rounded-2xl bg-white/10 text-5xl font-semibold text-white/65 shadow-2xl shadow-black/50 sm:w-52 lg:w-full">
                                {portraitInitial}
                            </div>
                        )}

                        <div className="max-w-2xl">
                            <p className="text-sm font-medium tracking-[0.18em] text-white/60 uppercase">
                                {person.knownForDepartment ?? 'Personnalité'}
                            </p>
                            <h1 className="mt-4 font-heading text-5xl font-semibold tracking-[-0.065em] sm:text-7xl">
                                {person.name}
                            </h1>
                            {person.biography && (
                                <div className="mt-5 max-w-xl">
                                    <p
                                        className={`text-sm leading-6 text-white/75 sm:text-base sm:leading-7 ${isBiographyExpanded ? '' : 'max-h-[7.5rem] overflow-hidden sm:max-h-[8.75rem]'}`}
                                        id="person-biography"
                                    >
                                        {person.biography}
                                    </p>
                                    <Button
                                        aria-controls="person-biography"
                                        aria-expanded={isBiographyExpanded}
                                        className="-ms-2 mt-1 text-white/70 hover:text-white"
                                        size="xs"
                                        type="button"
                                        variant="link"
                                        onClick={() =>
                                            setIsBiographyExpanded(
                                                (isExpanded) => !isExpanded,
                                            )
                                        }
                                    >
                                        {isBiographyExpanded
                                            ? 'Voir moins'
                                            : 'Voir plus'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <aside className="grid grid-cols-2 gap-x-6 gap-y-6 border-white/10 pt-6 text-sm max-lg:border-t sm:grid-cols-3 lg:grid-cols-1 lg:pt-0 lg:pl-7">
                            {person.age !== null && (
                                <div>
                                    <p className="text-2xl font-semibold text-emerald-400 tabular-nums">
                                        {person.age} ans
                                    </p>
                                    <p className="mt-1 text-xs text-white/50">
                                        {person.deathDate
                                            ? 'à son décès'
                                            : 'aujourd’hui'}
                                    </p>
                                </div>
                            )}
                            {person.birthDate && (
                                <div>
                                    <p className="text-xs tracking-[0.12em] text-white/45 uppercase">
                                        Naissance
                                    </p>
                                    <p className="mt-1 font-medium text-white/85">
                                        {person.birthDate}
                                    </p>
                                </div>
                            )}
                            {person.placeOfBirth && (
                                <div>
                                    <p className="text-xs tracking-[0.12em] text-white/45 uppercase">
                                        Lieu de naissance
                                    </p>
                                    <p className="mt-1 font-medium text-white/85">
                                        {person.placeOfBirth}
                                    </p>
                                </div>
                            )}
                        </aside>
                    </section>

                    <section
                        aria-labelledby="filmography-title"
                        className="mt-12 pb-8 lg:mt-16"
                    >
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h2
                                    className="text-xs font-semibold tracking-[0.16em] text-white/60 uppercase"
                                    id="filmography-title"
                                >
                                    Filmographie
                                </h2>
                                <p className="mt-2 text-sm text-white/55">
                                    {person.filmography.length} œuvres, films et
                                    séries confondus
                                </p>
                            </div>
                        </div>

                        {person.filmography.length > 0 ? (
                            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
                                {person.filmography.map((credit) => (
                                    <FilmographyCard
                                        credit={credit}
                                        key={`${credit.type}-${credit.tmdbId}`}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="mt-5 text-sm text-white/55">
                                Aucune œuvre n’est disponible pour le moment.
                            </p>
                        )}
                    </section>
                </div>
            </ScrollArea>
        </main>
    );
}
