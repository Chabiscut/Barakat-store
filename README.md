This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## bKash Checkout

Online bKash payments use the official hosted checkout. Customers enter their wallet number, OTP, and PIN on bKash; the store does not collect or store those credentials.

To enable bKash, obtain merchant API credentials from bKash and add them to `.env.local` on the server:

```env
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_APP_KEY=
BKASH_APP_SECRET=
```

Use the sandbox URL and sandbox credentials for testing. For live payments, configure the production API URL and live credentials issued by bKash. Keep these values server-side: do not prefix them with `NEXT_PUBLIC_` or share them in chat. The callback URL is built from `BETTER_AUTH_URL`; production must use the store's public HTTPS URL and bKash must allow it for the merchant account.

The server stores bKash authorization tokens in MongoDB, reuses them until refresh is needed, and marks an order paid only after bKash confirms a completed transaction with the expected invoice and amount. See the [official bKash Tokenized Checkout documentation](https://developer.bka.sh/docs/tokenized-without-agreement.md).

## Nagad, Bank, and Card Checkout

The "Nagad / Bank / Card" checkout uses SSLCommerz's hosted payment page, a common ecommerce gateway pattern: customers choose from the payment channels enabled for the store and enter payment credentials only on SSLCommerz. Barakat Store does not collect card security codes, bank passwords, wallet PINs, or OTPs. The available channels (including Nagad or bank options) depend on the merchant account.

Obtain SSLCommerz sandbox credentials and add them to `.env.local` on the server:

```env
SSLCOMMERZ_IS_SANDBOX=true
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
```

For production, set `SSLCOMMERZ_IS_SANDBOX=false` and use the live store ID/password from SSLCommerz. Configure the public `BETTER_AUTH_URL` using HTTPS, and allow the `/api/payments/sslcommerz/ipn` listener in the SSLCommerz merchant panel if required. The server validates every success callback with SSLCommerz and checks the order reference, amount, currency, and risk status before marking an order as paid. See the [official SSLCommerz hosted payment and validation guide](https://developer.sslcommerz.com/doc/v4/).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
