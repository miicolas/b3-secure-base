import '@shopify/shopify-api/adapters/node';
import { ApiVersion, shopifyApi } from '@shopify/shopify-api';
import crypto from 'node:crypto';

if (!process.env.SHOPIFY_SHOP_URL) {
  throw new Error('SHOPIFY_SHOP_URL is missing in .env');
}

if (!process.env.SHOPIFY_ACCESS_TOKEN) {
  throw new Error('SHOPIFY_ACCESS_TOKEN is missing in .env');
}

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
  scopes: ['write_products', 'read_products'],
  hostName: process.env.SHOPIFY_SHOP_URL.replace('https://', '').replace('http://', ''),
  apiVersion: (process.env.SHOPIFY_API_VERSION || '2024-01') as ApiVersion,
  isEmbeddedApp: false,
});

export const getShopifyRestClient = () => {
  let shopDomain = process.env.SHOPIFY_SHOP_URL!
    .replace('https://', '')
    .replace('http://', '')
    .replace(/\/$/, '');

  if (!shopDomain.includes('.')) {
    throw new Error(`Invalid shop domain format: ${shopDomain}. Expected format: your-shop.myshopify.com`);
  }

  const session = shopify.session.customAppSession(shopDomain);
  session.accessToken = process.env.SHOPIFY_ACCESS_TOKEN!;

  return new shopify.clients.Rest({ session });
};

export const verifyShopifyWebhook = (body: string, hmacHeader: string): boolean => {
  const secret = process.env.SHOPIFY_KEY_SIGNATURE;

  if (!secret) {
    throw new Error('SHOPIFY_KEY_SIGNATURE is not configured');
  }

  const hash = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  return hash === hmacHeader;
};
