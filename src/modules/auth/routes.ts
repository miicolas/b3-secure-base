import { sValidator } from "@hono/standard-validator";
import { Hono } from "hono";
import { loginController, registerController } from "./controllers";
import { loginSchema, registerSchema } from "./schemas";

export const authRoutes = () => {
    const router = new Hono();

    router.post(
        "/register",
        sValidator('json', registerSchema),
        registerController
    );

    router.post("/login", sValidator('json', loginSchema), loginController);

    return router;
};
