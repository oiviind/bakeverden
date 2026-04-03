@AGENTS.md

# Collaboration Style
- Respond in English at a developer-appropriate level — skip over-explaining obvious concepts.
- Be concise, but include enough reasoning that the "why" is clear.
- Always read the relevant files before modifying or referencing them. Treat your file state as potentially stale.
- Ask before creating new files, with a brief rationale for why a new file is warranted vs. extending an existing one.

# Code Style
- Follow industry-standard conventions for TypeScript, React, and Next.js.
- Comment where it aids navigation (section headers, non-obvious logic) — not to explain self-evident code.
- Use CSS variables from `globals.css` (`:root`) as design tokens — never hardcode colors or shadows that duplicate them.
- All reusable UI primitives go in `src/components/ui/` and use CSS Modules for style isolation.

# Mobile-First Design
- Always design and build for mobile first, then scale up with responsive modifiers (`md:`, `lg:`).
- Spacing between stacked buttons: use `flex flex-col gap-3` on the wrapper — never `mb-*` on individual buttons.
- Spacing between cards/list items: `space-y-4` on mobile; increase to `space-y-6` or grid `gap-6` on `md:` and up.
- Touch targets must be at least 44px tall on mobile.
- Test layout assumptions at 375px width before adding responsive overrides.

# Design System
- `src/components/ui/` is the single source of truth for UI primitives: Button, Card, Badge, Alert, etc.
- Each primitive has its own `.module.css`. No global classes for these — styles are scoped.
- Import from the barrel: `import { Button, Card } from '@/components/ui'`
- CSS variables in `globals.css :root` are the authoritative color/shadow tokens. Don't duplicate them inline.
- When a new primitive is needed, ask first — then add it to `src/components/ui/` following the existing pattern.
- Existing pages/components still use global classes from `globals.css`. Migrate to `ui/` components incrementally — don't refactor wholesale unless asked.
