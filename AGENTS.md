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