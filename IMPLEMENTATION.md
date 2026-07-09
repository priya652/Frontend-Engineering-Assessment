# How this was built, step by step

A record of the order the application was built in and the reasoning behind each decision. The README covers *what* the app does; this covers *why it looks the way it does*.

---

## Step 0 — Read the API before writing code

Before any component existed I called the four endpoints and looked at what actually came back. Three findings changed the design:

| Finding | Consequence |
| --- | --- |
| `/products?limit=0` returns the **entire 194-product catalogue** in one response | Fetching everything once is cheap and viable |
| **92 of 194 products have no `brand` field** — nearly half | The brand facet has to tolerate missing brands, and the detail page needs an "Unbranded" fallback |
| `/products/categories` returns `{slug, name, url}` objects, **not strings** | The category filter must read `.slug` / `.name`, not the raw value |
| There is **no price or brand query parameter**, on any endpoint | Those two filters *must* be client-side |

That last row is the single most important fact about this assignment, and it is invisible until you read the API docs. Everything in Step 3 follows from it.

---

## Step 1 — Choose the stack

React 18 + Vite + React Router 6 + hand-written CSS Modules.

- **Vite 5, not 7** — the machine runs Node 20.18, and Vite 7 requires 20.19+. Checked first rather than discovering it at install time.
- **No UI library, no Tailwind, no Redux, no React Query.** The brief says "avoid heavy UI libraries" and lists reusable components and state management as the things being assessed. Importing those is delegating the assessment.
- **CSS Modules over plain CSS** — local class scoping with no runtime cost, and it keeps each component's styles adjacent to the component.

---

## Step 2 — Design tokens before components

`src/styles/tokens.css` came first: colour, spacing (a 4px scale), radii, shadows, type scale, motion, layout constants — all as CSS custom properties.

**Why first:** if you write components first, every one of them invents its own padding and its own grey. Writing the token file first means every `.module.css` afterwards consumes variables and nothing else, and re-theming the entire app is a single-file edit. This is the difference between "styled with CSS" and "has a styling system".

---

## Step 3 — The data architecture (the load-bearing decision)

DummyJSON supports **category** and **search** server-side. It supports **price** and **brand** nowhere.

The obvious approach — `?limit=12&skip=N` server-side pagination — is quietly broken here. The brief requires the brand filter to be *"extracted from fetched products"*. If the client only ever holds 12 products, then the brand list is built from 12 products, and it changes every time you turn the page. Price filtering would have the same defect: it would filter the current page, not the catalogue.

So `useProductList` fetches the **working set** for the current category/search — all of it, `?limit=0`, trimmed with `select=` to the nine fields the grid renders — and runs the rest in memory:

```
fetch → filter by price → derive brand facet → filter by brand → sort → paginate
```

**Facet ordering is deliberate.** The brand facet is computed *after* the price filter but *before* the brand filter. So the brands you can pick always reflect the other active filters, but never the brand filter's own selection. Compute it after the brand filter instead and ticking "Apple" makes every other brand vanish — a multi-select you can only use once. A ticked brand also stays listed at count 0, otherwise there is no way to untick it.

**Pagination clamps rather than resets.** A pasted `?page=9` that no longer has nine pages shows the last real page, not an empty grid.

The response cache in `api/client.js` is keyed by URL and stores the *promise*, which both memoises results and collapses duplicate concurrent requests. Rejections are evicted, so a transient network failure never becomes a permanent one.

---

## Step 4 — Put filter state in the URL

`useFilters()` reads and writes the query string, and nothing else holds filter state.

The brief has a requirement that looks small and isn't:

> *Previously selected filters should remain applied when navigating back.*

The tempting solution is lifting filters into a context, or into `ProductListingPage`, and restoring them via router state or `sessionStorage`. All of that is code you have to write, and then keep in sync.

Put the filters in the URL and the requirement disappears — the browser restores the URL on Back, and the state comes back with it. Three more things fall out for free: filtered views are shareable, they survive a reload, and there is no second copy of the state to desynchronise.

Two details that matter:

- **`replace: true` on filter changes.** Without it, ticking eight checkboxes pushes eight history entries, and Back from the detail page walks through them one at a time instead of returning to the listing.
- **Defaults are omitted from the query string**, so an unfiltered listing is `/`, not `/?q=&category=&page=1`.

`setFilters(patch)` resets `page` to 1 on any patch that doesn't itself contain `page` — that is the *"pagination should reset when filters change"* rule, implemented once, in the one place every filter change flows through.

---

## Step 5 — Build the primitives bottom-up

`components/ui/` — `Icon`, `Button`, `TextField`, `Checkbox`, `Rating`, `Badge`, `Skeleton`, `StateMessage`. None of them know what a product is; all of them are composed by the domain components above.

Choices worth calling out:

