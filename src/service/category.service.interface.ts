import { Category } from "../model/category";

export interface ICategoryService {
  getAllCategories(): Promise<Category[]>;
}