import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import {
    changePasswordController,
    createApiKeyController,
    deleteApiKeyController,
    listApiKeysController,
    loginController,
    registerController,
} from "./controllers";
import {
    apiKeyParamSchema,
    changePasswordSchema,
    createApiKeySchema,
    loginSchema,
    registerSchema,
} from "./schemas";
import { authMiddleware } from "@/middleware/auth-middleware";

export const authRoutes = () => {
    const router = new Hono();

    
    router.post(
        "/register",
        sValidator('json', registerSchema),
        registerController
    );

    router.post("/login", sValidator('json', loginSchema), loginController);

    router.post('/change-password', authMiddleware(), sValidator('json', changePasswordSchema), changePasswordController)

    router.get('/api-keys', authMiddleware(), listApiKeysController);
    router.post(
        '/api-keys',
        authMiddleware(),
        sValidator('json', createApiKeySchema),
        createApiKeyController
    );
    router.delete(
        '/api-keys/:apiKeyId',
        authMiddleware(),
        sValidator('param', apiKeyParamSchema),
        deleteApiKeyController
    );

    return router;
};
