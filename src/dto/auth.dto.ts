import z from "zod";
import { createUserDto } from "./user.dto";

export type LoginResponse = {
  token: string;
};

export const LoginDto = createUserDto.pick({ email: true, password: true });
export type LoginDto = z.infer<typeof LoginDto>;