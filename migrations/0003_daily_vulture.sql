CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"shopify_id" text NOT NULL,
	"created_by" text NOT NULL,
	"sale_count" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;