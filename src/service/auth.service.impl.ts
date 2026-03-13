import { timeEnd } from 'console';
import { LoginDto } from '../dto/auth.dto';
import { CreateUserDto } from '../dto/user.dto';
import { User } from '../model/user';
import { IAuthService } from './auth.service.interface';
import { IUserService } from './user.service.interface';
import bcrypt from 'bcrypt';
import { issue } from 'zod/v4/core/util.cjs';
import { JwtService } from './jwt.service';
import { email } from 'zod';

export class AuthService implements IAuthService {
  private readonly userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  async register(user: CreateUserDto): Promise<User> {
    const existingUser = await this.userService.getUserByEmail(user.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await this.userService.createUser({ ...user, password: hashedPassword });
    return newUser;
  }

  async login(user: LoginDto): Promise<string> {
    const existingUser = await this.userService.getUserByEmail(user.email);
    const jwtPayLoad = { email: existingUser?.email, rule: existingUser?.rule, iat: Date.now() };
    if (!existingUser) {
      throw new Error('Invalid email or password');
    } 
    if (!(await bcrypt.compare(user.password, existingUser.password))) {
      throw new Error('Invalid email or password');
    }
    console.log(user.email, user.password);
    const token = JwtService.getInstance().issueAccessToken(jwtPayLoad);
    return token;
  }
}
