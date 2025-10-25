-- Reset passwordChangedAt to NULL for existing users
-- Users should only have a passwordChangedAt value after they explicitly change their password
UPDATE "users" SET "passwordChangedAt" = NULL;
