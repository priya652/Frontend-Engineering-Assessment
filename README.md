# Product Explorer

A product listing and detail application built on the [DummyJSON products API](https://dummyjson.com/docs/products).

Built with **React 18 + Vite + React Router 6** and hand-written **CSS Modules**. No UI library, no state library, no CSS framework — the brief asked for reusable components and clean structure, so the components and the styling system are the deliverable rather than something imported.

---

## Setup

Requires **Node 18+** (developed on Node 20.18).

```bash
npm install
npm run dev      # http://localhost:5173
```

| Script            | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Dev server with hot module replacement        |
| `npm run build`   | Production bundle into `dist/`                |
| `npm run preview` | Serve the production build locally            |

### Deploying

The app uses `BrowserRouter`, so the host must rewrite unknown paths to `index.html`, otherwise a refresh on `/product/5` returns 404. Both configs are already committed:

- **Vercel** — `vercel.json`
- **Netlify** — `public/_redirects`

For GitHub Pages (which cannot rewrite), switch `BrowserRouter` to `HashRouter` in `src/main.jsx`.

---

## Requirements checklist

| Requirement                                              | Where                                                     |
| -------------------------------------------------------- | --------------------------------------------------------- |
| Product grid with image, title, price, rating             | `components/product/ProductCard.jsx`                       |
| Filters on the left, grid on the right                    | `pages/ProductListingPage.module.css`                      |
| Category filter, fetched from `/products/categories`      | `components/filters/CategoryFilter.jsx`                    |
| Price range (min + max)                                   | `components/filters/PriceRangeFilter.jsx`                  |
| Brand filter, multi-select, derived from fetched products | `components/filters/BrandFilter.jsx`                       |
| Combined filtering                                        | `hooks/useProductList.js`                                  |
| Filter change updates the list immediately                | `hooks/useFilters.js`                                      |
| Pagination resets when filters change                     | `useFilters.setFilters` — any non-page patch resets page   |
| Loading state                                             | Skeletons in `ProductGrid`, `FilterPanel`, detail page     |
| Error handling                                            | `api/client.js` + `ui/StateMessage.jsx` + `ErrorBoundary`  |
| Detail page: image, name, price, rating, description, brand, category | `pages/ProductDetailPage.jsx`                   |
| Card navigates to `/product/:id`                          | `ProductCard` wraps the card in a `<Link>`                 |
| Back button                                               | `ProductDetailPage` — returns to the exact filtered URL    |
| **Filters preserved on back-navigation**                  | Filter state lives in the URL — see below                  |

Beyond the brief: debounced search, sorting, active-filter chips, brand facet counts, a mobile filter drawer, an image gallery, reviews, an error boundary, and full keyboard/screen-reader support.

---

## Architectural decisions

### 1. The URL is the single source of truth for filters

Every filter — category, price, brands, sort, page, search — is serialised into the query string, and `useFilters()` is the only thing that reads or writes it.

```
/?category=smartphones&minPrice=100&maxPrice=900&brands=Apple,Samsung&sort=price-asc&page=2
```

This is the decision the rest of the app hangs off, because it satisfies *"previously selected filters should remain applied when navigating back"* without writing any code for it. The browser restores the URL on Back; the state comes back with it. It also makes filtered views shareable and reloadable, and it removes the possibility of a second copy of the state drifting out of sync.

Filter updates use `replace: true` on history, so ticking eight checkboxes doesn't become eight Back-button presses between the detail page and the listing.

### 2. Fetch the working set once, filter the rest in memory

DummyJSON can filter by **category** and **search** on the server, but has no parameters for **price** or **brand**. So the app fetches the full working set for the current category/search (`?limit=0`, at most 194 rows, `select=` trimmed to the nine fields the grid renders) and applies price, brand, sort and pagination client-side.

Server-side pagination was the obvious alternative, and it is wrong here: the brand facet must list every brand *in the current selection*, and price filtering must consider *every* matching product. If the client only ever held the current 12 rows, both features would silently lie — the brand list would change on every page turn.

Responses are cached by URL in `api/client.js`, so toggling a brand or typing a price re-runs the in-memory pipeline without touching the network. Failed requests are evicted so a transient error never becomes permanent.

### 3. Facet counts are computed after price but before brand

`useProductList` runs the pipeline in this order:

```
fetch → filter by price → derive brand facet → filter by brand → sort → paginate
```

The brand facet reflects every *other* active filter but not its own selection. Otherwise ticking "Apple" would make every other brand disappear from the list, and a multi-select filter you can only ever use once is a single-select filter with extra steps. Brands the user has ticked stay visible even at count 0, or there'd be no way to untick them.

### 4. Two-layer component structure

- `components/ui/` — generic, domain-free primitives: `Button`, `TextField`, `Checkbox`, `Rating`, `Badge`, `Skeleton`, `StateMessage`, `Icon`. None of them know what a product is.
- `components/filters/`, `components/product/`, `components/layout/` — domain components composed from those primitives.

`StateMessage` is a good illustration: network errors, empty filter results and 404s all render through it, so the error state and the empty state can never drift apart visually.

The `FilterPanel` holds no state at all. Because everything is lifted to the URL, the exact same component renders in the desktop sidebar and inside the mobile drawer — two presentations, one component, zero synchronisation.

### 5. Styling: CSS Modules over a framework

`styles/tokens.css` defines colour, spacing, radius, shadow and type scales as custom properties. Every `.module.css` file consumes those variables and nothing else, so re-theming the app means editing one file. CSS Modules give locally-scoped class names without a build-time CSS-in-JS runtime.

The grid uses `repeat(auto-fill, minmax(210px, 1fr))` rather than a breakpoint ladder, so it picks its own column count from the space available and stays correct whether the sidebar is showing or not.

### 6. Data fetching: one `useAsync` hook

There is no React Query here — the brief said avoid heavy libraries. `useAsync(fn, deps)` returns `{ data, loading, error, retry }` and handles the three things that actually matter: an `AbortController` per request, a stale-response guard so a slow request can never overwrite a newer one, and a `retry()` that re-runs without disturbing other state.

### 7. Debouncing where it changes behaviour, not everywhere

The brief says filters update *immediately*. Checkboxes do. But committing the price input on every keystroke means typing `150` filters at `1`, then `15`, then `150`. So price and search are locally controlled and commit 500 ms / 400 ms after typing stops; the Apply button and the Enter key commit at once, which also gives keyboard users an explicit action.

---

## Assumptions made

1. **Category is single-select.** `/products/category/{slug}` takes exactly one slug, and fanning out one request per checked category would be a poor trade for a filter people use one at a time. Brand, which the brief explicitly allows to be either, is multi-select.
2. **Search and category are mutually exclusive.** `/products/search` cannot be scoped to a category. When a search is active the app says so in the filter panel rather than pretending the category filter still applies.
3. **92 of the 194 products have no `brand` field.** They are omitted from the brand facet (there is nothing to list) and show as "Unbranded" on the detail page. Selecting any brand therefore excludes them, which is the correct meaning of the filter.
4. **Price is treated as USD** and formatted with `Intl.NumberFormat`. The API returns bare numbers with no currency.
5. **Page size is 12**, which divides evenly into the 2/3/4-column layouts the grid produces.
6. **A stale `?page=9` is clamped, not reset**, so a pasted link with too high a page shows the last real page instead of an empty grid.
7. **Cart and account icons in the navbar are decorative** — they're in the reference design but out of scope, so they're `aria-hidden` and inert rather than dead buttons.
8. **The catalogue is static for a session**, which is what justifies the response cache. A real store would need TTLs or revalidation.

---

## Improvements if given more time

**Testing.** The highest-value gap. `useProductList` is a pure pipeline over an array and `useFilters` is a pure URL codec — both are ideal unit-test targets, and neither has a test. I'd add Vitest + React Testing Library, and cover the filter-combination matrix and the pagination-reset rule first, then a Playwright run of the round trip: filter → open a product → Back → filters still applied.

**Virtualise long lists.** 194 rows is nothing, but the fetch-everything strategy stops scaling at a few thousand. The honest fix is a backend that supports price and brand as query parameters; failing that, `react-window` on the grid.

**Better perceived performance.** Prefetch the detail record on card hover, and pass the already-known title/price/image through router state so the detail page paints text instantly and only the gallery and reviews stream in.

**Accessibility polish.** The mobile drawer traps neither focus nor restores it on close — it handles Escape and scroll-lock but a proper focus trap needs `inert` or a small trap utility. I'd also add an `aria-live` announcement of the result count on every filter change.

**Persist filters beyond the URL.** Filters survive Back, but not a fresh visit. Writing the last-used filter set to `sessionStorage` and offering "restore your last search" would help returning users.

**TypeScript.** The API shape is inferred from live responses and enforced nowhere. Types on the product record would have caught the missing-`brand` case at compile time instead of at runtime.

**Image handling.** `<img loading="lazy">` and fixed aspect ratios are in, but there's no `srcset`, no blur-up placeholder, and no fallback for a broken image URL.

---

## Project structure

```
src/
├── api/
│   ├── client.js              fetch wrapper: caching, timeout, ApiError
│   └── products.js            DummyJSON endpoint bindings
├── components/
│   ├── ui/                    domain-free primitives
│   ├── layout/Navbar.jsx      brand, debounced search, actions
│   ├── filters/               FilterPanel + the three mandatory filters
│   ├── product/               ProductCard, ProductGrid, ImageGallery, ReviewList
│   ├── Pagination.jsx
│   └── ErrorBoundary.jsx
├── hooks/
│   ├── useAsync.js            data fetching with abort + stale guard
│   ├── useDebouncedValue.js
│   ├── useFilters.js          URL <-> filter state
│   └── useProductList.js      fetch → filter → facet → sort → paginate
├── pages/
│   ├── ProductListingPage.jsx
│   ├── ProductDetailPage.jsx
│   └── NotFoundPage.jsx
├── styles/
│   ├── tokens.css             design tokens
│   └── global.css             reset + base
└── utils/format.js
```
