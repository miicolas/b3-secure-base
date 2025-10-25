ALTER TABLE "users" ALTER COLUMN "passwordChangedAt" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "passwordChangedAt" DROP NOT NULL;