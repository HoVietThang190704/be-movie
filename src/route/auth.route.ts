import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

export function createAuthRoutes(authController: AuthController): Router {
    const router = Router();

    router.post('/register', (req, res) => authController.register(req, res));
    router.post('/login', (req, res) => authController.login(req, res));
    router.get('/me', authMiddleware, (req, res) => authController.getCurrentUser(req, res));
    return router;
}