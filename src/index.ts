import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authRoutes } from "./modules/auth/routes";
import { userRoutes } from "./modules/users/routes";
import { productsRoutes } from "./modules/products/routes";
import { webhooksRoutes } from "./modules/webhooks/routes";


const app = new Hono();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

const createApiRoutes = () => {
    const apiRoutes = new Hono();

    apiRoutes.get("/health", (c) => {
        return c.json({ message: "OK", timestamp: new Date().toISOString() });
    });
    apiRoutes.route("/auth", authRoutes());
    apiRoutes.route("/users", userRoutes());
    apiRoutes.route("/products", productsRoutes());
    apiRoutes.route("/webhooks", webhooksRoutes());

    return apiRoutes;
};

app.route("/api/v1", createApiRoutes());



serve(
    {
        fetch: app.fetch,
        port: 3000,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    }
);
