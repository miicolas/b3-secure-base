import { eq } from "drizzle-orm";
import { db } from "@/db";
import { usersTable } from "@/db/schema/user/schema";
import { Context } from "hono";

export const getMyUserController = async (c: Context) => {
    try {
        const payload = c.get('auth')
        const userPayload = c.get('user')
        console.log(payload)

        const [user] = await db
            .select({
                id: usersTable.id,
                email: usersTable.email,
                name: usersTable.name,
                createdAt: usersTable.createdAt,
                updatedAt: usersTable.updatedAt,
            })
            .from(usersTable)
            .where(eq(usersTable.id, userPayload.id))
            .limit(1);

        if (!user) {
            return c.json({ message: "User not found" }, 404);
        }

        return c.json({
            message: "User fetched successfully",
            user,
        });
    } catch (error) {
        console.error("Get my user error:", error);
        return c.json({ message: "Failed to fetch user" }, 500);
    }
};

export const listUserController = async (c: Context) => {

    try {
        const payload = c.get("jwtPayload");

        const listUser = await db.select().from(usersTable)

        return c.json({
            message: "User fetched successfully",
            listUser,
        });

    }
    catch ( error ) {
        console.error("List Users error:", error);
        return c.json({ message: "Failed to list users" }, 500);
    }
}
