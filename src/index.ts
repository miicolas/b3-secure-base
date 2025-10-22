import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { JwtVariables } from "hono/jwt";
import { jwt } from "hono/jwt";
import { authRoutes } from "./modules/auth/routes";
import { userRoutes } from "./modules/users/routes";


const app = new Hono();

app.get("/", (c) => {
    return c.text("Hello Hono!");
});

app.get("/health", (c) => {
    return c.json({ message: "OK", timestamp: new Date().toISOString() });
});

app.route("/auth", authRoutes());
app.route("/users", userRoutes());



serve(
    {
        fetch: app.fetch,
        port: 3000,
    },
    (info) => {
        // biome-ignore lint/suspicious/noConsole: Server startup message
        console.log(`Server is running on http://localhost:${info.port}`);
    }
);
