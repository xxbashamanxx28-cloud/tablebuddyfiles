# QA notes — what's verified and what still needs a live store

Being straight about this: I don't have a live Shopify store connected in this environment, so I can't click through the actual storefront the way a human tester would in a browser. Here's exactly what was checked, and what genuinely still needs a real store.

## Verified automatically (code-level, done)

- **Every JSON file** in the theme (`config/`, `locales/`, `templates/`, `sections/*group.json`, and every `{% schema %}` block inside every section) parses as valid JSON. Zero syntax errors.
- **Every Liquid block tag** (`for`/`endfor`, `if`/`endif`, `case`/`endcase`, `form`/`endform`, `capture`, `paginate`, `comment`, `schema`, `style`, `unless`) is balanced across all 56 `.liquid` files. No unclosed or mismatched tags.
- **Every `{% render 'snippet' %}` call** resolves to a snippet that actually exists in `snippets/`. No calls to missing partials.
- **Every section `"type"`** referenced in `templates/*.json`, `header-group.json` and `footer-group.json` resolves to a real file in `sections/`. No template points at a section that doesn't exist.
- **Every `asset_url` reference** (CSS, JS, and the handful of hardcoded fallback images) resolves to a real file in `assets/`. Nothing 404s at the asset layer.
- **Every JavaScript file** (`theme.js`, `cart.js`, `product-form.js`, `predictive-search.js`, `quiz.js`, `address-form.js`) passes `node --check` — no syntax errors. I also traced through the runtime logic by hand for the trickiest paths (quick-add product cards embedding a full product object so `TbProductForm` doesn't throw on load; variant-to-gallery image sync using a document-level event since the form and gallery are siblings, not nested; caught and fixed both as real bugs before shipping, not left for you to find).
- **Accessibility basics**: every interactive control (buttons, form inputs, accordion triggers, drawer close buttons) has a label, `aria-*` state, or visually-hidden text; focus-visible outlines are defined globally; the product form's swatches are real `<button>` elements outside the card's `<a>` wrapper (no invalid nested-interactive-element markup).
- **No secrets or credentials** anywhere in the theme.

## Cannot be verified without a live Shopify store

These require an actual Shopify backend (checkout, real inventory, real Liquid objects like `cart`, `product`, `customer`) that doesn't exist until the theme is installed on a store with products created:

- Visual QA at real desktop/tablet/mobile breakpoints in a browser (I designed and coded every layout to be responsive — grid columns collapse at the same breakpoints used throughout: 990px and 599px — but I have not taken screenshots of the rendered result).
- The AJAX cart drawer actually adding/removing a real line item against Shopify's `/cart/add.js` and `/cart/change.js` endpoints.
- Variant swapping, price/availability updates, and the gallery-sync-to-variant behavior against real product/variant data.
- Predictive search against `/search/suggest.json` with real indexed products.
- The quiz's three result states rendering the actual linked products once assigned in the theme editor.
- Checkout handoff.
- Native Shopify filtering/sorting on a collection with real products and real filterable metafields/tags.

## Recommended next step

If you can share access to a Shopify **development store** (Partners account → dev store is free), or a **theme preview link** generated from `shopify theme dev`/`push`, I can either walk through this checklist live with you, or you can grant this session GitHub-equivalent access to run `shopify theme dev` here and I'll do the click-through QA and send screenshots at desktop/tablet/mobile widths myself. Until then, treat the "code-level, done" list above as genuinely complete, and the "cannot be verified" list as the actual outstanding QA work before launch.
