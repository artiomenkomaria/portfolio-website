# Migrating Web Pages to Astro — Engineering Guide

A reusable, project-agnostic playbook for moving legacy HTML / React / WordPress / static pages
onto a **content-driven, zero-JS Astro static site**. Distilled from a production marketing site.

The core idea: **content is data, not markup.** Pages become declarative lists of section
components hydrated from validated frontmatter. No copy lives in `.astro`/`.tsx` files. No
JavaScript ships unless a piece of UI genuinely needs it.

---

## 1. Target Architecture

```
src/
├── content.config.ts          ← Zod schemas + glob() loader — the source of truth for content shape
├── layouts/Layout.astro        ← owns <html>, <head>, SEO, fonts, Nav, Footer
├── pages/                      ← file-based routing. One .astro per route. Logic only, no copy.
├── content/
│   └── pages/*.md              ← one file per route; SEO + an ordered list of `sections`
├── components/
│   ├── seo/                    ← SEO.astro, JsonLd*.astro
│   ├── sections/*.astro        ← static, server-rendered section blocks (0KB JS)
│   └── islands/*.tsx           ← React components — ONLY for interactive UI
├── data/                       ← site constants, navigation menu (data-driven, not hardcoded)
└── styles/
    ├── tokens.css              ← CSS custom properties (colors, spacing, type scale)
    └── global.css              ← resets + global utility classes
astro.config.mjs                ← output: 'static', integrations
```

**Three principles that drive every decision:**

1. **Schema first.** Every string and data structure on a page is declared in a Zod schema
   before any markup is written. The build fails loudly if content is missing or malformed.
2. **Sections are components, pages are playlists.** A page's `.md` file lists `sections:`,
   each tagged with a `component` name. The route maps that name to an imported component.
3. **0KB JS by default.** Static structure and text ship zero JavaScript. Interactivity is
   opt-in, per-widget, via React islands with explicit hydration directives.

---

## 2. Project Setup

```bash
npm create astro@latest        # choose: Empty, TypeScript Strict
npx astro add react mdx sitemap
npm install @fontsource/<display-font> @fontsource/<mono-font>
```

`astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://example.com",   // REQUIRED — powers canonical URLs + sitemap
  output: "static",
  integrations: [mdx(), react(), sitemap()],
  build: { inlineStylesheets: "auto" },
});
```

`tsconfig.json` — add a path alias so imports stay stable as files move:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "~/*": ["src/*"] }
  }
}
```

Self-host fonts (import `@fontsource/*` in the layout) — never use Google Fonts `<link>` tags;
they block render and leak a third-party request.

---

## 3. The Migration Workflow (per page)

Migrate **one page at a time**, end to end. Do not bulk-convert markup.

### Step 1 — Inventory the legacy page

Open the legacy page and catalogue it as **data, not HTML**:

- Break the page into **sections** (hero, feature grid, pricing table, FAQ, CTA…).
- For each section, list every **unique string** (headings, body, labels, button text, footnotes).
- Identify **repeating structures** → these become arrays (feature lists, steps, table rows).
- Flag anything **interactive** (accordions, calculators, tabs, carousels, forms) → islands.
- Note **SEO metadata**: `<title>`, meta description, canonical, OG image, structured data.

### Step 2 — Schema first

In `src/content.config.ts`, add a Zod variant for each section type to a discriminated union
keyed on `component`. Then declare the `pages` collection. See §4.

### Step 3 — Build the section components

One component per section type. Static → `.astro` in `sections/`. Interactive → `.tsx` in
`islands/`. **Zero string literals** — everything comes from `Astro.props`. See §5.

### Step 4 — Hydrate the content file

Create `src/content/pages/<slug>.md`. Fill in SEO + the ordered `sections:` array, matching
the schema exactly. See §6.

### Step 5 — Create the route

Create `src/pages/<slug>.astro`. Import the section components, map names → components, render
the list. See §7.

### Step 6 — Validate

`npm run build` **and** `npm run check` must both pass with zero errors. See §9.

---

## 4. Schema First — `content.config.ts`

The schema is the contract. Each section type is one variant of a discriminated union keyed
on a `component` literal. Required fields that are missing fail the build — **never make a
field optional just to silence the build; supply the data in the markdown instead.**

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const sectionSchema = z.discriminatedUnion("component", [
  z.object({
    component: z.literal("Hero"),
    heading: z.string(),
    body: z.string(),
    primaryCta: z.string(),
    primaryHref: z.string(),
  }),
  z.object({
    component: z.literal("FeatureGrid"),
    label: z.string(),
    heading: z.string(),
    features: z.array(z.object({
      num: z.string(),
      title: z.string(),
      body: z.string(),
    })),
  }),
  z.object({
    component: z.literal("FAQ"),
    heading: z.string(),
    faqs: z.array(z.object({ q: z.string(), a: z.string() })),
  }),
  // …one variant per section type
]);

const pages = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    seo: z.object({
      title: z.string(),
      description: z.string(),
      canonical: z.string().optional(),
      ogImage: z.string().optional(),
      noindex: z.boolean().optional(),
    }),
    sections: z.array(sectionSchema).optional(),
  }),
});

export const collections = { pages };
```

**Rules:**

- Editing this file is a **migration** — update every existing `.md` entry in the same change
  or the build breaks.
- After editing it, **restart `npm run dev`** — the content layer does not reliably hot-reload
  schema changes.
- Model repeating structures as `z.array(z.object({…}))`. Model fixed-shape rows as
  `z.tuple([...])`. Model lookup maps as `z.record(...)`.

---

## 5. Building Section Components

### Decision: `.astro` or `.tsx`?

Ask: **does this need `useState`, `useEffect`, event handlers, or DOM refs?**

- **No** → `.astro` in `src/components/sections/`. Server-rendered, scoped styles, ships 0KB JS.
- **Yes** → `.tsx` in `src/components/islands/`. Hydrated React, ships JS — keep it small.

### Static section pattern (`.astro`)

Typed props, destructure `Astro.props`, scoped `<style>`. **No hardcoded copy, no hardcoded colors.**

```astro
---
interface Feature { num: string; title: string; body: string; }
interface Props { label: string; heading: string; features: Feature[]; }

const { label, heading, features } = Astro.props;
---
<section class="feature-grid">
  <div class="inner">
    <div class="mono section-label">{label}</div>
    <h2 class="section-heading">{heading}</h2>
    <div class="grid">
      {features.map((f) => (
        <article>
          <span class="mono">{f.num}</span>
          <h3>{f.title}</h3>
          <p>{f.body}</p>
        </article>
      ))}
    </div>
  </div>
</section>

<style>
  .feature-grid { background: var(--canvas); }
  .inner {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: 96px 48px;
  }
  .section-heading { font-size: clamp(40px, 5vw, 72px); margin-bottom: 64px; }
  /* colors/spacing come from tokens.css — never hardcode hex/rgb here */
