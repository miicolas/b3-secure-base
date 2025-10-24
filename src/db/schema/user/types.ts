import { apiKeysTable, rolesTable, usersTable } from "./schema";

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Role = typeof rolesTable.$inferSelect;
export type NewRole = typeof rolesTable.$inferInsert;
export type ApiKey = typeof apiKeysTable.$inferSelect;
export type NewApiKey = typeof apiKeysTable.$inferInsert;
