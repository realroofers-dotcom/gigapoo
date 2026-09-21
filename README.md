# gigapoo.com

**Gigapoo is a gig market, and the engine under it.** gigapoo.com is a real marketplace — verified people offering work, people asking for it, payment and payout handled, nobody anonymous. The same engine runs on any other website that pastes two lines; that site brings its own people and says what its market is for.

**The terms (20 Sep 2026):** nothing up front. The engine keeps every site's books (`gp_sales`). Every six months (`?action=bill`) it invoices each site 10% of the half-year's sales, or 5% once the half passes $1,000; due in 30 days; an invoice 180 days unpaid switches that site's market off (`gate()`) until `?action=paid`. `?action=books` is the house's view of every site. No yearly fee, no share back.

**Events, jobs, nothing free (20 Sep 2026, gigapoo-1d):** an event and gig marketplace about socialization and community. Events are held by verified sellers with a description, type (searchable), place (geocoded; map + directions), limit, promo picture, and a price of **$5 at least**. Attendees register once with name, telephone (required), email, hometown, present location and a **picture**; they agree to pay; the host sees it all and lets them in, declines, or bars them (days or for good). Approval = a **credit line** (no interest), settled by ACH through **achplug.com**; "you pay Gigapoo, Gigapoo pays the host." Tickets bill at 5%. Credit is for events only — gigs are paid up front by card through **Stripe** (seller absorbs Stripe's fee) and paid out by achpay only (no achpay on file, no payout). Requests can be gigs or jobs (at a rate) and flagged "anyone could do this". Everyone reviews everyone they dealt with: **140 characters**, as written. Members watch an area for new events and gigs (`?action=watch`, `?action=news`, house `?action=digest` — sends when MAIL_URL/MAIL_KEY/MAIL_FROM are set). Two maps with icons: events, and gig workers at ~1 km. Hosts reach guests with `sms:`/`mailto:` lists (`?action=reach`). Phone: 702-544-2002 in every footer.

**Secrets still to set** (with `.\tools\cf.ps1 setvar gigapoo NAME value`): `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET` (webhook URL `https://api.gigapoo.com/?stripe=1`), `MAIL_URL`, `MAIL_KEY`, `MAIL_FROM`.

**Purpose per site:** `gp_sites.purpose / blurb / kinds / min_age / audience`. Warrant Wire and 8K10Q: readers and audio opinions on finance, text/voice/own, 18+. gigapoo.com: youth, seniors, everyone (under 18 with a guardian on file). The embed reads `?site=key` and dresses for it; the engine enforces it. Set with `?action=purpose`.

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
