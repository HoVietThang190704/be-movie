import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";

export function createMovieRoutes(movieController: MovieController): Router {
    const router = Router();

    router.get('/', (req, res) => movieController.getAllMovies(req, res));
    router.get('/:slug', (req, res) => movieController.getMovieBySlug(req, res));
    router.get('/:slug/episodes/:episodeSlug', (req, res) => movieController.getMovieEpisodesBySlug(req, res));
    router.delete('/:id', (req, res) => movieController.deleteMovie(req, res));

    return router;
}