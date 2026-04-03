import { Category } from '../model/Category';
import { ICategoryRepository } from '../repository/catgory.repository.interface';
import { ICategoryService } from './category.service.interface';

export class CategoryService implements ICategoryService {
  private readonly categoryRepository: ICategoryRepository;
  constructor(categoryRepository: ICategoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepository.getAllCategories();
  }
}
