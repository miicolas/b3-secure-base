import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import { db } from "@/db";
import { rolesTable, usersTable } from "@/db/schema/user/schema";
import { Context } from "hono";
import {
    ApiKeyNameConflictError,
    ApiKeyNotFoundError,
    createApiKeyForUser,
    deleteApiKeyForUser,
    listApiKeysForUser,
} from "./service";

export const registerController = async (c: Context) => {
    try {
        const { email, password, name, roleName } = await c.req.json();

        const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email))
            .limit(1);

        if (existingUser.length > 0) {
            return c.json({ message: "Email already exists" }, 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const targetRoleName = roleName || "USER";

        const role = await db
            .select()
            .from(rolesTable)
            .where(eq(rolesTable.name, targetRoleName))
            .limit(1);

        if (role.length === 0) {
            return c.json({ message: "Role not found" }, 404);
        }

        const roleId = role[0].id;

        const [user] = await db
            .insert(usersTable)
            .values({ email, password: hashedPassword, name, roleId: roleId })
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
        const { email, password } = await c.req.json();

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

export const changePasswordController = async (c: Context) => {
    try {
        const { currentPassword, newPassword } = await c.req.json();
        const userPayload = c.get("user");

        const [user] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, userPayload.id))
            .limit(1);

        if (!user) {
            return c.json({ message: "User not found" }, 404);
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return c.json({ message: "Current password is incorrect" }, 401);
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await db
            .update(usersTable)
            .set({ 
                password: hashedNewPassword, 
                passwordChangedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(usersTable.id, userPayload.id));

        return c.json({ message: "Password changed successfully" }, 200);
    } catch (error) {
        console.error("Change password error:", error);
        return c.json({ message: "Change password failed" }, 500);
    }
};

export const createApiKeyController = async (c: Context) => {
    try {
        const { name } = await c.req.json();
        const userPayload = c.get("user");

        if (!userPayload?.id) {
            return c.json({ message: "Unauthorized" }, 401);
        }

        const { apiKey, record } = await createApiKeyForUser(userPayload.id, name);

        return c.json(
            {
                message: "API key created successfully",
                apiKey: {
                    id: record.id,
                    name: record.name,
                    createdAt: record.createdAt,
                    updatedAt: record.updatedAt,
                    value: apiKey,
                },
            },
            201
        );
    } catch (error) {
        if (error instanceof ApiKeyNameConflictError) {
            return c.json({ message: error.message }, 409);
        }
        return c.json({ message: "Create API key failed" }, 500);
    }
};

export const listApiKeysController = async (c: Context) => {
    try {
        const userPayload = c.get("user");

        if (!userPayload?.id) {
            return c.json({ message: "Unauthorized" }, 401);
        }

        const apiKeys = await listApiKeysForUser(userPayload.id);

        return c.json(
            {
                message: "API keys fetched successfully",
                apiKeys,
            },
            200
        );
    } catch (error) {
        return c.json({ message: "List API keys failed" }, 500);
    }
};

export const deleteApiKeyController = async (c: Context) => {
    try {
        const { apiKeyId } = await c.req.param()
        const userPayload = c.get("user");

        if (!userPayload?.id) {
            return c.json({ message: "Unauthorized" }, 401);
        }

        await deleteApiKeyForUser(userPayload.id, apiKeyId);

        return c.json({ message: "API key deleted successfully" }, 200);
    } catch (error) {
        if (error instanceof ApiKeyNotFoundError) {
            return c.json({ message: error.message }, 404);
        }
        return c.json({ message: "Delete API key failed" }, 500);
    }
};
