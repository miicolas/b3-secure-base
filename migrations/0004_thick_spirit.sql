ALTER TABLE "roles" ADD COLUMN "canPostProductsWithImage" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "canGetBestsellers" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image_url" text;