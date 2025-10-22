import { Hono } from "hono";
import type { JwtVariables } from "hono/jwt";
import {
  createRoleController,
  deleteRoleController,
  getMyUserController,
  getRoleController,
  listRoleController,
  listUserController,
  updateRoleController,
} from "./controllers";
import { authMiddleware } from "@/middleware/auth-middleware";
import { requirePermission } from "@/middleware/permission-middleware";

export const userRoutes = () => {
  const router = new Hono<{ Variables: JwtVariables }>();

  router.use("/*", authMiddleware());

  const userRoutes = new Hono<{ Variables: JwtVariables }>();
  userRoutes.use("/*", requirePermission("canGetMyUser"));
  userRoutes.get("/my-user", getMyUserController);

  const adminRoutes = new Hono<{ Variables: JwtVariables }>();
  adminRoutes.use("/*", requirePermission("canGetUsers"));
  adminRoutes.get("/list-users", listUserController);
  adminRoutes.get("/list-roles", listRoleController);
  adminRoutes.get("/get-role/:id", getRoleController);
  adminRoutes.post("/create-role", createRoleController);
  adminRoutes.put("/update-role/:id", updateRoleController);
  adminRoutes.delete("/delete-role/:id", deleteRoleController);

  router.route("/", userRoutes);
  router.route("/", adminRoutes);

  return router;
};
