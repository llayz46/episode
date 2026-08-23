export type PersonCredit = {
    poster: string | null;
    role: string | null;
    slug: string | null;
    title: string;
    tmdbId: number;
    type: 'movie' | 'tv';
    year: string;
};

export type Person = {
    age: number | null;
    biography: string | null;
    birthDate: string | null;
    deathDate: string | null;
    filmography: PersonCredit[];
    knownForDepartment: string | null;
    name: string;
    placeOfBirth: string | null;
    profile: string | null;
};
