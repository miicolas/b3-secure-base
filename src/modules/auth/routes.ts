import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { changePasswordController, loginController, registerController } from "./controllers";
import { changePasswordSchema, loginSchema, registerSchema } from "./schemas";
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

    return router;
};
