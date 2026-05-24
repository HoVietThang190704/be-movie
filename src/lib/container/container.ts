import { MovieRepository } from '../../repository/movie.repository.impl';
import { MovieService } from '../../service/movie.service.impl';
import { MovieController } from '../../controllers/movie.controller';
import { IMovieRepository } from '../../repository/movie.repository.interface';
import { IMovieService } from '../../service/movie.service.interface';
import { AuthController } from '../../controllers/auth.controller';
import { UserController } from '../../controllers/user.controller';
import { CategoryController } from '../../controllers/category.controller';
import { CategoryRepository } from '../../repository/catgory.repository.impl';
import { CategoryService } from '../../service/category.service.impl';
import { UserRepository } from '../../repository/user.repository.impl';
import { IUserRepository } from '../../repository/user.repository.interface';
import { UserService } from '../../service/user.service.impl';
import { AuthService } from '../../service/auth.service.impl';
import { IUserService } from '../../service/user.service.interface';
import { IAuthService } from '../../service/auth.service.interface';
import { ICategoryRepository } from '../../repository/catgory.repository.interface';
import { ICategoryService } from '../../service/category.service.interface';
import { IReleaseYearRepository } from '../../repository/releaseYear.repository.interface';
import { ReleaseYearRepository } from '../../repository/releaseYear.repository.impl';
import { IReleaseYearService } from '../../service/releaseYear.service.interface';
import { ReleaseYearService } from '../../service/releaseYear.service.impl';
import { ReleaseYearController } from '../../controllers/releaseYear.controller';

type ServiceIdentifier =
  | 'MovieRepository'
  | 'MovieService'
  | 'MovieController'
  | 'AuthController'
  | 'UserController'
  | 'CategoryController'
  | 'CategoryRepository'
  | 'CategoryService'
  | 'UserRepository'
  | 'UserService'
  | 'AuthService'
  | 'ReleaseYearRepository'
  | 'ReleaseYearService'
  | 'ReleaseYearController';
class Container {
  private static instance: Container;
  private services: Map<ServiceIdentifier, unknown> = new Map();

  private constructor() {
    this.registerDependencies();
  }

  private registerDependencies(): void {
    // Register repositories
    const movieRepository: IMovieRepository = new MovieRepository();
    this.services.set('MovieRepository', movieRepository);
    const userRepository: IUserRepository = new UserRepository();
    this.services.set('UserRepository', userRepository);
    const categoryRepository: ICategoryRepository = new CategoryRepository();
    this.services.set('CategoryRepository', categoryRepository);
    const releaseYearRepository: IReleaseYearRepository = new ReleaseYearRepository();
    this.services.set('ReleaseYearRepository', releaseYearRepository);

    // Register services
    const movieService: IMovieService = new MovieService(movieRepository);
    this.services.set('MovieService', movieService);
    const userService: IUserService = new UserService(userRepository);
    this.services.set('UserService', userService);
    const authService: IAuthService = new AuthService(userService);
    this.services.set('AuthService', authService);
    const categoryService: ICategoryService = new CategoryService(categoryRepository);
    this.services.set('CategoryService', categoryService);
    const releaseYearService: IReleaseYearService = new ReleaseYearService(releaseYearRepository);
    this.services.set('ReleaseYearService', releaseYearService);

    // Register controllers
    const movieController = new MovieController(movieService);
    this.services.set('MovieController', movieController);
    const authController = new AuthController(authService);
    this.services.set('AuthController', authController);
    const userController = new UserController(userService);
    this.services.set('UserController', userController);
    const categoryController = new CategoryController(categoryService);
    this.services.set('CategoryController', categoryController);
    const releaseYearController = new ReleaseYearController(releaseYearService);
    this.services.set('ReleaseYearController', releaseYearController);
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  get<T>(serviceName: ServiceIdentifier): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in container`);
    }
    return service as T;
  }
}

export default Container;