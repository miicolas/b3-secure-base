import { Hono } from "hono";
import type { JwtVariables } from "hono/jwt";
import { getMyUserController, listUserController } from "./controllers";
import { authMiddleware } from "@/middleware/auth-middleware";

export const userRoutes = () => {
    const router = new Hono<{ Variables: JwtVariables }>();
    router.use('/*', authMiddleware())  
    router.get("/my-user", getMyUserController);

    router.get("/list-users", listUserController)
    return router;
};
