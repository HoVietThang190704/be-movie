import z from "zod";
import { User } from "../model/user";

export const createUserDto = z.object({
    username: z.string().min(2).max(100),
    email: z.email(),
    password: z.string().min(6).max(100),
    name: z.string().max(100),
    rule: z.string().max(50).default('user'),
    avatar_url: z.url().optional(),
    isActive: z.boolean().default(true),
    created: z.object({
        time: z.date().default(new Date())
    }).optional(),
    modified: z.object({
        time: z.date().default(new Date())
    }).optional()
}) satisfies z.ZodType<User>;

export type CreateUserDto = z.infer<typeof createUserDto>;