import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

export enum RoleEnum {
    ADMIN = "admin",
    USER = "user",
    PREMIUM = "premium",
    BAN = "ban",
}

export const usersTable = pgTable("users", {
    id: text()
        .primaryKey()
        .$defaultFn(() => ulid()),
    name: text().notNull(),
    email: text().notNull().unique(),
    password: text().notNull(),
    passwordChangedAt: timestamp(),
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
    canPostProducts: boolean().notNull().default(false),
    canPostProductsWithImage: boolean().notNull().default(false),
    canGetBestsellers: boolean().notNull().default(false),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});

export const apiKeysTable = pgTable("api_keys", {
    id: text()
        .primaryKey()
        .$defaultFn(() => ulid()),
    name: text().notNull(),
    key: text().notNull().unique(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    userId: text()
        .references(() => usersTable.id)
        .notNull(),
});
