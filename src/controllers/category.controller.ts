import { BaseResponse } from "../lib/baseresponse";
import { Category } from "../model/Category";
import { Request, Response } from 'express';
import { ICategoryService } from "../service/category.service.interface";

export class CategoryController {
  private readonly categoryService: ICategoryService;
  constructor(categoryService: ICategoryService) {
    this.categoryService = categoryService;
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await this.categoryService.getAllCategories();
      const response = new BaseResponse<Category[]>()
        .setResponse(200)
        .setMessage("Categories fetched successfully")
        .setSuccess(true)
        .setData(categories);
      res.json(response);
    } catch (error) {
      const response = new BaseResponse<null>()
        .setResponse(500)
        .setMessage("Failed to fetch categories")
        .setSuccess(false)
        .setData(null);
      res.status(500).json(response);
    }

  }
}