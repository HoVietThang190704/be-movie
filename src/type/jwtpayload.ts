export interface JwtPayload {
  userId: string;
  email: string;
  rule: string;
  iat: number;
}