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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Eksterne koblinger

### 1. Supabase (database + fillagring)

To klienter:
- `src/lib/supabase/server.ts` — brukes i server actions, leser cookies for auth
- `src/lib/supabase.ts` — brukes i browser, kun read-operasjoner

Tabeller: `orders`, `order_items`, `product_batches`, `batch_ingredients`, `ingredients`, `gallery_images`, `cake_requests`

Storage bucket: `product-images` — bilder lastes opp via `uploadImage()` i `src/lib/actions/uploadImage.ts`

### 2. Resend (e-post)

Kun brukt i `src/app/admin/actions.ts`:
- `sendReceiptEmail()` — kvittering til kunde
- `sendReadyEmail()` — varsel om at ordre er klar for henting

Fra-adresse: `noreply@kjerstisbakeverden.com`. Ingen HTML-templates, kun plain text.

### 3. Admin-auth (egenutviklet)

Ingen auth-bibliotek. `src/proxy.ts` (middleware) sjekker en HTTP-only cookie `admin_auth` mot `ADMIN_COOKIE_SECRET` på alle `/admin/*`-ruter. Login setter cookien, logout sletter den.

### 4. Cloudflare

Selve Next.js-appen er hostet gjennom Vercel, og Cloudflare sitter foran som proxy.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
