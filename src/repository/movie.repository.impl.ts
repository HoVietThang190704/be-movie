import { PipelineBuilder } from "../lib/pipelinebuilder";
import { Movie, MovieModel } from "../model/movie";
import { Filter, IMovieRepository } from "./movie.repository.interface";

export class MovieRepository implements IMovieRepository {
    constructor() {}
    async getAllMovies(filter?: Filter): Promise<Movie[]> {
        const builder = new PipelineBuilder<Movie>()
            .sort(filter?.sortBy || { createdAt: -1 })
            .limit(filter?.limit || 30);
            
        
        if (filter?.category && filter.category.length > 0) {
            builder.in("category.slug", filter.category);
        }

        if (filter?.name) {
            builder.regex("name", filter.name, "i");
        }
        
        const pipelineStages = builder
            .project({
                episodes: 0,
            })
            .build();

        return await MovieModel.aggregate(pipelineStages);
    }

    async getMovieBySlug(slug: string): Promise<Movie | null> {
        return await MovieModel.findOne({ slug }).exec();
    }

    async getMovieEpisodeBySlug(movieslug: string, episodeslug: string): Promise<Movie | null> {
        const pipeLineStages = new PipelineBuilder<Movie>()
            .match({ slug: movieslug })
            .unwind('episodes')
            .unwind('episodes.server_data')
            .match({ "episodes.server_data.slug": episodeslug })
            .build();
        const result = await MovieModel.aggregate(pipeLineStages);
        return result.length > 0 ? result[0].episodes.server_data : null;
    }

    async deleteMovie(id: string): Promise<void> {
        const deleted = await MovieModel.findByIdAndDelete(id);
        if (!deleted) {
            const err = new Error('Movie not found');
            (err as any).statusCode = 404;
            throw err;
        }
    }

}