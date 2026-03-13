import jwt from "jsonwebtoken";

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

  async issueAccessToken(payload: object): Promise<string> {
    const token = jwt.sign(payload, secretKey, { expiresIn: "1h" });
    return token;
  }

  async verifyAccessToken(token: string): Promise<object | null> {
    try {
      const decoded = jwt.verify(token, secretKey);
      return decoded as object;
    } catch (error) {
      return null;
    }
  }

  
}