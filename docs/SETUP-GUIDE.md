# Table Buddy — Shopify Setup Guide

This theme is code-complete and installable, but a Shopify **store** is more than a theme — it needs products, collections, pages, menus and a few settings wired up in the admin. This guide walks through exactly that, in order.

---

## 1. Install the theme

**Option A — ZIP upload (simplest)**
1. In Shopify admin: **Online Store → Themes → Add theme → Upload ZIP**.
2. Upload `table-buddy-theme.zip` from the repo root.
3. Click **Publish** when you're ready to go live (or leave it unpublished and use **Preview** while you finish setup).

**Option B — Shopify CLI (for ongoing development)**
```bash
npm install -g @shopify/cli @shopify/theme
cd theme
shopify theme dev --store=your-store.myshopify.com   # live local preview
shopify theme push --store=your-store.myshopify.com  # push to a theme on the store
```

---

## 2. Theme settings (Online Store → Themes → Customize → Theme settings)

| Setting | What to do |
|---|---|
| **Logo** | Upload the Table Buddy logo. Falls back to a text wordmark if left blank. |
| **Favicon** | Upload a square icon (min 32×32px). |
| **Brand colors** | Navy/Cobalt/Aqua/Sky/White are pre-set. Adjust if your final brand palette differs. |
| **Color schemes** | Six schemes ship pre-configured (Paper, White, Navy, Cobalt, Sky, Aqua) — these drive every section's colors. Edit them here rather than in code. |
| **Typography** | Pick real fonts from Shopify's font picker (Poppins/Inter are the current defaults — swap for licensed brand fonts if you have them). |
| **Product cards** | Toggle star ratings, vendor, quick add, and color swatches. |
| **Cart** | Choose drawer or full page, set the free-shipping threshold (leave blank to hide the progress bar until you confirm real shipping costs). |
| **Social** | Add your real Instagram/Facebook/TikTok/YouTube/Pinterest URLs — footer and mobile menu icons only show if filled in. |
| **Badges** | Bestseller/New/Sale badge text. |

---

## 3. Create the three products

Create these as standard Shopify products (**Products → Add product**):

1. **Table Buddy Regular**
2. **Table Buddy Smart**
3. **Table Buddy Executive**

For each:
- **Template**: leave as default (`product`) — it's already a full landing-page layout.
- **Variants**: add a `Color` option. **Use these exact value names so the built-in color swatches render correctly**: `Natural`, `Mahogany`, `Sky Blue`, `Cobalt`, `Navy`, `Black`, `White`, `Pink`, `Red`, `Aqua`, `Mandala Print`. (Any other value name still works — it just falls back to a plain gray swatch. You can extend the color map in `theme/snippets/swatch.liquid` if you add more finishes.)
- **Images**: upload the real product photography. The optimized source photos are in `/product-photography` in this repo (30 studio + lifestyle shots across Regular, Smart and Executive in every colorway) — upload the ones matching each product's variants.
- **Price / compare-at price**: set real prices — every price shown in the theme (cards, compare table defaults, quiz results) pulls live from these.
- **Description**: written in the product's Description field renders in the "Description" accordion.

