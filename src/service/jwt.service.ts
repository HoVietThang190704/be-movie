import jwt from "jsonwebtoken";
import { JwtPayload } from "../type/jwtpayload";

const secretKey = process.env.JWT_SECRET_KEY as string;
export class JwtService {
  static instance: JwtService;
  static getInstance(): JwtService {
    if (!JwtService.instance) {
      JwtService.instance = new JwtService();
    }
    return JwtService.instance;
  }
  constructor() {}

  async issueAccessToken(payload: JwtPayload): Promise<string> {
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
    return token;
  }

  async verifyAccessToken(token: string): Promise<JwtPayload | null> {
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  
}