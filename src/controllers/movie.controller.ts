import { Request, Response } from 'express';
import { IMovieService } from "../service/movie.service.interface";
import { Movie } from '../model/movie';
import { BaseResponse } from '../lib/baseresponse'
import { isValidObjectId } from 'mongoose';
import { Filter } from '../repository/movie.repository.interface';

export class MovieController {
  private readonly movieService: IMovieService;

  constructor(movieService: IMovieService) {
    this.movieService = movieService;
  }

  async getAllMovies(req: Request, res: Response) {
    try {
      const filter: Filter = {
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        sortBy: req.query.sortBy ? JSON.parse(req.query.sortBy as string) : undefined,
        category: req.query.category 
          ? Array.isArray(req.query.category)
            ? (req.query.category as string[])
            : [req.query.category as string]
          : undefined,
          name: req.query.name ? (req.query.name as string) : undefined,
          year: (() => {
            const yearQuery = req.query.year;
            if (!yearQuery) return undefined;

            // Multiple query params: ?year=2022&year=2023
            if (Array.isArray(yearQuery)) {
              const arr = (yearQuery as string[])
                .map(y => parseInt(y, 10))
                .filter(n => !Number.isNaN(n));
              return arr.length > 0 ? arr : undefined;
            }

            const ystr = (yearQuery as string).trim();
            // Range: 2000-2010
            if (ystr.includes('-')) {
              const parts = ystr.split('-').map(s => parseInt(s.trim(), 10));
              if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
                const [a, b] = parts;
                return { gte: Math.min(a, b), lte: Math.max(a, b) };
              }
            }

            // Comma separated list: 2020,2021
            if (ystr.includes(',')) {
              const arr = ystr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
              return arr.length > 0 ? arr : undefined;
            }

            // Single year
            const parsed = parseInt(ystr, 10);
            return Number.isNaN(parsed) ? undefined : parsed;
          })(),
      };

      const movies = await this.movieService.getAllMovies(filter);
      const response = new BaseResponse<Movie[]>()
        .setResponse(200)
        .setMessage("Movies fetched successfully")
        .setSuccess(true)
        .setData(movies);
      res.json(response);
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({ error: 'An error occurred while fetching movies' });
    }
  }

  async getMovieBySlug(req: Request, res: Response) {
    try {
      const movieslug = req.params.slug as string;
      if (!movieslug) {
        return res.status(400).json({ error: 'Invalid movie slug format' });
      }

      const movie = await this.movieService.getMovieBySlug(movieslug);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      const response = new BaseResponse<Movie>()
        .setResponse(200)
        .setMessage("Movie fetched successfully")
        .setSuccess(true)
        .setData(movie);
      res.json(response);
    } catch (error) {
      console.error('Error fetching movie:', error);
      res.status(500).json({ error: 'An error occurred while fetching the movie' });
    }
  }

  async getMovieEpisodesBySlug(req: Request, res: Response) {
    try {
      const movieslug = req.params.slug as string;
      const episodeslug = req.params.episodeSlug as string;
      if (!movieslug || !episodeslug) {
        return res.status(400).json({ error: 'Invalid movie slug or episode slug format' });
      }
      const episodes = await this.movieService.getEpisodesByMovieSlug(movieslug, episodeslug);
      if (!episodes) {
        return res.status(404).json({ error: 'Episodes not found' });
      }
      const response = new BaseResponse<Movie>()
        .setResponse(200)
        .setMessage("Episodes fetched successfully")
        .setSuccess(true)
        .setData(episodes);
      res.json(response);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      res.status(500).json({ error: 'An error occurred while fetching the episodes' });
    }
  }

  async deleteMovie(req: Request, res: Response) {
    try {
      const movieId = req.params.id as string;

      if (!isValidObjectId(movieId)) {
        return res.status(400).json({ error: 'Invalid movie id format' });
      }

      await this.movieService.deleteMovie(movieId);

      const response = new BaseResponse<null>()
        .setResponse(200)
        .setMessage("Movie deleted successfully")
        .setSuccess(true)
        .setData(null);
      res.json(response);
    } catch (error: any) {
      console.error('Error deleting movie:', error);
      if (error && error.statusCode === 404) {
        return res.status(404).json({ error: 'Movie not found' });
      }
      res.status(500).json({ error: 'An error occurred while deleting the movie' });
    }
  }
}
