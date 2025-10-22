import { db } from "@/db";
import { rolesTable, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seedRoles() {
  try {
    const [adminRole] = await db
      .insert(rolesTable)
      .values({
        name: "ADMIN",
        canPostLogin: true,
        canGetMyUser: true,
        canGetUsers: true,
      })
      .returning();

    const [userRole] = await db
      .insert(rolesTable)
      .values({
        name: "USER",
        canPostLogin: true,
        canGetMyUser: true,
        canGetUsers: false,
      })
      .returning();

    const [banRole] = await db
      .insert(rolesTable)
      .values({
        name: "BAN",
        canPostLogin: false,
        canGetMyUser: false,
        canGetUsers: false,
      })
      .returning();
    const adminPassword = await bcrypt.hash("admin123", 10);
    const [adminUser] = await db
      .insert(usersTable)
      .values({
        name: "Admin User",
        email: "admin@example.com",
        password: adminPassword,
        roleId: adminRole.id,
      })
      .returning();

    const banPassword = await bcrypt.hash("ban123", 10);
    const [banUser] = await db
      .insert(usersTable)
      .values({
        name: "Banned User",
        email: "banned@example.com",
        password: banPassword,
        roleId: banRole.id,
      })
      .returning();

    await db
      .update(usersTable)
      .set({ roleId: userRole.id })
      .where(eq(usersTable.roleId, ""));

  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seedRoles().then(() => process.exit(0));

export { seedRoles };
