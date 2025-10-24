import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import type { Context } from "hono";
import { productsTable } from "@/db/schema/product/schema";
import { getShopifyRestClient } from "@/lib/shopify";

export const postProductController = async (c: Context) => {
  try {
    const userPayload = c.get("user");

    const { productName, price, imageUrl } = await c.req.json();

    if (imageUrl && !userPayload.role?.canPostProductsWithImage) {
      return c.json(
        {
          message: "You need a PREMIUM role to add images to products",
        },
        403
      );
    }

    const client = getShopifyRestClient();

    const productData: any = {
      title: productName,
      variants: [
        {
          price: price,
          inventory_management: null,
        },
      ],
      status: "active",
    };

    if (imageUrl && userPayload.role?.canPostProductsWithImage) {
      productData.images = [
        {
          src: imageUrl,
        },
      ];
    }

    let shopifyProduct;
    try {
      shopifyProduct = await client.post({
        path: "products",
        data: {
          product: productData,
        },
      });
    } catch (shopifyError: any) {
      throw new Error(`Shopify API failed: ${shopifyError.message}`);
    }

    if (!shopifyProduct.body || typeof shopifyProduct.body !== 'object') {
      throw new Error(`Invalid Shopify response`);
    }

    const body = shopifyProduct.body;
    if (!body.product || !body.product.id) {
      throw new Error(`Shopify product creation failed`);
    }

    const shopifyProductId = body.product.id.toString();

    const [product] = await db
      .insert(productsTable)
      .values({
        shopifyId: shopifyProductId,
        createdBy: userPayload.id,
        imageUrl: imageUrl || null,
      })
      .returning();

    return c.json(
      {
        message: "Product created successfully",
        product: {
          id: product.id,
          name: productName,
          price: price,
          imageUrl: imageUrl || null,
        },
      },
      201
    );
  } catch (error) {
    return c.json(
      {
        message: "Failed to create product",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
};


export const getProductsController = async (c: Context) => {
  try {
    const products = await db.select().from(productsTable);
    return c.json({ products });
  } catch (error) {
    return c.json({ message: "Failed to get products" }, 500);
  }
};

export const getMyProductsController = async (c: Context) => {
  try {
    const userPayload = c.get("user");
    const products = await db.select().from(productsTable).where(eq(productsTable.createdBy, userPayload.id));
    return c.json({ products });
  } catch (error) {
    return c.json({ message: "Failed to get my products" }, 500);
  }
};

export const getMyBestsellersController = async (c: Context) => {
  try {
    const userPayload = c.get("user");
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.createdBy, userPayload.id))
      .orderBy(desc(productsTable.saleCount));
    return c.json({
      products,
      message: "Products sorted by number of sales"
    });
  } catch (error) {
    return c.json({ message: "Failed to get bestsellers" }, 500);
  }
};
