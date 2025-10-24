import { apiKeysTable, rolesTable, usersTable } from "./schema";
import { relations } from "drizzle-orm";

export const userRelations = relations(usersTable, ({ one, many }) => ({
  role: one(rolesTable, {
    fields: [usersTable.roleId],
    references: [rolesTable.id],
  }),
  apiKeys: many(apiKeysTable),
}));

export const roleRelations = relations(rolesTable, ({ many }) => ({
  users: many(usersTable),
}));

export const apiKeyRelations = relations(apiKeysTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [apiKeysTable.userId],
    references: [usersTable.id],
  }),
}));
