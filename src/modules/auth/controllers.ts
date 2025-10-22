import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import { db } from "@/db";
import { usersTable } from "@/db/schema/user/schema";
import { Context } from "hono";

export const registerController = async (c: Context) => {
    try {
        const { email, password, name } = c.req.valid('json');

        const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            return c.json({ message: "Email already exists" }, 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [user] = await db
            .insert(usersTable)
            .values({ email, password: hashedPassword, name })
            .returning({
                id: usersTable.id,
                email: usersTable.email,
                name: usersTable.name,
            });

        return c.json({ message: "User created successfully", user }, 201);
    } catch (error) {
        console.error("Registration error:", error);
        return c.json({ message: "Registration failed" }, 500);
    }
};

export const loginController = async (c: Context) => {
    try {
        const { email, password } = c.req.valid('json');

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (!user) {
            return c.json({ message: "User not found" }, 404);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return c.json({ message: "Invalid password" }, 401);
        }

        if (!process.env.JWT_SECRET) {
            return c.json({ message: "Server configuration error" }, 500);
        }

        const token = await sign(
            { sub: user.id, exp: Math.floor(Date.now() / 1000) + 60 * 60 },
            process.env.JWT_SECRET,
            "HS256"
        );

        return c.json(
            { message: "Login successful", data: { name: user.name, token } },
            200
        );
    } catch (_error) {
        return c.json({ message: "Login failed" }, 500);
    }
};
