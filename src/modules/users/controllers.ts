import { db } from "@/db";
import { eq } from "drizzle-orm";
import { rolesTable, usersTable } from "@/db/schema";
import type { Context } from "hono";

export const getMyUserController = async (c: Context) => {
  try {
    const userPayload = c.get("user");

    const [user] = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
        role: {
          id: rolesTable.id,
          name: rolesTable.name,
          canPostLogin: rolesTable.canPostLogin,
          canGetMyUser: rolesTable.canGetMyUser,
          canGetUsers: rolesTable.canGetUsers,
          canPostProducts: rolesTable.canPostProducts,
        }
      })
      .from(usersTable)
      .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
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
    return c.json({ message: "Failed to fetch user" }, 500);
  }
};

export const listUserController = async (c: Context) => {
  try {
    const listUser = await db.select().from(usersTable);

    return c.json({
      message: "User fetched successfully",
      listUser,
    });
  } catch (error) {
    return c.json({ message: "Failed to list users" }, 500);
  }
};


export const listRoleController = async (c: Context) => {
  try {
    const listRole = await db.select().from(rolesTable);
    return c.json({
      message: "Role fetched successfully",
      listRole,
    });
  } catch (error) {
    return c.json({ message: "Failed to list role" }, 500);
  }
};

export const getRoleController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const role = await db.select().from(rolesTable).where(eq(rolesTable.id, id));
    if (!role || role.length === 0) {
      return c.json({ message: "Role not found" }, 404);
    }
    return c.json({
      message: "Role fetched successfully",
      role,
    });
  } catch (error) {
    return c.json({ message: "Failed to get role" }, 500);
  }
};

export const createRoleController = async (c: Context) => {
  try {
    const { name, canPostLogin, canGetMyUser, canGetUsers } = await c.req.json();
    const [role] = await db.insert(rolesTable).values({ name, canPostLogin, canGetMyUser, canGetUsers }).returning({
      id: rolesTable.id,
      name: rolesTable.name,
      canPostLogin: rolesTable.canPostLogin,
      canGetMyUser: rolesTable.canGetMyUser,
      canGetUsers: rolesTable.canGetUsers,
      canPostProducts: rolesTable.canPostProducts,
    })
    if (!role) {
      return c.json({ message: "Role not created" }, 404);
    }
    return c.json({
      message: "Role created successfully",
      role,
    });
  } catch (error) {
    return c.json({ message: "Failed to create role" }, 500);
  }
};

export const updateRoleController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const { name, canPostLogin, canGetMyUser, canGetUsers } = await c.req.json();
    const role = await db.update(rolesTable).set({ name, canPostLogin, canGetMyUser, canGetUsers }).where(eq(rolesTable.id, id));
    return c.json({
      message: "Role updated successfully",
      role,
    });
  } catch (error) {
    return c.json({ message: "Failed to update role" }, 500);
  }
};

export const deleteRoleController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const role = await db.delete(rolesTable).where(eq(rolesTable.id, id));
    return c.json({
      message: "Role deleted successfully",
      role,
    });
  } catch (error) {
    return c.json({ message: "Failed to delete role" }, 500);
  }
};