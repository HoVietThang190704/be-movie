import { Filter } from "../repository/movie.repository.interface";
import { Movie } from "../model/movie";

export interface IMovieService {
    getAllMovies(filter?: Filter): Promise<Movie[]>;
    getMovieBySlug(slug: string): Promise<Movie | null>;
    getEpisodesByMovieSlug(movieslug: string, episodeslug: string): Promise<Movie | null>;
    deleteMovie(id: string): Promise<void>;
}