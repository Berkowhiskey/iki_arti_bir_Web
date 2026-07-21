# İki Artı Bir Yapı — Architecture & Engineering Web Portal

> *"Distinctive lines that add value to living."*

A full-stack corporate web portal with its own content management system, built for an
architecture and civil engineering firm based in Foça, İzmir (Turkey).

**Status:** ✅ Feature-complete — visitor site, full CMS, and SEO infrastructure are all in place.

---

## About the Project

The site solves two different problems in a single product.

**The visitor side** is built around a **split-screen** concept that visually expresses the
two founders' disciplines: the left panel represents engineering through brutalist concrete
textures and structural grid lines, while the right panel represents architecture through warm
oak tones and soft plays of light. Scroll-driven animations tie the two worlds together as the
page moves.

**The admin side** is a protected dashboard where the firm's owners manage every piece of
content on the site — slogan, about text, team members, the project/construction-site
portfolio, and contact details — without needing a developer.

> **Note:** All content in this repository is **placeholder** data. Real copy, photographs,
> and contact details are entered exclusively through the admin panel and are never committed
> to version control.

---

## Tech Stack

| Layer | Technology | Version |
| :--- | :--- | :--- |
| Framework | Next.js (App Router) | 16.2.10 |
| UI library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 (CSS-first) |
| Components | Shadcn/ui (Radix) | v4.13.1 |
| ORM | Prisma | 7.8.0 |
| Database | MySQL / MariaDB | 10.4+ |
| Forms & validation | React Hook Form + Zod | — |
| Animation | Motion (Framer Motion) | 12.42.2 |
| Authentication | Auth.js (NextAuth v5) | 5.0.0-beta.31 |
| Icons | Lucide React | — |

---

## Notable Engineering Decisions

A selection of deliberate choices made in this project that are worth repeating elsewhere.

### Data & Persistence

**`Decimal` for coordinates, never `Float`**
Project locations are stored as `Decimal(10, 7)`. Floating-point rounding error can shift map
accuracy by several meters — an unacceptable drift for geographic data.

**Prisma 7's driver-adapter architecture**
Prisma 7 removed the `url` field from the `datasource` block. The connection is now managed in
two separate layers: `prisma.config.ts` (migrations and introspection) and
`@prisma/adapter-mariadb` (runtime). The `PrismaClient` singleton is cached on `globalThis` so
hot reloading in development doesn't exhaust the connection pool.

**Singleton settings tables**
Hero, About, and Contact settings live in single-row tables pinned to `id = 1` and are updated
with `upsert`. This removes both the "does a record exist?" check and any risk of row
duplication.

**Staged migration for a required unique column**
Adding a `NOT NULL UNIQUE` slug column to a populated table cannot be done in the single step
Prisma generates — there is no default value, and any shared default would violate the
constraint. The migration was hand-written in three stages: add the column as nullable,
backfill it, then tighten it and add the unique index. Human-readable slugs are produced by a
separate **idempotent** script, because the Turkish-to-ASCII transliteration lives in
application code rather than SQL.

**Seed scripts never overwrite user-owned values**
Re-running the seed refreshes names and settings but deliberately leaves admin password hashes
and slugs untouched. Without this, a password changed through the admin panel would silently
revert to the `.env` value on the next seed run.

### Security

**Auth configuration split along the Edge/Node boundary**
Route protection runs through `proxy.ts` in the Edge runtime, where Prisma and bcrypt cannot
run. The configuration is therefore split in two: `lib/auth.config.ts` (Edge-compatible, no
providers) and `lib/auth.ts` (Prisma + bcrypt, Node only). Keeping them in one file would break
at runtime.

**Constant-time login to prevent user enumeration**
Even when an email isn't found in the database, `bcrypt.compare` still runs against a dummy
hash. Otherwise the difference in response time would reveal which addresses are registered.
The login screen also never discloses which field was wrong.

**Server Actions are public HTTP endpoints**
The panel is protected by route middleware, but each action can still be invoked directly.
Every mutating action therefore calls `requireAdmin()` on its first line — verified as a
standing rule, not left to convention.

