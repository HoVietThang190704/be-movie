import { Category } from "../model/Category";

export interface ICategoryRepository {
  getAllCategories(): Promise<Category[]>;
} 