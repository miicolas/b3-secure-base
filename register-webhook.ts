import "dotenv/config";
import { getShopifyRestClient } from "./src/lib/shopify";

const registerWebhook = async () => {
  const webhookUrl = process.argv[2];

  if (!webhookUrl) {
    console.error("Usage: bun run webhook:register <webhook-url>");
  
    process.exit(1);
  }

  try {
    const client = getShopifyRestClient();

    console.log("Registering webhook with Shopify...");
    console.log("URL:", webhookUrl);

    const response = await client.post({
      path: "webhooks",
      data: {
        webhook: {
          topic: "orders/create",
          address: webhookUrl,
          format: "json",
        },
      },
    });


  } catch (error) {
    console.error("Failed to register webhook:", error);
    process.exit(1);
  }
};
