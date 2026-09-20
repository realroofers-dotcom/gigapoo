# gigapoo.com

**Gigapoo is a gig market, and the engine under it.** gigapoo.com is a real marketplace — verified people offering work, people asking for it, payment and payout handled, nobody anonymous. The same engine runs on any other website that pastes two lines; that site brings its own people, pays a yearly fee, and keeps a share of the flat fees on every sale, paid each quarter.

Built by Mark Nejmeh. Built 2026-09-18; the market home 2026-09-20.

## What lives here

- `index.html` — **the market.** The embed (`gigs.js`, site key `gigapoo`) is the page. The offer to site owners is one quiet link in the header.
- `yoursite.html` — **the page for site owners:** the pitch, the fee share, the rules, the API, the sign-up form, and the click-by-click directions (cPanel first, then WordPress, Wix, Squarespace, Shopify, GitHub, Google Sites) written for someone who has never edited a web page.
- `gigs.js` — the two-line embed. `<script src="https://gigapoo.com/gigs.js" data-site="KEY"></script><div id="gigs"></div>`. A host page's own links can open a door: `href="#sell"` / `#need` / `#wanted`, or `gigapoo.open("sell")`.
- `demo.html` — the embed on a plain page, as a host site sees it.
- `workers/gigapoo/` — the engine (the API at api.gigapoo.com). Deploy with `.\tools\cf.ps1 deploy gigapoo`.

## The numbers

The engine holds the yearly fee, the flat per-sale fees and the site's share (`gp_fees`, read at `api.gigapoo.com/?fees=1`). `index.html` reads them live; `yoursite.html` carries the same numbers in its `FEES` block. When one moves, move the other.

## Cloudflare Pages

Framework preset: None · Build command: blank · Output directory: `/` · Production branch: `main`. Clean URLs: `/yoursite` serves `yoursite.html`.

## The house sites on the engine

Gigapoo (gigapoo.com, key `gigapoo`) · Nujobi (nujobi.com, `nujobi`) · Warrant Wire (warrantwire.com/market, `wire`) · 8K10Q (8k10q.com/market, `k8`).
