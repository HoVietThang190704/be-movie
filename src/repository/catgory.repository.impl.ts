import { PipelineBuilder } from '../lib/pipelinebuilder';
import { Category, CategoryModel } from '../model/Category';
import { ICategoryRepository } from './catgory.repository.interface';

export class CategoryRepository implements ICategoryRepository {
  constructor() {}

  async getAllCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find().exec();
    return categories;
  }
}