</style>
```

### Interactive island pattern (`.tsx`)

```tsx
import { useState } from "react";

interface Props { faqs: { q: string; a: string }[]; }

export default function FAQAccordion({ faqs }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      {faqs.map((f, i) => (
        <div key={i}>
          <button onClick={() => setOpen(open === i ? null : i)}>{f.q}</button>
          {open === i && <p>{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
```

Mount it from an `.astro` section with an explicit hydration directive:

- `client:visible` — hydrate when scrolled into view (default for below-the-fold widgets).
- `client:load` — hydrate immediately (above-the-fold interactivity only).
- `client:idle` — hydrate when the browser is idle.
- Avoid `client:only` unless the component genuinely cannot server-render.

```astro
---
import FAQAccordion from "~/components/islands/FAQAccordion.tsx";
const { faqs } = Astro.props;
---
<FAQAccordion faqs={faqs} client:visible />
```

The static `.astro` wrapper renders the section heading/label (0KB JS); only the interactive
part is an island. **Pass data into islands as props from frontmatter** — don't fetch or
hardcode inside the island.

---

## 6. Hydrating the Content File

`src/content/pages/<slug>.md` — frontmatter only; the markdown body is unused. The `sections:`
array is **ordered** — it is the page, top to bottom.

```markdown
---
title: "Pricing"
description: "Simple, transparent pricing."
seo:
  title: "Pricing — Example.com"
  description: "Transparent per-transaction pricing with no monthly seat fees."
sections:
  - component: Hero
    heading: "Pricing that scales with you"
    body: "Pay per transaction. No seats, no minimums."
    primaryCta: "Get started →"
    primaryHref: "/contact"
  - component: FeatureGrid
    label: "§01 — INCLUDED"
    heading: "Everything in every plan"
    features:
      - num: "01"
        title: "Unlimited users"
        body: "No per-seat fees, ever."
      - num: "02"
        title: "Global coverage"
        body: "Pay into 180+ countries."
  - component: FAQ
    heading: "Common questions"
    faqs:
      - q: "Is there a setup fee?"
        a: "No. You only pay per transaction."
---
```

If the build complains about a missing field, **add the data here** — do not weaken the schema.

---

## 7. Creating the Route

`src/pages/<slug>.astro` — the registry pattern. The route is **logic only**: import
components, map names, render. No copy.

```astro
---
import { getEntry } from "astro:content";
import Layout from "~/layouts/Layout.astro";

import Hero from "~/components/sections/Hero.astro";
import FeatureGrid from "~/components/sections/FeatureGrid.astro";
import FAQ from "~/components/sections/FAQ.astro";

const page = await getEntry("pages", "pricing");
if (!page) throw new Error("Missing content: src/content/pages/pricing.md");

const { seo, sections } = page.data;

const components: Record<string, any> = { Hero, FeatureGrid, FAQ };
---
<Layout seo={seo}>
  {sections?.map((section: any) => {
    const Component = components[section.component];
    if (!Component) return null;
    return <Component {...section} />;
  })}
</Layout>
```

Every section component a page uses **must** be registered in that route's `components` map —
an unmapped name renders nothing.

### Dynamic routes

For families of pages sharing a layout (audiences, locales, categories), use one route file
with `getStaticPaths()`:

```astro
---
export async function getStaticPaths() {
  return [
    { params: { slug: "businesses" } },
    { params: { slug: "contractors" } },
  ];
}
const { slug } = Astro.params;
const page = await getEntry("pages", slug);
---
```

---

## 8. The Layout, SEO, and Navigation

### `Layout.astro`

Owns `<html>`, `<head>`, font imports, global CSS, SEO, structured data, `<Nav>`, `<Footer>`.
Pages render into its `<slot>`. Keep the SEO wiring intact when editing.

```astro
---
import "~/styles/tokens.css";
import "~/styles/global.css";
import SEO from "~/components/seo/SEO.astro";
import Nav from "~/components/Nav.astro";
import Footer from "~/components/Footer.astro";

interface Props { seo: { title: string; description: string; canonical?: string; ogImage?: string; noindex?: boolean }; }
const { seo } = Astro.props;
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <SEO {...seo} />
  </head>
  <body>
    <Nav />
    <main><slot /></main>
    <Footer />
  </body>
</html>
```

### SEO requirements (non-negotiable)

- `seo.title` — unique per page, ~40–70 chars.
- `seo.description` — unique per page, ~70–170 chars.
- **Exactly one `<h1>` per page** — the hero owns it; no section adds a second.
- Canonical URL — emit from the current route inside `SEO.astro`.
- Internal links use clean paths (`/pricing`, never `/pricing.html`).
- Never lazy-load the hero / above-the-fold image.

### Navigation is data, not markup

Put the menu in `src/data/navigation.ts` and have `Nav.astro` iterate it. Build dropdowns
with CSS only (`:hover`, `:focus-within`) — no JS in the nav.

---

## 9. Styling: Tokens, Not Literals

- **Vanilla CSS only.** No Tailwind, no CSS-in-JS. Scoped `<style>` blocks inside components.
- **All** colors, spacing, and type sizes come from CSS custom properties in
  `src/styles/tokens.css`. Zero hex/rgb literals inside components or islands.
- Pick a small fixed **type scale** (e.g. 3 heading clamps) and reuse it — prevents visual jitter.
- Constrain every section's inner content: `max-width: var(--container-max-width); margin: 0 auto;`.
- Use consistent section padding (e.g. `96px 48px`) so vertical rhythm holds across the site.

```css
/* tokens.css */
:root {
  --canvas: #F7F8F5;
  --ink: #0E1310;
  --accent: #FF00FF;
  --line: rgba(14, 19, 16, 0.1);
  --font-display: "Space Grotesk", sans-serif;
  --container-max-width: 1440px;
}
```

To add a new color treatment, **add a token first**, then reference it. A component-level
literal is a migration defect.

---

## 10. Validation — Definition of Done

A migrated page is done only when **all** are true:

1. `npm run build` succeeds (static output in `./dist`).
2. `npm run check` (`astro check`) reports zero type errors.
3. The rendered page has a populated `<title>` and `<meta name="description">`.
4. The page has **exactly one `<h1>`**.
5. No copy lives in `.astro`/`.tsx` files — all strings trace to a content collection field.
6. No color/spacing literals were introduced in components — all reference `tokens.css`.
7. Static pages ship **0KB JavaScript**; only islands ship JS.
8. Lighthouse target: Performance ≥ 95, Accessibility ≥ 95.

Verify the JS budget: `npm run build` then inspect `./dist` — a page with no islands should
emit no `.js` in its output.

---

## 11. Common Migration Pitfalls

| Legacy pattern | Astro replacement |
| --- | --- |
| Copy hardcoded in JSX/HTML | Move to `*.md` frontmatter; component reads `Astro.props` |
| Whole page is one React component | Split into static `.astro` sections; keep only interactive bits as islands |
| `useState` for a CSS-only dropdown | CSS `:hover` / `:focus-within` — delete the JS |
| Inline styles / hex colors | Tokens in `tokens.css` referenced via `var(--…)` |
| Tailwind utility classes | Scoped `<style>` blocks + tokens |
| Google Fonts `<link>` | Self-hosted `@fontsource/*` imported in the layout |
| Client-side data fetch for static content | Read at build time via content collections |
| `.html` internal links | Clean paths (`/pricing`) |
| One giant `pages/*.astro` with markup | Route = registry logic only; content in `.md` |
| Optionalizing a Zod field to fix the build | Supply the missing data in the markdown |

**Migrate incrementally.** One page at a time, each passing build + check before the next.
Don't refactor the schema and the markup in separate uncoordinated steps — a schema change
must land with its content updates together.

---

## 12. Quick Reference — Adding One Page

1. `src/content/pages/<slug>.md` — SEO + ordered `sections:` (matches schema).
2. `src/content.config.ts` — a Zod variant for any new section type (restart dev server after).
3. `src/components/sections/*.astro` or `islands/*.tsx` — one component per section type.
4. `src/pages/<slug>.astro` — import components, map names, render the list.
5. `src/data/navigation.ts` — add a nav entry if the page is linked.
6. `npm run build && npm run check` — both must pass.
