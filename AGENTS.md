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