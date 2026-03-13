import { Filter, IMovieRepository } from "../repository/movie.repository.interface";
import { IMovieService } from "./movie.service.interface";
import { Movie, movieSchema } from "../model/movie";

export class MovieService implements IMovieService {
    private readonly movieRepository: IMovieRepository;
    constructor(movieRepository: IMovieRepository) {
        this.movieRepository = movieRepository;
    }
    async getAllMovies(filter?: Filter): Promise<Movie[]> {
        return await this.movieRepository.getAllMovies(filter);
    }
    async getMovieBySlug(slug: string): Promise<Movie | null> {
        return await this.movieRepository.getMovieBySlug(slug);
    }
    async getEpisodesByMovieSlug(movieslug: string, episodeslug: string): Promise<Movie | null> {
        console.log(`Fetching episode with slug: ${episodeslug} for movie with slug: ${movieslug}`);
        return await this.movieRepository.getMovieEpisodeBySlug(movieslug, episodeslug);
    }
    async deleteMovie(id: string): Promise<void> {
        return await this.movieRepository.deleteMovie(id);
    }
}