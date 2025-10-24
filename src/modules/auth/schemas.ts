import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    roleName: z.string().min(1).optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const changePasswordSchema = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
});

export const createApiKeySchema = z.object({
    name: z.string().trim().min(3).max(64),
});

export const apiKeyParamSchema = z.object({
    apiKeyId: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type ApiKeyParamInput = z.infer<typeof apiKeyParamSchema>;
