export type CastMember = {
    image: string;
    name: string;
    role: string;
};

export type Episode = {
    airDate: string;
    isAvailable: boolean;
    number: number;
    title: string;
};

export type EpisodeDetail = {
    airDate: string;
    code: string;
    description: string;
    duration: string;
    image: string;
    isAvailable: boolean;
    number: number;
    title: string;
};

export type Season = {
    episodeCount: number;
    image: string | null;
    number: number;
    status: string;
};

export type SeasonEpisode = {
    airedOn: string | null;
    image: string;
    number: number;
    overview: string | null;
    rating: number | null;
    runtime: number | null;
    title: string;
    voteCount: number;
};

export type MediaSeason = {
    episodeCount: number;
    episodes: SeasonEpisode[];
    nextNumber: number | null;
    number: number;
    previousNumber: number | null;
    title: string;
};

export type Media = {
    backdrop: string;
    cast: CastMember[];
    countryCode?: string;
    creator?: {
        image: string;
        name: string;
    };
    description: string;
    episodeNavigation: EpisodeDetail[];
    episodes: Episode[];
    firstAirDate?: string;
    genres: string[];
    kind: 'movie' | 'series';
    lastAirDate?: string;
    nextRelease: string;
    platform: string;
    poster: string;
    progress: {
        released: number;
        total: number;
        watched: number;
    } | null;
    rating?: {
        average: number;
        count: number;
    };
    season: string | null;
    seasonComplete: string | null;
    seasons: Season[];
    slug: string;
    status: string;
    tagline?: string;
    title: string;
    year: string;
};
