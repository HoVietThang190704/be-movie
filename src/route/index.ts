import Container from "../lib/container/container";
import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";
import { createMovieRoutes } from "./movie.route";
import { createAuthRoutes } from "./auth.route";
import { AuthController } from "../controllers/auth.controller";

export default function setupRoutes(): Router {
    const router = Router();
    const container = Container.getInstance();

    const movieController = container.get<MovieController>('MovieController');
    const authController = container.get<AuthController>('AuthController');

    router.use('/movies', createMovieRoutes(movieController));
    router.use('/auth', createAuthRoutes(authController));

    return router;
}