**Three-layer defense on file uploads**
1. *The client-supplied filename is never used.* Names are regenerated as `randomUUID()` plus
   the detected extension, which eliminates path traversal, double extensions, and collisions
   in one move.
2. *File type is read from content, not from the extension or `file.type`.* Both of the latter
   are trivially forged; magic bytes are not. SVG is deliberately rejected because it can carry
   scripts.
3. *The stored path is validated by a Zod schema before it reaches the database.* Without this,
   a crafted request could persist an external URL or a `javascript:` value that the visitor
   page would later render as an `<img src>`.

### Interface & Experience

**Theme lives in a cookie; there is no client-side script**
The common solution (`next-themes`) renders a `<script>` from inside a client component to
apply the theme before hydration. React 19 doesn't execute scripts inside the component tree on
the client, so this left an extra DOM node and caused a hydration mismatch. The dependency was
removed: the theme is now read from a cookie and written directly onto the `<html>` class on
the server. No script is needed, and there is no flash of unstyled content — the theme is
already correct in the first HTML response.

**Visual theme comes from data, not from position**
Which palette a team card is drawn with (concrete or oak) is read from the
`TeamMember.discipline` field, not from the card's index. A position-based solution would have
scrambled the colors the moment an administrator reordered the list. A small enum field removes
a dependency that would otherwise have broken silently.

**Scroll-driven animation bound to its target, not the page**
Hero scroll progress is bound to the hero element itself
(`offset: ["start start", "end start"]`) rather than the whole document. The slogan modal
shrinking away and the grid lines extending therefore feel identical regardless of total page
length — adding a new section doesn't break the animation timing.

**Reduced-motion support designed in from the start**
Every animated component checks `useReducedMotion`. For users with vestibular sensitivity,
scroll transforms are disabled entirely and the intro screen is shortened. This was part of the
architecture, not a patch applied afterwards.

**Whole-card links without harming screen readers**
Team and project cards are fully clickable via a `<Link>` in the heading that covers the card
with `before:absolute before:inset-0`. Wrapping the entire card in an anchor would have bundled
heading, body text, and call-to-action into one unreadable link; this pattern keeps exactly one
meaningful link per card.

**A map link instead of an embedded map**
Project coordinates are shown in a technical spec block alongside an "open in maps" link. An
embedded iframe would send a request to Google for every visitor — a cookie and privacy
(GDPR/KVKK) burden — while slowing the page and lowering Lighthouse scores.

**CSS-variable-based design system**
The split-screen's two palettes (`beton-50..900` cool greys, `mese-50..900` warm woods) are
defined in Tailwind v4's `@theme` block. The design system existed before the interface was
built, so classes like `bg-beton-800` and `text-mese-300` were available from day one.

### A Deliberate Trade-off

**Visitor pages render dynamically, on purpose.**
The root layout reads the theme from a cookie, and `cookies()` is a dynamic API that opts every
route beneath it out of static rendering. Making the visitor pages static would mean relocating
the theme class out of the root layout — a change to a subsystem that had already broken twice
during development, in exchange for a modest gain at this scale. The `revalidatePath` calls
that on-demand revalidation would require are already in place, so the decision can be revisited
under real traffic. It is recorded as a weighed trade-off rather than an oversight.

---

## Data Model

```
Admin              → Administrator accounts (bcrypt, 12 rounds)
HeroSettings       → Slogan and sub-slogan                              (single row)
AboutSettings      → About text and image                               (single row)
ContactSettings    → Contact details, social links, office coordinates  (single row)
TeamMember         → Team members (sortable, active/hidden, discipline theme, slug)
Project            → Construction sites — category, location, coordinates, publish state, slug
  └─ ProjectImage  → Project gallery (cascade delete, sortable)
```

Categories: `MIMARLIK` (architecture) · `MUHENDISLIK` (engineering) · `IC_DIZAYN` (interior design)

---

## Features

**Visitor site**
- One-page layout: split-screen hero, about, team, portfolio, contact
- Scroll-driven animations, intro sequence, and a top navigation bar that appears past the hero
- Team member detail pages (`/ekip/[slug]`) and project detail pages (`/projeler/[slug]`)
- Project galleries, technical spec blocks, and related-content strips
- Dynamic sitemap and `robots.txt`; hidden records are excluded from both

