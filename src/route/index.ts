import Container from "../lib/container/container";
import { Router } from "express";
import { MovieController } from "../controllers/movie.controller";
import { createMovieRoutes } from "./movie.route";
import { createAuthRoutes } from "./auth.route";
import { AuthController } from "../controllers/auth.controller";
import { CategoryController } from "../controllers/category.controller";
import { createCategoryRoutes } from "./category.route";

export default function setupRoutes(): Router {
    const router = Router();
    const container = Container.getInstance();

    const movieController = container.get<MovieController>('MovieController');
    const authController = container.get<AuthController>('AuthController');
    const categoryController = container.get<CategoryController>('CategoryController');

    router.use('/movies', createMovieRoutes(movieController));
    router.use('/auth', createAuthRoutes(authController));
    router.use('/categories', createCategoryRoutes(categoryController));

    router.get('/health', (_req, res) => {
        res.json({ status: 'ok', uptime: process.uptime() });
    });

    return router;
}