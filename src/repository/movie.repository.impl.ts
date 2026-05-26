import { PipelineBuilder } from '../lib/pipelinebuilder';
import { Movie, MovieModel } from '../model/movie';
import { Filter, IMovieRepository, YearRange } from './movie.repository.interface';

function getVietnameseRegex(keyword: string): string {
  const unaccented = keyword
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

  const escaped = unaccented.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  return escaped
    .replace(/a/g, '[aàáảãạăằắẳẵặâầấẩẫậ]')
    .replace(/e/g, '[eèéẻẽẹêềếểễệ]')
    .replace(/i/g, '[iìíỉĩị]')
    .replace(/o/g, '[oòóỏõọôồốổỗộơờớởỡợ]')
    .replace(/u/g, '[uùúủũụưừứửữự]')
    .replace(/y/g, '[yỳýỷỹỵ]')
    .replace(/d/g, '[dđ]');
}

export class MovieRepository implements IMovieRepository {
  constructor() {}
  async getAllMovies(filter?: Filter): Promise<Movie[]> {
    const builder = new PipelineBuilder<Movie>();

    if (filter?.category && filter.category.length > 0) {
      builder.in('category.slug', filter.category);
    }

    if (filter?.name) {
      const regexPattern = getVietnameseRegex(filter.name);
      builder.match({
        $or: [
          { name: { $regex: regexPattern, $options: 'i' } },
          { origin_name: { $regex: regexPattern, $options: 'i' } },
          { actor: { $regex: regexPattern, $options: 'i' } },
          { director: { $regex: regexPattern, $options: 'i' } },
        ],
      });
    }

    if (filter?.year !== undefined) {
      if (Array.isArray(filter.year)) {
        builder.match({ year: { $in: filter.year } });
      } else if (typeof filter.year === 'number') {
        builder.match({ year: filter.year });
      } else {
        const yr = filter.year as YearRange;
        const range: Record<string, number> = {};
        if (typeof yr.gte === 'number') range.$gte = yr.gte;
        if (typeof yr.lte === 'number') range.$lte = yr.lte;
        if (Object.keys(range).length > 0) {
          builder.match({ year: range });
        }
      }
    }

    builder.sort(filter?.sortBy || { createdAt: -1 }).limit(filter?.limit || 30);

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
      .match({ 'episodes.server_data.slug': episodeslug })
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
