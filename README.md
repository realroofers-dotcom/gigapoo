# gigapoo.com

**Gigapoo is an engine, and this is its own site.** One line on any website puts a gig market on it — verified people offering work, people asking for it, payment and payout handled. Each site brings its own people, pays a yearly fee to run the engine, and keeps a share of the flat fees on every sale, paid each quarter.

Built by Mark Nejmeh. Built 2026-09-18.

## What lives here

- `index.html` — the engine's own site, written for one reader: a website owner.
- `workers/gigapoo/` — the engine itself (the API), once it moves here from `warrantwire.com/workers/nujobi`.
- `gigs.js` — the one-line embed a site pastes in.

## The three numbers

The yearly fee, the two flat per-sale fees and the site's share are read from ONE place — the `FEES` block at the top of the script in `index.html` — and the engine holds the same numbers. They never disagree.

## Cloudflare Pages

Framework preset: None · Build command: blank · Output directory: `/` · Production branch: `main`.

## The first three sites on the engine

Nujobi (nujobi.com) · Warrant Wire (warrantwire.com) · 8K10Q (8k10q.com).