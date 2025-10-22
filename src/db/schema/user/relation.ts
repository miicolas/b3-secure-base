import { rolesTable, usersTable } from "./schema";
import { relations } from "drizzle-orm";

export const userRelations = relations(usersTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [usersTable.roleId],
    references: [rolesTable.id],
  }),
}));

export const roleRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
}));

