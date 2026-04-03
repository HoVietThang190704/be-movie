import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";

export function createCategoryRoutes(categoryController: CategoryController): Router {
  const router = Router();

  router.get('/', (req, res) => categoryController.getAllCategories(req, res));

  return router;

}