import { Movie } from "../model/movie";

export type Filter = {
    limit?: number;
    sortBy?: Record<string, 1 | -1>;
    category?: string[];
}

export interface IMovieRepository {
    getAllMovies(filter?: Filter): Promise<Movie[]>;
    getMovieBySlug(slug: string): Promise<Movie | null>;
    getMovieEpisodeBySlug(movieslug: string, episodeslug: string): Promise<Movie | null>;
    deleteMovie(id: string): Promise<void>;
}