- **`Icon`** inlines nine SVG paths rather than pulling in an icon package. They inherit `currentColor` and size from `font-size`, so they compose with any text or button style. Total cost under a kilobyte.
- **`Checkbox`** keeps the native `<input>` as the real control, visually hidden but focusable, with a styled `<span>` sibling. Keyboard, screen reader and form semantics all keep working — the usual `<div onClick>` checkbox throws all three away.
- **`Rating`** draws five outline stars, then overlays an identical filled row clipped to `value / 5` of the width. So 4.37 renders as 4.37 rather than being rounded to a half-star. One element, no per-star arithmetic.
- **`StateMessage`** is one component for *every* "nothing to show" case: network error, empty filter result, 404, render crash. Keeping them unified means the error state and the empty state cannot drift apart visually as the app grows.
- **`Skeleton`** over a page spinner, because skeletons that mirror the real card's geometry keep the layout stable — nothing jumps when the data lands.

---

## Step 6 — Compose the filter panel

`FilterPanel` composes `CategoryFilter` + `PriceRangeFilter` + `BrandFilter` and **holds no state of its own**. Everything is lifted to the URL, which is what lets the identical component render in the desktop sidebar *and* inside the mobile drawer with no synchronisation between them.

**Category is single-select** because `/products/category/{slug}` accepts exactly one slug; multi-select would mean N parallel requests and a client-side merge, which is a poor trade for a filter people use one at a time. **Brand is multi-select**, which the brief explicitly permits.

**The price input is the one place "update immediately" needed thought.** Committing on every keystroke means typing `150` filters at `1`, then `15`, then `150` — three renders, two of them wrong, and a visibly flickering grid. So the inputs are locally controlled and auto-commit 500 ms after typing stops; the Apply button and the Enter key commit at once. That keeps the requirement satisfied while also giving keyboard and screen-reader users an explicit, discoverable action. Search in the navbar works the same way at 400 ms.

`min > max` is caught, the inputs go red, and the empty state explains the problem instead of just showing zero results.

---

## Step 7 — The two pages

**Listing.** Sticky sidebar on desktop; below 900px it collapses into an overlay drawer with a scrim, Escape-to-close and body scroll-lock. `ActiveFilterChips` summarises everything currently narrowing the results — without it, a filter three scroll-lengths up the sidebar is invisible, and users conclude the catalogue is broken.

**Detail.** Image gallery, price, rating, brand, category, availability, description, reviews. The category renders as a link back to that filtered listing, so it doubles as navigation.

**The Back button** returns to the *exact* listing URL — filters, sort and page included. `ProductCard` hands the current URL forward in router state when it navigates, and the detail page reads it back. On a cold load of `/product/5` (a shared link) there is no router state, so it falls back to `/`.

---

## Step 8 — Handle everything that can go wrong

- `api/client.js` normalises every failure into an `ApiError` with a human-readable message: 404s, non-2xx responses, network failures, and a 12-second timeout.
- `useAsync` aborts in-flight requests on unmount and guards against stale responses — a slow request can never overwrite a newer one. `retry()` re-runs without disturbing any other state.
- `StateMessage` renders the error with a working **Try again** button.
- An `ErrorBoundary` wraps the routes, so a malformed product record produces a recoverable message rather than a blank white page.
- A `*` route catches unknown URLs.

---

## Step 9 — Verify, don't assume

Four checks, in order:

1. **`npm run build`** — 87 modules, no errors.
2. **Called all four endpoints live** and asserted the shapes. This is where the 92-missing-brands and categories-are-objects findings came from.
3. **Server-rendered every route** (`/`, a fully-filtered listing URL, `/product/1`, and a 404) through Vite's SSR pipeline to prove the components mount without throwing. The filtered URL rendered the "Clear all" button, which confirms the URL → filter parsing works end to end.
4. **Served the production build** and requested `/product/1` to confirm the SPA rewrite works and assets resolve.

Two real bugs were caught this way and fixed:

- **`base: './'` in `vite.config.js` breaks deep links.** On `/product/5`, a relative base makes the browser fetch `/product/assets/index.js`, which 404s. Changed to `base: '/'` and committed the SPA rewrite rules (`vercel.json`, `public/_redirects`) that `BrowserRouter` requires.
- **`Pagination`'s responsive rule targeted `.step span`, but the labels were bare text nodes**, so hiding the label text on narrow screens silently did nothing. Wrapped them in `<span>`.

A third was fixed on review: `ImageGallery` reset its selected thumbnail via `useEffect` keyed on `title`, which would fail for two products sharing a title. It's now keyed by product `id` at the call site, so React remounts it and the effect isn't needed at all.

---

## What I'd do next

Ranked by value, and expanded in the README:

1. **Tests.** `useProductList` is a pure pipeline and `useFilters` is a pure URL codec — both are ideal unit-test targets and neither has a test. Then a Playwright run of the round trip: filter → open product → Back → filters still applied.
2. **Focus trap in the mobile drawer.** It handles Escape and scroll-lock; it does not trap focus or restore it on close.
3. **TypeScript.** The API shape is inferred from live responses and enforced nowhere. Types would have caught the missing-`brand` case at compile time rather than at runtime.
4. **Prefetch on card hover**, and pass the known title/price/image through router state so the detail page paints instantly.
