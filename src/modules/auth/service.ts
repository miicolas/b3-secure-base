import { db } from "@/db";
import { apiKeysTable, rolesTable, usersTable } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { decode, sign, verify } from "hono/jwt";
import crypto from "node:crypto";

const API_KEY_BYTES = 32;

export class ApiKeyNameConflictError extends Error {
  constructor(name: string) {
    super(`API key name "${name}" already exists for this user`);
  }
}

export class ApiKeyNotFoundError extends Error {
  constructor() {
    super("API key not found");
  }
}

export const generateToken = async (payload: { sub: string; exp: number }) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  const token = await sign(payload, process.env.JWT_SECRET);
  return token;
};

export const verifyToken = async (token: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  const payload = await verify(token, process.env.JWT_SECRET);
  return payload;
};

export const decodeToken = (token: string) => {
  const payload = decode(token);
  return payload;
};

export const generateApiKey = () => {
  const apiKey = crypto.randomBytes(API_KEY_BYTES).toString("hex");
  return apiKey;
};

const hashApiKey = (apiKey: string) => {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
};

export const createApiKeyForUser = async (userId: string, name: string) => {
  const normalizedName = name.trim();

  const existing = await db
    .select({ id: apiKeysTable.id })
    .from(apiKeysTable)
    .where(and(eq(apiKeysTable.userId, userId), eq(apiKeysTable.name, normalizedName)))
    .limit(1);

  if (existing.length > 0) {
    throw new ApiKeyNameConflictError(normalizedName);
  }

  const apiKey = generateApiKey();
  const hashedKey = hashApiKey(apiKey);

  const [record] = await db
    .insert(apiKeysTable)
    .values({
      userId,
      name: normalizedName,
      key: hashedKey,
    })
    .returning({
      id: apiKeysTable.id,
      name: apiKeysTable.name,
      createdAt: apiKeysTable.createdAt,
      updatedAt: apiKeysTable.updatedAt,
    });

  return {
    apiKey,
    record,
  };
};

export const listApiKeysForUser = async (userId: string) => {
  const apiKeys = await db
    .select({
      id: apiKeysTable.id,
      name: apiKeysTable.name,
      createdAt: apiKeysTable.createdAt,
      updatedAt: apiKeysTable.updatedAt,
    })
    .from(apiKeysTable)
    .where(eq(apiKeysTable.userId, userId))
    .orderBy(desc(apiKeysTable.createdAt));

  return apiKeys;
};

export const deleteApiKeyForUser = async (userId: string, apiKeyId: string) => {
  const [deleted] = await db
    .delete(apiKeysTable)
    .where(and(eq(apiKeysTable.id, apiKeyId), eq(apiKeysTable.userId, userId)))
    .returning({
      id: apiKeysTable.id,
    });

  if (!deleted) {
    throw new ApiKeyNotFoundError();
  }
};

export const findUserByApiKey = async (apiKey: string) => {
  const hashedKey = hashApiKey(apiKey);

  const [result] = await db
    .select({
      apiKey: {
        id: apiKeysTable.id,
        name: apiKeysTable.name,
        createdAt: apiKeysTable.createdAt,
        updatedAt: apiKeysTable.updatedAt,
        userId: apiKeysTable.userId,
      },
      user: {
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
        passwordChangedAt: usersTable.passwordChangedAt,
      },
      role: rolesTable,
    })
    .from(apiKeysTable)
    .innerJoin(usersTable, eq(apiKeysTable.userId, usersTable.id))
    .leftJoin(rolesTable, eq(usersTable.roleId, rolesTable.id))
    .where(eq(apiKeysTable.key, hashedKey))
    .limit(1);

  if (!result) {
    return null;
  }

  await db
    .update(apiKeysTable)
    .set({ updatedAt: new Date() })
    .where(eq(apiKeysTable.id, result.apiKey.id));

  return {
    apiKey: result.apiKey,
    user: {
      ...result.user,
      role: result.role,
    },
  };
};
