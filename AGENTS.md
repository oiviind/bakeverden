<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Bakeverden - AI Agent Development Standards

## Project Overview
Next.js 16.2.1 + React 19 + Supabase application for cake ordering system.

## File Structure Standards

### 7. File Upload Standards
- Use Supabase Storage for images
- Validate file type and size on server
- Generate unique filenames to avoid conflicts
- Use `capture="environment"` for mobile camera access
- Show preview before upload
- Example: [`ImageUpload.tsx`](src/components/admin/ImageUpload.tsx)

### 8. Data Fetching with Relations
- Use Supabase's nested select for relations
- Example: `select('*, batch_ingredients(ingredients(*, allergens(*)))')`
- Always handle null/undefined for optional relations
- Use Array.from(new Map()) for deduplication
- Example: [`reserve/[id]/page.tsx`](src/app/reserve/[id]/page.tsx)

### 9. Shopping Cart Pattern
- ALL purchases go through shopping cart (no direct checkout)
- Users must add items to cart before purchasing
- Cart persists in localStorage
- Use `createMultipleOrders` for all order creation
- Validate quantities against remaining_quantity
- Example: [`CartContext.tsx`](src/lib/contexts/CartContext.tsx), [`AddToCartButton.tsx`](src/components/AddToCartButton.tsx)

### 10. Order Flow
- Product detail page → Add to cart → Cart page → Checkout → Confirmation
- Single order with multiple order_items
- All orders created via `createMultipleOrders`
- Example: [`checkout/page.tsx`](src/app/checkout/page.tsx), [`createMultipleOrders.ts`](src/lib/actions/createMultipleOrders.ts)

## Design System — UI Primitives

All reusable UI primitives live in `src/components/ui/`. Import from the barrel:
```ts
import { Button, Card, Badge, Alert } from '@/components/ui'
```

### Rules
- Each primitive has its own `.module.css` — styles are scoped, no global class conflicts.
- Design tokens (colors, shadows, spacing) come from CSS variables in `globals.css :root`. Never hardcode values that duplicate them.
- Do not add ad-hoc `style={{}}` or Tailwind utilities to primitives — extend the component's module instead.
- When building new pages, prefer `ui/` primitives over raw HTML elements with global classes.

### Available Primitives

| Component | File | Variants |
|-----------|------|----------|
| `Button` | `src/components/ui/Button.tsx` | `primary`, `secondary`, `ghost`, `danger` · sizes `sm`, `md`, `lg` · `fullWidth` |
| `Card` | `src/components/ui/Card.tsx` | Compound: `<Card>`, `<Card.Image>`, `<Card.Content>`, `<Card.Title>`, `<Card.Description>`, `<Card.Price>`, `<Card.Meta>` |
| `Badge` | `src/components/ui/Badge.tsx` | `success`, `warning`, `error`, `info` |
| `Alert` | `src/components/ui/Alert.tsx` | `success`, `error`, `warning`, `info` |

### Adding a New Primitive
1. Ask first — confirm the primitive doesn't already exist or belong in an existing component.
2. Create `ComponentName.tsx` + `ComponentName.module.css` in `src/components/ui/`.
3. Export from `src/components/ui/index.ts`.
4. Add a row to the table above.