**Admin panel**
- Credential-based login, protected routes, and a self-service password change screen
- Full CRUD for team members and projects, including gallery management
- Image uploads with preview, replacement, and cleanup of orphaned files
- Editors for hero, about, and contact content
- Dark mode

---

## Getting Started

**Requirements:** Node.js 24+ (required by Prisma 7), MySQL 8 or MariaDB 10.4+

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
#    Fill in DATABASE_URL, SEED_ADMIN_*, AUTH_SECRET, and NEXT_PUBLIC_SITE_URL

# 3. Create the database (utf8mb4 is required)
mysql -u root -e "CREATE DATABASE iki_arti_bir CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 4. Apply the schema and load seed data
npm run db:migrate
npm run db:seed

# 5. Start the development server
npm run dev
```

The site runs at `http://localhost:3000`; the admin panel lives at `/admin`.

> **Turkish character support requires two separate layers.** Setting the database to `utf8mb4`
> is not enough on its own — without `latin-ext` in the Google Fonts subset, characters such as
> `ş`, `ğ`, `ı`, and `İ` fall back to a different font and break the typography. Both layers are
> configured and verified here; it's a detail that is easy to miss.

> **Before deploying, set `NEXT_PUBLIC_SITE_URL` to the real domain.** It defaults to
> `localhost`, and leaving it would make the sitemap advertise unreachable URLs to search
> engines.

### Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create and apply migrations |
| `npm run db:seed` | Load seed data |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:backfill-slugs` | Convert placeholder team slugs into readable ones (idempotent) |
| `npm run db:studio` | Prisma Studio — visual data browser |

---

## Project Structure

```
├── app/
│   ├── (visitor)/          # Visitor pages (one-page layout + detail routes)
│   │   ├── ekip/[slug]/    # Team member detail
│   │   └── projeler/[slug]/# Project detail
│   ├── admin/              # Admin panel (CMS) — a real path segment, not a route group,
│   │                       #   so that "protect everything under /admin" holds
│   ├── api/auth/           # Auth.js routes
│   ├── login/              # Admin login
│   ├── sitemap.ts          # Dynamic sitemap
│   └── robots.ts           # robots.txt
├── components/
│   ├── ui/                 # Shadcn/ui primitives
│   ├── visitor/            # Visitor-specific components
│   └── admin/              # Admin forms, tables, and shared form shell
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Migration history
│   └── seed.ts             # Seed data
├── lib/                    # Prisma singleton, auth, validation schemas, uploads, helpers
├── hooks/                  # Custom React hooks
└── public/uploads/         # Uploaded images (excluded from version control)
```

> Route protection uses `proxy.ts` rather than `middleware.ts` — Next.js 16 deprecated the
> `middleware` file convention in favor of `proxy`.

---

## Roadmap

- [x] **Phase 1** — Infrastructure, Prisma schema, migrations, and seed
- [x] **Phase 2** — Split-screen visitor interface and scroll-driven animations
- [x] **Phase 3** — Auth.js integration, protected admin layout, dark mode
- [x] **Phase 4** — CMS modules (CRUD), image uploads, data tables, detail pages
- [x] **Phase 5** — Dynamic coordinate integration, sitemap, and `robots.txt`
- [ ] Extended OpenGraph metadata, JSON-LD structured data, and a Lighthouse pass

---

## Security Notes

- `.env` is **not** in version control; `.env.example` serves as the template
- Admin passwords are hashed with bcrypt (12 rounds) and never hard-coded in the seed file
- Every form input passes through a Zod schema — on the server, not just in the browser
- Every mutating Server Action verifies the session before touching data
- Uploads are validated by content signature, size, and path pattern
- Uploaded images stay out of the repository, on the server's persistent disk
- `robots.txt` keeps admin routes out of search results, but it is **not** a security control —
  the actual protection is the session check

---

## License

This is a client project. The source is shared as a portfolio piece to demonstrate the
technical approach; commercial use or redistribution requires permission.
