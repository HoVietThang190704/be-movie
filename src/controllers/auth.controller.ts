import { Request, Response } from 'express';
import { createUserDto } from "../dto/user.dto";
import { BaseResponse } from "../lib/baseresponse";
import { User } from "../model/user";
import { IAuthService } from "../service/auth.service.interface";
import { LoginDto, LoginResponse } from '../dto/auth.dto';

export class AuthController {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async register(req: Request, res: Response) {
    try {
        const result = createUserDto.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({ message: "Invalid user data", errors: result.error });
        }
        const user = await this.authService.register(result.data);
        const response = new BaseResponse<User>()
        .setResponse(201)
        .setMessage("User registered successfully")
        .setSuccess(true)
        .build();
      res.json(response); 
    } catch (error) {
      res.status(400).json({ message: "Error registering user: " });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = LoginDto.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid login data", errors: result.error });
      }
      const token = await this.authService.login(result.data);
      const response = new BaseResponse<LoginResponse>()
        .setResponse(200)
        .setMessage("Login successful")
        .setSuccess(true)
        .setData({ token })
        .build();
      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ message: "Invalid credentials" });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = req.body.userId;
      if (!userId) {
        return res.status(400).json({ message: "User ID not provided" });
      }
      const user = await this.authService.getCurrentUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const response = new BaseResponse<User>()
        .setResponse(200)
        .setMessage("User found")
        .setSuccess(true)
        .setData(user)
        .build();
      res.json(response);
    } catch (error) {
      res.status(400).json({ message: "Error fetching user" });

    }
  }
}