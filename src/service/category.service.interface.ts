import { Category } from "../model/Category";

export interface ICategoryService {
  getAllCategories(): Promise<Category[]>;
}