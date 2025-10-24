import { db } from "@/db";
import { productsTable } from "@/db/schema/product/schema";
import { verifyShopifyWebhook } from "@/lib/shopify";
import { eq, sql } from "drizzle-orm";
import type { Context } from "hono";

interface ShopifyLineItem {
  id: number;
  product_id: number;
  quantity: number;
  title: string;
  price: string;
}

interface ShopifyOrderWebhook {
  id: number;
  line_items: ShopifyLineItem[];
  created_at: string;
  total_price: string;
}

export const shopifySalesWebhookController = async (c: Context) => {
  try {
    const rawBody = await c.req.text();

    const hmacHeader = c.req.header("X-Shopify-Hmac-Sha256");

    if (!hmacHeader) {
      return c.json(
        {
          message: "Missing HMAC signature",
        },
        401
      );
    }

    const isValid = verifyShopifyWebhook(rawBody, hmacHeader);

    if (!isValid) {
      return c.json(
        {
          message: "Invalid webhook signature",
        },
        401
      );
    }

    const orderData: ShopifyOrderWebhook = JSON.parse(rawBody);

    for (const lineItem of orderData.line_items) {
      const shopifyProductId = lineItem.product_id.toString();
      const quantity = lineItem.quantity;

      const product = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.shopifyId, shopifyProductId))
        .limit(1);

      if (product.length === 0) {
        continue;
      }

      await db
        .update(productsTable)
        .set({
          saleCount: sql`${productsTable.saleCount} + ${quantity}`,
        })
        .where(eq(productsTable.shopifyId, shopifyProductId));

    }

    return c.json(
      {
        message: "Webhook processed successfully",
        orderId: orderData.id,
        itemsProcessed: orderData.line_items.length,
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        message: "Failed to process webhook",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
};
