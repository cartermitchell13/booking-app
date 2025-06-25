# Front-End Implementation Plan (Next.js + Supabase)

## 1. Tech Stack
- Next.js (App Router, TypeScript, React 18)
- Supabase JS SDK (v2) for data fetching & auth
- Tailwind CSS for rapid, responsive styling (can be customised to match brand)
- React-Query (TanStack Query) for data caching & optimistic updates
- Mapbox GL JS for interactive map with markers & clustering
- Headless UI + Radix UI for accessible components (modals, popovers)
- Vercel (or AWS Amplify) for hosting `book.parkbus.com`

## 2. High-Level Architecture
```
/pages or /app           – route handlers & layouts
/components              – reusable UI components (buttons, cards)
/features                – domain-driven folders (search, booking, trips, map)
/hooks                   – custom hooks (useTrips, useCalendar)
/lib                     – Supabase client, API helpers, utils
/public                  – static assets (icons, images)
/styles                  – global Tailwind config + base css
```

## 3. Core Pages & Routes
| Path | Description |
|------|-------------|
| `/` | Landing search page (city / trip search) |
| `/results` | Search results + map split view |
| `/trip/[slug]` | Trip detail & booking flow |
| `/checkout` | Stripe checkout redirect |
| `/booking/success` | Confirmation page |
| `/dashboard` | (Auth-protected) admin interface |

## 4. Component Hierarchy (per design)
- **SearchBar**
  - OriginSelect (departure city)
  - DestinationSelect (drop-down filtered by selected origin)
  - OutboundDatePicker (single date)
  - ReturnDatePicker (optional, shown when **ReturnToggle** is active)
  - PassengersSelector (adult / student / child counts)
  - SearchButton
- **FilterPills** (sticky under search bar)
- **CarouselRecommendations** (horizontal scroll of cards)
  - TripCard (image, price, rating)
- **ResultsGrid** (below carousel)
  - TripListItem (price first, arrow button)
- **MapPanel** (right side, 40% width)
  - MapboxMap
  - PriceMarker (custom HTML marker)
  - TripPopup (quick preview + CTA)

## 5. State Management & Data Flow
1. Global context (`SearchContext`) stores: `originId`, `destinationId`, `outboundDate`, `inboundDate?`, `passengers`, `tripType`.
2. useSearchParams hook syncs context ↔ URL query for shareable deep links.
3. React-Query fetches `rpc_search_trips` (origin, destination, outboundDate[, inboundDate]) and caches results.
4. Map & list subscribe to same query key for consistent data.
5. Lazy-load additional data (ratings, availability) on hover / map zoom.

## 6. Styling & Responsiveness
- Use Tailwind CSS + custom theme tokens for colours/typography.
- Desktop: Split layout (60% list, 40% map) like screenshot.
- Tablet: Map collapses into bottom sheet.
- Mobile: Full-screen list, map toggled via icon.
- Implement dark mode toggle using `next-themes`.

## 7. UX Principles & Booking Flow (Research-backed)
Based on industry best practices for travel & ticket booking:
1. **Single Search Entry Point** – prominent, centered search bar with auto-complete and inline validation.
2. **Progressive Disclosure** – multi-step wizard (Search → Select Trip → Passenger Info → Review & Pay) with a visible **ProgressStepper**.
3. **Persistent Summary Sidebar** – sticky panel showing selections, price breakdown, and trust badges.
4. **Real-time Availability & Pricing** – fetch seat counts and prices on hover/select; block seats for 10 min during checkout.
5. **Edit in Place** – allow quick edits to earlier steps without losing progress via stepper links.
6. **Mobile-first Optimisation** – thumb-reachable CTAs, bottom sheets for calendars & lists.
7. **Transparency & Trust** – no hidden fees, show refund policy tooltip, display SSL/Stripe secure icons.
8. **Speed** – lazy-load heavy assets, prerender popular routes, cache repeat searches in localStorage.

### Updated Component Additions
- **ProgressStepper** – indicates current step.
- **TripTimePicker** – lists outbound (& inbound) departure times with seats left.
- **SeatSelector** (optional, future) – choose specific seat if buses have seating plans.
- **SummarySidebar** – order recap, price breakdown, coupon input.
- **PaymentForm** – Stripe Elements, supports Apple / Google Pay.

### Booking Flow
1. **Search** (homepage)
2. **Results** (select outbound + inbound times)
3. **Passengers** (names, ages; auto price grouping)
4. **Review & Pay** (summary, discount, pay)
5. **Success** (e-ticket + calendar add-to-wallet)

## 8. Performance Optimisations
- Code-split Mapbox + heavy components using dynamic imports (`next/dynamic`).
- Memoise markers; use `Supercluster` for clustering.
- Use `getStaticProps` + ISR for trip detail pages (static + real-time).
- Images served via `next/image` with blur placeholders.

## 9. Supabase Integration
- `lib/supabase.ts` initialises client with anon key.
- RLS policies ensure read-only public data.
- Custom RPC functions for search & availability checks.
- Realtime channel to reflect seat availability in checkout.

## 10. CI/CD & Quality
- Prettier + ESLint (Airbnb/Next.js rules).
- Husky + lint-staged to enforce formatting on commit.
- GitHub Actions: lint, type-check, Cypress e2e, Vercel preview.
- Chromatic for visual regression of components (Storybook).

## 11. Embeddable Trip Calendar
- Build `<TripCalendar />` React component using `@fullcalendar/react`.
- Expose as Web Component with `react-to-webcomponent`.
- Host on same domain, provide `<script>` tag for Webflow to embed.
- Calendar fetches trips by destination slug, emits `select` event.

## 12. Timeline (Est.)
| Week | Milestone |
|------|-----------|
| 1 | Project scaffolding, Supabase schema import |
| 2 | SearchBar & basic results list |
| 3 | Map integration & clustering |
| 4 | Trip detail + booking flow (checkout sandbox) |
| 5 | Embeddable calendar, admin dashboard stub |
| 6 | QA, accessibility audit, production launch |

---
This plan aligns the UI closely with the provided mockup while ensuring scalability, performance, and a first-class developer experience.