**Recommended metafields** (Settings → Custom data → Products → Add definition):
| Namespace.key | Type | Used for |
|---|---|---|
| `custom.bestseller` | Boolean | Shows the "Bestseller" badge on cards and the product page |
| `custom.subtitle` | Single line text | Short tagline under the product title |
| `custom.specifications` | Rich text | Populates the "Specifications" accordion tab |
| `reviews.rating` | Rating | Star rating on cards/product page (standard metafield used by most reviews apps, incl. Shopify's own Product Reviews) |
| `reviews.rating_count` | Integer | Review count shown next to the stars |

If you install a reviews app (Judge.me, Loox, Shopify Product Reviews, etc.), it typically writes to `reviews.rating` / `reviews.rating_count` automatically — no theme changes needed.

---

## 4. Collections

- **All Products**: Shopify's automatic `all` collection — already linked from the nav and `/collections/all`. No setup needed.
- **Bundles**: not a collection in this build — it's the **Bundles** page (see below), since bundle "products" are configured as real Shopify products/discounts, not a product collection. If you'd prefer a real collection of bundle products instead, create one and point the nav link at it.
- Any other collections you want (e.g. "New Arrivals") use `templates/collection.json` automatically — just create the collection and it works.

---

## 5. Pages

Create each page below (**Online Store → Pages → Add page**) and assign the matching **Theme template** in the page's *Theme template* dropdown (right sidebar). Titles can be anything; the template does the layout.

| Page title | Theme template | Notes |
|---|---|---|
| Our Story | `page.our-story` | |
| FAQs | `page.faqs` | |
| Shipping | `page.shipping` | Has placeholder text — see Section 8 |
| Returns | `page.returns` | Has placeholder text |
| Warranty | `page.warranty` | Has placeholder text |
| Contact | `page.contact` | Set your real support email in the section settings |
| Order Tracking | `page.order-tracking` | |
| How to Use | `page.how-to-use` | |
| Dimensions and Fit Guide | `page.dimensions-and-fit-guide` | Has placeholder measurements — see Section 8 |
| Compare Models | `page.compare-models` | |
| Product Finder Quiz | `page.product-finder-quiz` | Assign the 3 products to the quiz result blocks in the theme editor |
| Reviews and Customer Gallery | `page.reviews-and-customer-gallery` | Placeholder reviews — see Section 8 |
| Inspiration and Guides | `page.inspiration-and-guides` | |
| Bundles | `page.bundles` | |
| Build Your Own Bundle | `page.build-your-own-bundle` | Assign the 3 products (and any real accessories) in the theme editor |
| Shop by Use | `page.shop-by-use` | Hub page linking to the 8 pages below |

**Shop by Use sub-pages** (all use template `page.shop-by-use-detail`):
Working from Home · Sofa and Recliner · Bedside · Meals and Snacking · Reading and Studying · Gaming · Crafts and Hobbies · Small-Space Living

Write unique copy for each in the page's Content field (this is what the `main-page` section at the top of that template renders), then pick 1–2 relevant products in the "Recommended for this" section block.

**Legal pages** (Privacy Policy, Terms of Service): don't create these as regular Pages. Go to **Settings → Policies**, fill in the Privacy Policy and Terms of Service text there — Shopify serves them at `/policies/privacy-policy` and `/policies/terms-of-service` automatically using `templates/policy.liquid`, already styled to match the theme.

**404**: automatic — no setup needed (`templates/404.json`).

---

## 6. Navigation menus

**Online Store → Navigation**

**Main menu** (assign as "Main menu" so the header picks it up — the header section setting also lets you point to a different menu by handle):
```
Home            → /
All Products    → /collections/all
Table Buddy Regular / Smart / Executive → individual product pages
Bundles         → /pages/bundles
  └ Build Your Own Bundle → /pages/build-your-own-bundle
Shop by Use     → /pages/shop-by-use
  ├ Working from Home
  ├ Sofa and Recliner
  ├ Bedside
  ├ Meals and Snacking
  ├ Reading and Studying
  ├ Gaming
  ├ Crafts and Hobbies
  └ Small-Space Living
Compare Models  → /pages/compare-models
Product Finder Quiz → /pages/product-finder-quiz
Reviews and Customer Gallery → /pages/reviews-and-customer-gallery
How to Use      → /pages/how-to-use
Our Story       → /pages/our-story
FAQs            → /pages/faqs
```
Any top-level item with sub-links automatically becomes a mega menu dropdown on desktop and an expandable section in the mobile drawer — no extra config needed.

**Footer menus**: create 2–3 short menus (e.g. "Shop", "Help", "Company") and assign them in the footer section's blocks in the theme editor (**Customize → Footer → Link list blocks**).

---

## 7. Homepage & other section content (theme editor)

Go to **Customize** and you'll find the homepage already built with 10 sections in the Meridian-depth order: Hero → Press logos → UGC video row → Featured products → Benefit split → Compare table → Bundle promo → Campaign banner → Reviews → Social gallery (Newsletter + Footer are global, added once via the header/footer groups).

For each section:
- **Hero**: swap the image, adjust headline/CTAs.
- **Press logos**: upload real "as seen in" logos, or leave blank (shows a clearly-labelled placeholder).
- **UGC video row**: upload real customer video clips as you collect them (see Section 8 for AI-generation prompts in the meantime).
- **Featured products**: pick the 3 real products.
- **Compare table**: the price/spec columns are editable text fields per model — fill in real prices, folded size and warranty once confirmed.
- **Bundle promo / Campaign banner**: point at `/pages/bundles` and `/pages/build-your-own-bundle`.
- **Reviews carousel**: replace the placeholder quotes with genuine reviews as they come in (or connect a reviews app — see Section 8).

---

## 8. Bundles & discounts

The brief requires bundle discounts to be configurable through Shopify rather than hardcoded — here's how:
- **Simple bundles** (Work-from-Sofa, Comfort, Couple's): easiest is a **Shopify Bundles** app (native, free) or a manual **Discount** (Settings → Discounts) that applies when the qualifying products are in cart.
- **Build Your Own Bundle**: the page already lets customers pick a table + optional add-ons and adds them to cart together in one action. Any discount for buying multiple items together is applied by a Shopify discount rule you configure — the theme doesn't invent or hardcode a saving.

---

## 9. Testing checklist (do this before publishing)

- [ ] Every header/footer/mega-menu link resolves (no 404s) — check after menus are built.
- [ ] Add to cart works from: product page, quick-add on collection/home cards, and Build Your Own Bundle.
- [ ] Cart drawer opens, quantity +/-, remove, and the free-shipping bar (once threshold is set) all update live.
- [ ] Variant swatches update price, image and availability on each product page.
- [ ] Search returns real results once products exist.
- [ ] Quiz: all 3 result paths (Regular / Smart / Executive) show the correct linked product.
- [ ] Accordions (product page, FAQs) open/close and are keyboard-operable (Tab + Enter).
- [ ] Checkout button reaches Shopify checkout with the correct cart contents.
- [ ] Test on real desktop, tablet and mobile widths (see `docs/QA-NOTES.md`).

See `docs/QA-NOTES.md` for what's been verified automatically (code-level) versus what needs a live store to click-test, and `docs/INFORMATION-NEEDED.md` for every piece of real business information still required before launch.
