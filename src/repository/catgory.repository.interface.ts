import { Category } from "../model/category";

export interface ICategoryRepository {
  getAllCategories(): Promise<Category[]>;
} 