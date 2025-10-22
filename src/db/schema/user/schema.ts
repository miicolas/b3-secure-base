import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

export enum RoleEnum {
  ADMIN = "admin",
  USER = "user",
  BAN = "ban",
}

export const usersTable = pgTable("users", {
  id: text()
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  passwordChangedAt: timestamp().notNull().defaultNow(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  roleId: text()
    .references(() => rolesTable.id)
    .notNull(),
});

export const rolesTable = pgTable("roles", {
  id: text()
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: text().notNull(),
  canPostLogin: boolean().notNull().default(false),
  canGetMyUser: boolean().notNull().default(false),
  canGetUsers: boolean().notNull().default(false),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});
