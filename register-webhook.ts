import "dotenv/config";
import { getShopifyRestClient } from "./src/lib/shopify";

const registerWebhook = async () => {
  const webhookUrl = process.argv[2];

  if (!webhookUrl) {
    console.error("Usage: bun run webhook:register <webhook-url>");
    console.error(
      "Example: bun run webhook:register https://your-domain.com/api/v1/webhooks/shopify-sales"
    );
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

    const webhook = (response.body as any).webhook;

    console.log("\n✅ Webhook registered successfully!");
    console.log("Webhook ID:", webhook.id);
    console.log("Topic:", webhook.topic);
    console.log("Address:", webhook.address);
    console.log("Format:", webhook.format);
  } catch (error) {
    console.error("❌ Failed to register webhook:", error);
    if (error && typeof error === "object" && "response" in error) {
      console.error("Response:", (error as any).response?.body);
    }
    process.exit(1);
  }
};

registerWebhook();
