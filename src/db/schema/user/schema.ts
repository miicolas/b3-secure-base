import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

export const usersTable = pgTable("users", {
    id: text()
        .primaryKey()
        .$defaultFn(() => ulid()),
    name: text().notNull(),
    email: text().notNull().unique(),
    password: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
});
