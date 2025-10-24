import { Hono } from "hono";
import { shopifySalesWebhookController } from "./controllers";

export const webhooksRoutes = () => {
  const webhooks = new Hono();

  webhooks.post("/shopify-sales", shopifySalesWebhookController);

  return webhooks;
};
