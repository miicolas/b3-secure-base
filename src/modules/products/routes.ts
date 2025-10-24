import { Hono } from "hono";
import type { JwtVariables } from "hono/jwt";

import { authMiddleware } from "@/middleware/auth-middleware";
import { requirePermission } from "@/middleware/permission-middleware";
import { productSchema } from './schemas'
import { postProductController, getProductsController, getMyProductsController, getMyBestsellersController } from "./controllers";
import { sValidator } from "@hono/standard-validator";

export const productsRoutes = () => {
  const router = new Hono<{ Variables: JwtVariables }>();

  router.use("/*", authMiddleware());

  router.get("/my-product", getMyProductsController);
  router.get("/", getProductsController);

  const premiumRoutes = new Hono<{ Variables: JwtVariables }>();
  premiumRoutes.use("/*", requirePermission("canGetBestsellers"));
  premiumRoutes.get("/my-bestsellers", getMyBestsellersController);

  const adminRoutes = new Hono<{ Variables: JwtVariables }>();
  adminRoutes.use("/*", requirePermission("canPostProducts"));
  adminRoutes.post("/", sValidator('json', productSchema),
  postProductController )

  router.route("/", premiumRoutes);
  router.route("/", adminRoutes);

  return router;
};
