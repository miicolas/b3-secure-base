import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { usersTable } from "../user";

export const productsTable = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  shopifyId: text("shopify_id").notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => usersTable.id),
  saleCount: integer("sale_count").default(0),
  imageUrl: text("image_url"),
});
