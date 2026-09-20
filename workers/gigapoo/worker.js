/* ============================================================================
   GIGAPOO  —  Cloudflare Worker  ·  worker name: gigapoo
   THE GIG ENGINE. One seller register, one verification, one payout path,
   any number of sites. Warrant Wire, 8K10Q and Nujobi are the first three.

   Built 2026-09-20 · gigapoo-1a — carried forward from nujobi-1c (10 Sep)
   with everything he decided between the 15th and the 20th:

   ⚠ NOBODY IS ANONYMOUS, AND THAT NOW MEANS THREE THINGS, NOT TWO.
     A full name of at least two parts. A telephone number. AND A LOCATION —
     city and country at the least. His rule, 20 Sep: "we need their location
     and phone number; we accept nomads but they must have location on."
     A nomad is a seller with no fixed address: allowed, on one condition —
     location sharing is ON and CURRENT. A nomad whose location is more than
     LOCATION_STALE_DAYS old is not shown for in-place work and is marked
     stale on the roster until they check in with ?action=where.
     The location is published as city and country. Never the exact point.

   ⚠ THE SELLER SAYS WHAT THEY CAN DO. There is no list of kinds we wrote.
     An OFFER is a task in the seller's own words, a price, how it is
     delivered, how long it takes, and whether it is remote or in-place. The
     house verifies the PERSON, not the task. The one exception stays:
     anything the seller marks as `advice` needs a credential on file.

   ⚠ REMOTE OR IN-PLACE, TOLD APART ON EVERYTHING. Remote work: a verified
     seller, a buyer with an email. In-place work: BOTH verified by telephone,
     the buyer's address confirmed before the seller sees it, money held
     until the buyer says done, and a meeting record. Craigslist's failure,
     avoided in the schema rather than in a policy page.

   ⚠ SITES ARE TENANTS. A site registers (a person, a telephone, a domain),
     is called, gets a key. Every offer, request and sale carries its site.
     Each site brings its own people: the roster a site shows is the sellers
     who chose that site. A person verified once is verified everywhere, so
     a seller a site recruits who is already here is live the same day.

   ⚠ THE FEES ARE DATA. gp_fees holds the flat buyer fee, the flat seller
     fee by delivery, and THE HOUSE'S TERMS WITH A SITE — read from the
     table, never from a constant, and the same numbers gigapoo.com prints.
     The buyer's and seller's fees are flat, never a percentage of the price.

   ⚠ THE HOUSE IS PAID BY THE SITE, EVERY SIX MONTHS. His rule, 20 Sep:
     "we are paid every 6 months: 5% if greater than $1,000, or 10% if less."
     So: the engine KEEPS EVERY SITE'S BOOKS (gp_sales, one row per sale, on
     every site including ours). At the end of each half-year (Jan–Jun,
     Jul–Dec) ?action=bill writes one invoice per site: the half's gross,
     10% of it — or 5% once the half's gross passes the threshold — due in
     30 days. A site with an invoice unpaid LATE_DAYS (180) after it was
     issued is OFF: its key stops answering and the embed says the market is
     paused, until ?action=paid. No yearly fee, no share back; the site's
     return is its own market. (The old year_cents / site_share_bps columns
     stay in gp_fees at zero so nothing that reads them breaks.)

   ⚠ EACH SITE'S MARKET HAS A PURPOSE. His rule, 20 Sep: Warrant Wire and
     8K10Q want READERS AND AUDIO OPINIONS ON FINANCE, 18 AND OLDER; a
     community site wants opportunities for youth, seniors and everyone.
     gp_sites carries purpose, blurb, kinds (which deliveries the site
     takes), min_age and audience. The embed reads ?site=<key> and dresses
     itself for it; the engine enforces it: a seller under a site's min_age
     is not on that site's roster and cannot offer there; an offer with a
     delivery the site does not take is refused. Sellers give a date of
     birth; a seller under 18 names a parent or guardian with a telephone —
     nobody is anonymous, and a minor's guardian least of all.

   ⚠ NO BANK DETAILS LIVE HERE. `us_bank` records that a seller CAN be paid.
     How is the pay desk's business (Stripe / ACHplug) and lives there.

   ⚠ NOTHING IS DELETED. Ratings publish as written and nobody — not the
     seller, not the house — can take one down. The record is the asset.

   ----------------------------------------------------------------------------
   BINDINGS   OVERHANG   D1 → overhang
              IMG        R2 bucket → gig-workers-photo
   VARIABLES  LOG_KEY    the house key (set with cf.ps1 setvar; never in a file)
              PAY        https://pay.warrantwire.com

   ----------------------------------------------------------------------------
   PUBLIC — no key
     ?sellers=1&site=<key>[&where=remote|in_place]   the roster on a site
     ?offers=1&site=<key>[&where=]                   what is offered
     ?requests=1&site=<key>[&where=]                 what is wanted
     ?seller=<id>                                    one profile, reviews, offers
     ?request=<id>                                   one request and its bids
     ?fees=1                                         the fee table, as printed
     ?site=<key>                                     the site's purpose, kinds,
                                                     min_age — and whether it is paused
     ?action=join        apply to sell   name, email, phone, city, country, born,
                                        [region, lat, lng, nomad=1, location_on=1,
                                         site, about, credential, org,
                                         guardian_name, guardian_phone (under 18)]
     ?action=want        a buyer asks   site, subject, name, email, phone,
                                        where=remote|in_place, [city, country,
                                        budget, note]
     ?action=rate        a buyer rates  seller, ref, name, email, stars, [words]
     ?action=site        a site applies name, email, phone, site (the domain)
     ?photo=<seller id>                              the photograph

   SELLER — needs the token issued at verification
     ?action=offer&token=…   what I can do: title, price, [blurb, delivery,
                             where, days, category, site, advice=1]
     ?action=bid&token=…     answer a request: request, price, [delivery, note]
     ?action=where&token=…   check in: city, country, [region, lat, lng]
     ?action=me&token=…      what is mine
     ?action=photo&token=…   POST the image as the body

   SITE — needs the site key
     ?action=ledger&key=<site key>        the site's sales, this half's bill, its invoices
     ?action=sale&key=…                   record a sale: seller, price, [offer, request,
                                          buyer_email, where, ref]  (the pay desk, or
                                          the site's own checkout; the house key works too)
     ?action=hide&key=…&seller=<id>       keep someone off this site
     ?action=unhide&key=…&seller=<id>

   HOUSE — needs LOG_KEY
     ?action=applications   who has applied to sell
     ?action=verify&id=…    verify one, issue their token
     ?action=refuse&id=…&why=…
     ?action=sites          every site, applied and live
     ?action=verify_site&id=…   issue the site's key
     ?action=purpose&id=…&purpose=&blurb=&kinds=text,voice,own&min_age=18&audience=
                            set a site's purpose
     ?action=books          EVERY SITE'S SALES: all-time, this half, what is due, what is late
     ?action=bill[&half=2026H1]  write the half-year invoices (idempotent)
     ?action=paid&invoice=<id>   mark one paid — a switched-off site comes back at once
     ?action=off&id=… / ?action=on&id=…   switch a site by hand
     ?action=fees&…         change a fee (buyer_cents, seller_text_cents, seller_voice_cents,
                            seller_own_cents, house_small_bps, house_large_bps,
                            house_threshold_cents, late_days)
     ?action=requests       every request
     ?action=stats
   ========================================================================== */

const BUILD = "gigapoo-1c · 2026-09-20 · the engine: every site's books, the half-year bill, purpose and age per site";
const LOCATION_STALE_DAYS = 30;
const DELIVERY = ["text", "voice", "own", "file", "in_person"];
const WHERE = ["remote", "in_place"];

/* the fee defaults — written into gp_fees once, then the table is the truth.
   The same numbers gigapoo.com prints. The house's terms with a site: 10% of
   a half-year's sales, 5% once the half passes $1,000, due 30 days after the
   bill, the market off at 180 days late. */
const FEE_DEFAULTS = { year_cents: 0, buyer_cents: 1000,
  seller_text_cents: 2500, seller_voice_cents: 5000, seller_own_cents: 7500,
  site_share_bps: 0,
  house_small_bps: 1000, house_large_bps: 500, house_threshold_cents: 100000,
  due_days: 30, late_days: 180 };

/* the house's own sites, live from the first request, each with its purpose */
const HOUSE_SITES = [
  { key: "wire",    name: "Warrant Wire", domain: "warrantwire.com", min_age: 18, kinds: "text,voice,own",
    purpose: "Readers and audio opinions on finance", audience: "18 and older",
    blurb: "Named people who read SEC filings and say what they see — in writing, or in their own voice. Opinions, not advice, unless the seller holds a licence on file." },
  { key: "k8",      name: "8K10Q", domain: "8k10q.com", min_age: 18, kinds: "text,voice,own",
    purpose: "Readers and audio opinions on finance", audience: "18 and older",
    blurb: "Named people who read 8-Ks, 10-Qs and 10-Ks and say what changed — in writing, or in their own voice. Opinions, not advice, unless the seller holds a licence on file." },
  { key: "nujobi",  name: "Nujobi", domain: "nujobi.com", min_age: 18, kinds: "text,voice,own,file",
    purpose: "Journalism and reading, sold by named people", audience: "18 and older",
    blurb: "Reporting, reading and research by people whose name, telephone and location are on file." },
  { key: "gigapoo", name: "Gigapoo", domain: "gigapoo.com", min_age: 0, kinds: "",
    purpose: "Opportunities for youth, seniors and everyone", audience: "youth, seniors, everyone",
    blurb: "Any task except illegal or dangerous, remote or in person. Under 18? A parent or guardian goes on file with you." }
];

export default {
  async fetch(req, env) {
    const u = new URL(req.url), q = u.searchParams;
    const H = { "Access-Control-Allow-Origin":"*",
                "Access-Control-Allow-Headers":"X-Auth-Key, Content-Type",
                "Content-Type":"application/json", "Cache-Control":"no-store" };
    if (req.method === "OPTIONS") return new Response(null, { headers: H });

    await setup(env);
    try {
      /* ⚠ THE ACTION IS READ FIRST, ALWAYS, AND EVERY BARE LOOKUP IS GUARDED
         BY IT — the lesson from nujobi-1b, where ?action=bid&request=1 was
         answered by the public request listing. */
      const a = q.get("action") || "";

      /* ⚠ A PAUSED SITE ANSWERS NOTHING BUT "PAUSED". Every public read and
         write that names a site goes through the gate first. */
      if (q.get("site") && ["", "join", "want", "offer"].indexOf(a) > -1) {
        const g = await gate(env, q.get("site"));
        if (g && g.off) return json({ ok:false, build: BUILD, paused:true, site: g.key, error: g.why }, H, 402);
      }

      if (!a) {
        if (q.get("photo"))   return await servePhoto(env, q.get("photo"));
        if (q.get("seller"))  return json(await profile(env, q.get("seller"), u.origin), H);
        if (q.get("request")) return json(await oneRequest(env, q.get("request")), H);
        if (q.get("sellers")) return json(await roster(env, q, u.origin), H);
        if (q.get("offers"))  return json(await offers(env, q, u.origin), H);
        if (q.get("requests")) return json(await wanted(env, q), H);
        if (q.get("fees"))    return json(await feesPublic(env), H);
        if (q.get("site"))    return json(await siteInfo(env, q.get("site")), H);
      }
      if (a === "join")  return json(await join(env, q), H);
      if (a === "want")  return json(await want(env, q), H);
      if (a === "rate")  return json(await rate(env, q), H);
      if (a === "site")  return json(await siteApply(env, q), H);

      /* ---- seller, by token ---- */
      if (["offer", "bid", "where", "me", "photo"].indexOf(a) > -1) {
        const me = await bySeller(env, q.get("token"));
        if (!me) return json({ ok:false, build: BUILD, error:"not a verified seller" }, H, 401);
        if (a === "offer") return json(await offer(env, me, q), H);
        if (a === "bid")   return json(await bid(env, me, q), H);
        if (a === "where") return json(await whereAmI(env, me, q), H);
        if (a === "photo") return json(await putPhoto(env, me, req, u.origin), H);
        return json(await mine(env, me, u.origin), H);
      }

      /* ---- site, by its key (the house key opens any site's desk) ---- */
      if (["ledger", "hide", "unhide", "sale"].indexOf(a) > -1) {
        const k = req.headers.get("X-Auth-Key") || q.get("key");
        const house = !!env.LOG_KEY && k === env.LOG_KEY;
        /* the ledger and a sale still work while a site is off — the books
           must close; only the market stops */
        const site = house ? await siteRow(env, q.get("site")) : await bySite(env, k, true);
        if (!site) return json({ ok:false, build: BUILD, error: house ? "which site? (&site=key)" : "not a live site key" }, H, 401);
        if (a === "ledger") return json(await ledger(env, site), H);
        if (a === "sale")   return json(await sale(env, site, q), H);
        return json(await hideSeller(env, site, q.get("seller"), a === "hide"), H);
      }

      /* ---- the house ---- */
      const key = req.headers.get("X-Auth-Key") || q.get("key");
      if (!key || key !== env.LOG_KEY) return json({ ok:false, error:"unauthorized" }, H, 401);

      if (a === "applications") return json(await applications(env), H);
      if (a === "verify")       return json(await verify(env, q.get("id")), H);
      if (a === "refuse")       return json(await refuse(env, q.get("id"), q.get("why")), H);
      if (a === "sites")        return json(await sites(env), H);
      if (a === "verify_site")  return json(await verifySite(env, q.get("id")), H);
      if (a === "purpose")      return json(await setPurpose(env, q), H);
      if (a === "books")        return json(await books(env), H);
      if (a === "bill")         return json(await bill(env, q.get("half")), H);
      if (a === "paid")         return json(await markPaid(env, q.get("invoice"), q.get("note")), H);
      if (a === "off" || a === "on") return json(await switchSite(env, q.get("id"), a === "off", q.get("why")), H);
      if (a === "fees")         return json(await setFees(env, q), H);
      if (a === "requests")     return json(await allRequests(env), H);
      return json(await stats(env), H);
    } catch (e) {
      return json({ ok:false, build: BUILD, error:String(e) }, H, 500);
    }
  }
};

/* ============================================================
   THE TABLES — gp_*, built on first request. mk_* (nujobi-1c)
   is left where it is; nothing there had sellers yet.
   ============================================================ */
async function setup(env) {
  const D = env.OVERHANG;
  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_sites (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       key TEXT UNIQUE, name TEXT NOT NULL, domain TEXT NOT NULL,
       owner_name TEXT NOT NULL, owner_email TEXT NOT NULL, owner_phone TEXT NOT NULL,
       state TEXT DEFAULT 'applied',            /* applied | live | refused */
       paid_through TEXT,                        /* the yearly fee, when it is paid */
       applied TEXT DEFAULT (datetime('now')), verified TEXT)`).run();

  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_sellers (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL, sort TEXT,
       email TEXT NOT NULL, phone TEXT NOT NULL,
       /* ⚠ THE LOCATION. city + country required; the point is optional and
          never published. nomad=1 means no fixed address; then location_on
          must be 1 and location_at must stay fresh. */
       city TEXT NOT NULL, region TEXT, country TEXT NOT NULL,
       lat REAL, lng REAL,
       nomad INTEGER DEFAULT 0, location_on INTEGER DEFAULT 0,
       location_at TEXT DEFAULT (datetime('now')),
       org TEXT, credential TEXT, about TEXT,
       photo_key TEXT, education TEXT, linkedin TEXT, since_year INTEGER,
       home_site TEXT,                           /* the site they enrolled on */
       us_bank INTEGER DEFAULT 0,
       state TEXT DEFAULT 'applied',            /* applied | verified | refused */
       token TEXT, why TEXT,
       applied TEXT DEFAULT (datetime('now')), verified TEXT)`).run();

  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_offers (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       seller_id INTEGER NOT NULL, site TEXT,
       title TEXT NOT NULL, blurb TEXT, category TEXT,
       cents INTEGER NOT NULL, delivery TEXT, where_ TEXT DEFAULT 'remote',
       days INTEGER, advice INTEGER DEFAULT 0,
       state TEXT DEFAULT 'live',
       made TEXT DEFAULT (datetime('now')))`).run();

  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_requests (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       site TEXT, subject TEXT NOT NULL, note TEXT,
       where_ TEXT DEFAULT 'remote', budget_cents INTEGER,
       buyer_name TEXT NOT NULL, buyer_email TEXT NOT NULL, buyer_phone TEXT,
       city TEXT, country TEXT,
       buyer_verified INTEGER DEFAULT 0,
       state TEXT DEFAULT 'open',
       made TEXT DEFAULT (datetime('now')))`).run();

  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_bids (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       request_id INTEGER NOT NULL, seller_id INTEGER NOT NULL,
       cents INTEGER NOT NULL, delivery TEXT, note TEXT,
       state TEXT DEFAULT 'open',
       made TEXT DEFAULT (datetime('now')))`).run();

  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_ratings (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       seller_id INTEGER NOT NULL, ref TEXT NOT NULL,
       buyer_name TEXT NOT NULL, buyer_email TEXT NOT NULL,
       stars INTEGER NOT NULL, words TEXT,
       made TEXT DEFAULT (datetime('now')),
       UNIQUE (ref, buyer_email))`).run();

  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_hidden (
       site TEXT NOT NULL, seller_id INTEGER NOT NULL,
       made TEXT DEFAULT (datetime('now')),
       PRIMARY KEY (site, seller_id))`).run();

  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_sales (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       site TEXT, seller_id INTEGER, offer_id INTEGER, request_id INTEGER,
       buyer_email TEXT, price_cents INTEGER,
       buyer_fee_cents INTEGER, seller_fee_cents INTEGER, site_share_cents INTEGER,
       where_ TEXT, state TEXT DEFAULT 'paid',   /* paid | held | released | refunded */
       ref TEXT, made TEXT DEFAULT (datetime('now')))`).run();

  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_fees (
       id INTEGER PRIMARY KEY CHECK (id = 1),
       year_cents INTEGER, buyer_cents INTEGER,
       seller_text_cents INTEGER, seller_voice_cents INTEGER, seller_own_cents INTEGER,
       site_share_bps INTEGER, changed TEXT DEFAULT (datetime('now')))`).run();
  await D.prepare(
    `INSERT OR IGNORE INTO gp_fees (id, year_cents, buyer_cents, seller_text_cents,
       seller_voice_cents, seller_own_cents, site_share_bps) VALUES (1,?,?,?,?,?,?)`)
    .bind(FEE_DEFAULTS.year_cents, FEE_DEFAULTS.buyer_cents, FEE_DEFAULTS.seller_text_cents,
          FEE_DEFAULTS.seller_voice_cents, FEE_DEFAULTS.seller_own_cents, FEE_DEFAULTS.site_share_bps).run();

  /* 1c — the columns that arrived with the purpose, the age and the bill.
     ADD COLUMN throws once the column exists; that is the "already done". */
  const add = async (sql) => { try { await D.prepare(sql).run(); } catch (e) {} };
  await add("ALTER TABLE gp_sites ADD COLUMN purpose TEXT");
  await add("ALTER TABLE gp_sites ADD COLUMN blurb TEXT");
  await add("ALTER TABLE gp_sites ADD COLUMN kinds TEXT");            /* 'text,voice,own' — empty = every kind */
  await add("ALTER TABLE gp_sites ADD COLUMN min_age INTEGER DEFAULT 0");
  await add("ALTER TABLE gp_sites ADD COLUMN audience TEXT");
  await add("ALTER TABLE gp_sites ADD COLUMN off_why TEXT");          /* set when switched off by hand */
  await add("ALTER TABLE gp_sellers ADD COLUMN born TEXT");           /* YYYY-MM-DD; never published */
  await add("ALTER TABLE gp_sellers ADD COLUMN guardian_name TEXT");  /* under 18: a parent or guardian on file */
  await add("ALTER TABLE gp_sellers ADD COLUMN guardian_phone TEXT");
  await add("ALTER TABLE gp_fees ADD COLUMN house_small_bps INTEGER DEFAULT 1000");
  await add("ALTER TABLE gp_fees ADD COLUMN house_large_bps INTEGER DEFAULT 500");
  await add("ALTER TABLE gp_fees ADD COLUMN house_threshold_cents INTEGER DEFAULT 100000");
  await add("ALTER TABLE gp_fees ADD COLUMN due_days INTEGER DEFAULT 30");
  await add("ALTER TABLE gp_fees ADD COLUMN late_days INTEGER DEFAULT 180");
  /* the yearly fee and the share back are gone (20 Sep); zero them where they were */
  await D.prepare("UPDATE gp_fees SET year_cents = 0, site_share_bps = 0 WHERE id = 1 AND (year_cents <> 0 OR site_share_bps <> 0)").run();

  /* ⚠ THE INVOICES — one per site per half-year, written by ?action=bill.
     An invoice open past late_days switches the site off. */
  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_invoices (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       site TEXT NOT NULL, half TEXT NOT NULL,          /* '2026H1' */
       period_from TEXT NOT NULL, period_to TEXT NOT NULL,
       sales INTEGER NOT NULL, gross_cents INTEGER NOT NULL,
       rate_bps INTEGER NOT NULL, due_cents INTEGER NOT NULL,
       issued TEXT DEFAULT (datetime('now')), due_by TEXT NOT NULL,
       paid_at TEXT, note TEXT,
       state TEXT DEFAULT 'open',                       /* open | paid | void */
       UNIQUE (site, half))`).run();

  /* the house's own sites exist from the first request, live, with their
     purpose. gigapoo joined 20 Sep — his call: gigapoo.com itself must look
     like a real marketplace, so its home page runs the market under its own
     key. A purpose set by hand (?action=purpose) is not overwritten. */
  for (const s of HOUSE_SITES) {
    await D.prepare(
      `INSERT OR IGNORE INTO gp_sites (key, name, domain, owner_name, owner_email, owner_phone, state, verified)
       VALUES (?,?,?,?,?,?,'live',datetime('now'))`)
      .bind(s.key, s.name, s.domain, "Mark Nejmeh", "realroofers@gmail.com", "732-995-3914").run();
    await D.prepare("UPDATE gp_sites SET purpose=?, blurb=?, kinds=?, min_age=?, audience=? WHERE key=? AND purpose IS NULL")
      .bind(s.purpose, s.blurb, s.kinds, s.min_age, s.audience, s.key).run();
  }
}

/* ============================================================
   THE SITE'S PURPOSE, AND THE GATE
   ============================================================ */
function kindsOf(site) { return String(site && site.kinds || "").split(",").map(s => s.trim()).filter(Boolean); }
function pubSite(s) {
  return { key: s.key, name: s.name, domain: s.domain,
    purpose: s.purpose || null, blurb: s.blurb || null, audience: s.audience || null,
    min_age: Number(s.min_age) || 0, kinds: kindsOf(s).length ? kindsOf(s) : DELIVERY };
}
async function siteRow(env, key) {
  if (!key) return null;
  return await env.OVERHANG.prepare("SELECT * FROM gp_sites WHERE key = ?").bind(key).first();
}
/* is this site switched off — by hand, or by an invoice LATE_DAYS overdue? */
async function gate(env, key) {
  const s = await siteRow(env, key);
  if (!s) return null;                                  /* not a site at all: nothing to gate ("all") */
  if (s.state === "off") return { key, off:true, why: s.off_why || "This market is paused. The site owner should contact Gigapoo." };
  if (s.state !== "live") return { key, off:true, why: "not a live site" };
  const f = await fees(env);
  const late = await env.OVERHANG.prepare(
    `SELECT id, half, due_cents, issued FROM gp_invoices
      WHERE site = ? AND state = 'open' AND issued <= datetime('now', ?) ORDER BY issued LIMIT 1`)
    .bind(key, "-" + (Number(f.late_days) || 180) + " days").first();
  if (late) return { key, off:true, invoice: late.id,
    why: "This market is paused: Gigapoo's bill for " + late.half + " (" + money(late.due_cents) + ", issued " + String(late.issued).slice(0, 10) + ") is more than " + (Number(f.late_days) || 180) + " days unpaid. It comes back the day it is paid." };
  return { key, off:false };
}
async function siteInfo(env, key) {
  const s = await siteRow(env, key);
  if (!s || s.state === "applied" || s.state === "refused") return { ok:false, build: BUILD, error:"not a live site key" };
  const g = await gate(env, key);
  return Object.assign({ ok:true, build: BUILD, paused: !!(g && g.off), why: g && g.off ? g.why : null }, pubSite(s),
    { rule: "Every seller here has a name, a telephone and a location on file, verified by a telephone call" + (Number(s.min_age) >= 18 ? ", and is " + s.min_age + " or older." : ". A seller under 18 has a parent or guardian on file.") });
}
async function setPurpose(env, q) {
  const id = q.get("id"); if (!id) return { ok:false, error:"which site? (&id=)" };
  const s = await env.OVERHANG.prepare("SELECT * FROM gp_sites WHERE id = ?").bind(id).first();
  if (!s) return { ok:false, error:"no such site" };
  const v = (k, cur) => q.get(k) != null ? (clean(q.get(k)) || null) : cur;
  const kinds = q.get("kinds") != null ? clean(q.get("kinds")).toLowerCase().split(",").map(x => x.trim()).filter(x => DELIVERY.indexOf(x) > -1).join(",") : s.kinds;
  const minAge = q.get("min_age") != null ? Math.max(0, Math.min(99, Math.round(Number(q.get("min_age")) || 0))) : s.min_age;
  await env.OVERHANG.prepare("UPDATE gp_sites SET purpose=?, blurb=?, kinds=?, min_age=?, audience=? WHERE id=?")
    .bind(v("purpose", s.purpose), v("blurb", s.blurb), kinds || null, minAge, v("audience", s.audience), id).run();
  return { ok:true, build: BUILD, site: pubSite(await env.OVERHANG.prepare("SELECT * FROM gp_sites WHERE id = ?").bind(id).first()) };
}
async function switchSite(env, id, off, why) {
  if (!id) return { ok:false, error:"which site? (&id=)" };
  const s = await env.OVERHANG.prepare("SELECT * FROM gp_sites WHERE id = ?").bind(id).first();
  if (!s) return { ok:false, error:"no such site" };
  if (off) await env.OVERHANG.prepare("UPDATE gp_sites SET state='off', off_why=? WHERE id=?").bind(clean(why) || null, id).run();
  else await env.OVERHANG.prepare("UPDATE gp_sites SET state='live', off_why=NULL WHERE id=? AND state='off'").bind(id).run();
  return { ok:true, build: BUILD, id: Number(id), key: s.key, state: off ? "off" : "live" };
}

/* the age gate: born is YYYY-MM-DD, never published */
function ageOf(born) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(born || "")); if (!m) return null;
  const b = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); if (isNaN(b)) return null;
  const n = new Date(); let a = n.getUTCFullYear() - b.getUTCFullYear();
  if (n.getUTCMonth() < b.getUTCMonth() || (n.getUTCMonth() === b.getUTCMonth() && n.getUTCDate() < b.getUTCDate())) a--;
  return a;
}
/* the latest birth date that is old enough for a site: sellers born on or before it qualify */
function bornBy(minAge) {
  const n = new Date(); const d = new Date(Date.UTC(n.getUTCFullYear() - (Number(minAge) || 0), n.getUTCMonth(), n.getUTCDate()));
  return d.toISOString().slice(0, 10);
}

async function fees(env) {
  return (await env.OVERHANG.prepare("SELECT * FROM gp_fees WHERE id = 1").first()) || FEE_DEFAULTS;
}
function sellerFee(f, delivery) {
  return delivery === "own" ? f.seller_own_cents : delivery === "voice" ? f.seller_voice_cents : f.seller_text_cents;
}
/* the house's rate on a half-year's gross: small below the threshold, large above */
function houseRate(f, grossCents) { return grossCents > Number(f.house_threshold_cents) ? Number(f.house_large_bps) : Number(f.house_small_bps); }
function pct(bps) { return (bps / 100).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "%"; }
async function feesPublic(env) {
  const f = await fees(env);
  return { ok:true, build: BUILD,
    on_every_sale: { from_the_buyer: money(f.buyer_cents),
      from_the_seller: { written: money(f.seller_text_cents), with_a_machine_voice: money(f.seller_voice_cents), with_the_sellers_own_voice: money(f.seller_own_cents) } },
    the_site_pays_gigapoo: { every: "6 months",
      rate_when_the_half_is_over: money(f.house_threshold_cents), then: pct(f.house_large_bps),
      rate_otherwise: pct(f.house_small_bps),
      due_days_after_the_bill: Number(f.due_days), the_market_is_off_after_days_late: Number(f.late_days),
      says: "Every six months Gigapoo bills the site " + pct(f.house_small_bps) + " of that half-year's sales, or " + pct(f.house_large_bps) + " once the half's sales pass " + money(f.house_threshold_cents) + ". Due in " + Number(f.due_days) + " days. " + Number(f.late_days) + " days late, the market on that site is switched off until it is paid." },
    rule: "The buyer's and the seller's fees are flat, never a percentage of the seller's price. The site's fee to Gigapoo is a percentage of the site's own sales, every six months." };
}
async function setFees(env, q) {
  const f = await fees(env);
  const n = k => q.get(k) != null ? Math.max(0, Math.round(Number(q.get(k)))) : f[k];
  await env.OVERHANG.prepare(
    `UPDATE gp_fees SET buyer_cents=?, seller_text_cents=?, seller_voice_cents=?, seller_own_cents=?,
       house_small_bps=?, house_large_bps=?, house_threshold_cents=?, due_days=?, late_days=?, changed=datetime('now') WHERE id=1`)
    .bind(n("buyer_cents"), n("seller_text_cents"), n("seller_voice_cents"), n("seller_own_cents"),
          n("house_small_bps"), n("house_large_bps"), n("house_threshold_cents"), n("due_days"), n("late_days")).run();
  return { ok:true, build: BUILD, fees: await fees(env) };
}

/* ============================================================
   A SITE APPLIES — the form on gigapoo.com. Called before a key.
   ============================================================ */
async function siteApply(env, q) {
  const name = clean(q.get("name")), email = clean(q.get("email")).toLowerCase(), phone = clean(q.get("phone"));
  let domain = clean(q.get("site")).toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  const missing = [];
  if (!name || name.split(/\s+/).length < 2) missing.push("a full name, first and last");
  if (!email || email.indexOf("@") < 1) missing.push("an email address");
  if (!phone || phone.replace(/\D/g, "").length < 10) missing.push("a telephone number with an area code — we call before a key is issued");
  if (!domain || domain.indexOf(".") < 1) missing.push("the site's address");
  if (missing.length) return { ok:false, build: BUILD, error:"incomplete", missing };
  const had = await env.OVERHANG.prepare("SELECT id, state FROM gp_sites WHERE domain = ?").bind(domain).first();
  if (had) return { ok:true, build: BUILD, already:true, id: had.id, state: had.state, note:"That site has already applied." };
  /* the site says what its market is for and who it is for; the desk can refine it */
  const purpose = shorten(q.get("purpose"), 120) || null;
  const adults = pick(q.get("audience"), ["adults", "everyone"]) || "everyone";
  const r = await env.OVERHANG.prepare(
    "INSERT INTO gp_sites (name, domain, owner_name, owner_email, owner_phone, purpose, min_age, audience) VALUES (?,?,?,?,?,?,?,?)")
    .bind(domain, domain, name, email, phone, purpose, adults === "adults" ? 18 : 0, adults === "adults" ? "18 and older" : "youth, seniors, everyone").run();
  return { ok:true, build: BUILD, id: lastId(r), state:"applied",
    note:"Received. A person telephones every site owner before a key is issued." };
}
async function sites(env) {
  const r = await env.OVERHANG.prepare(
    `SELECT s.*, (SELECT COUNT(*) FROM gp_offers o WHERE o.site = s.key AND o.state='live') offers,
            (SELECT COUNT(*) FROM gp_sales x WHERE x.site = s.key) sales
       FROM gp_sites s ORDER BY s.state, s.applied`).all();
  return { ok:true, build: BUILD, rows: r.results || [] };
}
async function verifySite(env, id) {
  const s = await env.OVERHANG.prepare("SELECT * FROM gp_sites WHERE id = ?").bind(id).first();
  if (!s) return { ok:false, error:"no such site" };
  if (s.key && s.state === "live") return { ok:true, build: BUILD, already:true, key: s.key };
  const key = (s.domain.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) + "-" + makeToken().slice(0, 8)).toLowerCase();
  await env.OVERHANG.prepare("UPDATE gp_sites SET key=?, state='live', verified=datetime('now') WHERE id=?").bind(key, id).run();
  return { ok:true, build: BUILD, id, key, install: `<script src="https://gigapoo.com/gigs.js" data-site="${key}"></script>\n<div id="gigs"></div>`,
    note:"Send the key to the site owner with the two install lines, and set the site's purpose with ?action=purpose. They are billed every six months on their sales." };
}
/* a live site by key. With `books` the site answers even while switched off
   — its ledger and its sales still close; only the market stops. */
async function bySite(env, key, books) {
  if (!key) return null;
  const s = await env.OVERHANG.prepare("SELECT * FROM gp_sites WHERE key = ? AND state IN ('live','off')").bind(key).first();
  if (!s) return null;
  if (books) return s;
  const g = await gate(env, key);
  return g && g.off ? null : s;
}

/* ============================================================
   APPLYING TO SELL — refused if anything is missing, and the
   location is on the list of things that can be missing.
   ============================================================ */
async function join(env, q) {
  const name  = clean(q.get("name"));
  const email = clean(q.get("email")).toLowerCase();
  const phone = clean(q.get("phone"));
  const city  = clean(q.get("city")), country = clean(q.get("country")), region = clean(q.get("region"));
  const nomad = yes(q.get("nomad")), locOn = yes(q.get("location_on"));
  const lat = num(q.get("lat")), lng = num(q.get("lng"));
  const born = clean(q.get("born")), age = ageOf(born);
  const gName = clean(q.get("guardian_name")), gPhone = clean(q.get("guardian_phone"));
  const site = clean(q.get("site")) || null;
  const siteRow_ = site ? await siteRow(env, site) : null;
  const minAge = siteRow_ ? (Number(siteRow_.min_age) || 0) : 0;

  const missing = [];
  if (!name || name.split(/\s+/).length < 2) missing.push("a full name, first and last");
  if (!email || email.indexOf("@") < 1) missing.push("an email address");
  if (!phone || phone.replace(/\D/g, "").length < 7) missing.push("a telephone number");
  if (!city || !country) missing.push("where you are — city and country");
  /* ⚠ THE NOMAD RULE. No fixed address is fine. No location is not. */
  if (nomad && !locOn) missing.push("location sharing ON — a seller with no fixed address must keep their location current");
  if (nomad && (lat == null || lng == null)) missing.push("your current position (let the page use your location)");
  /* ⚠ THE AGE. A date of birth, always. The site's floor, if it has one.
     Under 18: a parent or guardian on file, with a telephone we call too. */
  if (age == null) missing.push("your date of birth (YYYY-MM-DD) — never published");
  else if (age < 13) missing.push("a seller here is at least 13");
  else if (age < minAge) return { ok:false, build: BUILD, error:"too young for this site", age_required: minAge,
      note: (siteRow_.name || site) + " is for sellers " + minAge + " and older. Other sites on Gigapoo take younger sellers with a parent or guardian on file." };
  else if (age < 18) {
    if (!gName || gName.split(/\s+/).length < 2) missing.push("a parent or guardian's full name — you are under 18");
    if (!gPhone || gPhone.replace(/\D/g, "").length < 7) missing.push("the parent or guardian's telephone — we call them too");
  }

  if (missing.length)
    return { ok:false, build: BUILD, error:"application incomplete", missing,
      note:"Nobody sells here anonymously. A real name, a real telephone, a date of birth, and where you are — " +
           "city and country. No fixed address is fine; then location sharing stays on." };

  const had = await env.OVERHANG.prepare("SELECT id, state FROM gp_sellers WHERE email = ?").bind(email).first();
  if (had) return { ok:true, build: BUILD, already:true, id: had.id, state: had.state,
    note:"That address has already applied. Nothing was changed." };

  const r = await env.OVERHANG.prepare(
    `INSERT INTO gp_sellers (name, sort, email, phone, city, region, country, lat, lng, nomad, location_on,
       org, credential, about, education, linkedin, since_year, home_site, us_bank, born, guardian_name, guardian_phone)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(name, surnameOf(name), email, phone, city, region || null, country, lat, lng, nomad ? 1 : 0, locOn ? 1 : 0,
          clean(q.get("org")) || null, clean(q.get("credential")) || null, shorten(q.get("about"), 320) || null,
          shorten(q.get("education"), 160) || null, url(q.get("linkedin"), "linkedin.com"), year(q.get("since")),
          site, yes(q.get("bank")) ? 1 : 0, born, age < 18 ? gName : null, age < 18 ? gPhone : null).run();

  return { ok:true, build: BUILD, id: lastId(r), state:"applied",
    note:"Applied. A person telephones you before anything you write is published. " +
         "Until then the roster does not carry your name." };
}

async function applications(env) {
  const r = await env.OVERHANG.prepare(
    `SELECT id, name, email, phone, city, region, country, nomad, location_on, org, credential,
            home_site, us_bank, born, guardian_name, guardian_phone, state, applied FROM gp_sellers WHERE state = 'applied' ORDER BY applied`).all();
  return { ok:true, build: BUILD, rows: (r.results || []).map(x => Object.assign({ age: ageOf(x.born) }, x)) };
}
async function verify(env, id) {
  if (!id) return { ok:false, error:"which application?" };
  const s = await env.OVERHANG.prepare("SELECT * FROM gp_sellers WHERE id = ?").bind(id).first();
  if (!s) return { ok:false, error:"no such application" };
  if (s.token) return { ok:true, build: BUILD, already:true, id: s.id, name: s.name, token: s.token };
  const token = makeToken();
  await env.OVERHANG.prepare("UPDATE gp_sellers SET state='verified', token=?, verified=datetime('now') WHERE id=?").bind(token, id).run();
  return { ok:true, build: BUILD, id: s.id, name: s.name, token,
    note:"Send this token to the seller. It is how they offer, bid and check in. Not a password, not recoverable — reissue by refusing and verifying again." };
}
async function refuse(env, id, why) {
  if (!id) return { ok:false, error:"which application?" };
  await env.OVERHANG.prepare("UPDATE gp_sellers SET state='refused', token=NULL, why=? WHERE id=?").bind(clean(why) || null, id).run();
  return { ok:true, build: BUILD, id, state:"refused" };
}
async function bySeller(env, token) {
  if (!token || String(token).length < 12) return null;
  return await env.OVERHANG.prepare("SELECT * FROM gp_sellers WHERE token = ? AND state = 'verified'").bind(token).first();
}

/* the nomad checks in; anybody may correct their city */
async function whereAmI(env, me, q) {
  const city = clean(q.get("city")) || me.city, country = clean(q.get("country")) || me.country;
  const region = clean(q.get("region")) || me.region;
  const lat = num(q.get("lat")), lng = num(q.get("lng"));
  if (me.nomad && (lat == null || lng == null)) return { ok:false, error:"a nomad's check-in carries the position — let the page use your location" };
  await env.OVERHANG.prepare(
    `UPDATE gp_sellers SET city=?, region=?, country=?, lat=COALESCE(?, lat), lng=COALESCE(?, lng),
       location_on=1, location_at=datetime('now') WHERE id=?`)
    .bind(city, region || null, country, lat, lng, me.id).run();
  return { ok:true, build: BUILD, where: city + ", " + country, checked_in: new Date().toISOString(), fresh_for_days: LOCATION_STALE_DAYS };
}

/* ⚠ ONE PUBLIC SHAPE FOR A SELLER. Email and telephone are not in it, and
   neither is the exact position. City and country are; the freshness of the
   location is, because a buyer of in-place work is entitled to know. */
function locationState(x) {
  const at = Date.parse(String(x.location_at || "").replace(" ", "T") + "Z");
  const days = isNaN(at) ? null : Math.floor((Date.now() - at) / 86400000);
  const stale = x.nomad ? (days == null || days > LOCATION_STALE_DAYS) : false;
  return { city: x.city, region: x.region || null, country: x.country,
    nomad: !!x.nomad, location_on: !!x.location_on, checked_in_days_ago: days, stale,
    says: x.nomad ? (stale ? "No fixed address; location not confirmed in the last " + LOCATION_STALE_DAYS + " days — not shown for in-place work." : "No fixed address; location confirmed " + (days === 0 ? "today" : days + " days ago") + ".") : "Based in " + x.city + ", " + x.country + "." };
}
function pubSeller(x, origin) {
  const reviews = Number(x.reviews) || 0;
  return {
    id: x.id, name: x.name, org: x.org || null, credential: x.credential || null,
    photo: x.photo_key ? ((origin || "") + "/?photo=" + x.id) : null,
    about: x.about || null, education: x.education || null, linkedin: x.linkedin || null,
    since: x.since_year || null,
    location: locationState(x),
    verified: { name: true, phone: !!x.phone, location: !!(x.city && x.country), by_call: !!x.verified, on: x.verified || null },
    reviews, stars: reviews ? Number(x.stars) : null
  };
}

/* the roster on a site: verified, not hidden there, and — for in-place —
   with a location that is current */
async function roster(env, q, origin) {
  const site = clean(q.get("site")) || null, where = pick(q.get("where"), WHERE);
  let sql = `SELECT s.*, (SELECT COUNT(*) FROM gp_ratings g WHERE g.seller_id = s.id) reviews,
                    (SELECT ROUND(AVG(stars),1) FROM gp_ratings g WHERE g.seller_id = s.id) stars,
                    (SELECT COUNT(*) FROM gp_offers o WHERE o.seller_id = s.id AND o.state='live' ${site ? "AND (o.site = ?1 OR o.site IS NULL)" : ""}) offers
               FROM gp_sellers s WHERE s.state = 'verified'`;
  const binds = [];
  if (site) { binds.push(site); sql += ` AND s.id NOT IN (SELECT seller_id FROM gp_hidden WHERE site = ?1)
                 AND (s.home_site = ?1 OR s.id IN (SELECT seller_id FROM gp_offers WHERE site = ?1 AND state='live'))`;
    /* the site's age floor: a seller too young for this site is not on its roster */
    const sr = await siteRow(env, site);
    if (sr && Number(sr.min_age) > 0) { binds.push(bornBy(sr.min_age)); sql += " AND s.born IS NOT NULL AND s.born <= ?2"; }
  }
  sql += " ORDER BY s.sort, s.name";   /* surname order — no ranking the house controls */
  const st = env.OVERHANG.prepare(sql);
  const r = await (binds.length ? st.bind(...binds) : st).all();
  let out = (r.results || []).map(x => Object.assign(pubSeller(x, origin), { offers: Number(x.offers) || 0 }));
  if (where === "in_place") out = out.filter(s => !s.location.stale);
  return { ok:true, build: BUILD, site: site || "all", where: where || "all", sellers: out,
    rule: "Every name here is a real person: name, telephone and location on file, verified by a telephone call. The telephone and the exact position are never published." };
}

async function profile(env, id, origin) {
  const x = await env.OVERHANG.prepare(
    `SELECT s.*, (SELECT COUNT(*) FROM gp_ratings g WHERE g.seller_id = s.id) reviews,
            (SELECT ROUND(AVG(stars),1) FROM gp_ratings g WHERE g.seller_id = s.id) stars
       FROM gp_sellers s WHERE s.id = ? AND s.state = 'verified'`).bind(id).first();
  if (!x) return { ok:false, error:"no such seller" };
  const r = await env.OVERHANG.prepare("SELECT stars, words, buyer_name, made FROM gp_ratings WHERE seller_id = ? ORDER BY made DESC LIMIT 50").bind(id).all();
  const o = await env.OVERHANG.prepare("SELECT * FROM gp_offers WHERE seller_id = ? AND state = 'live' ORDER BY made DESC LIMIT 50").bind(id).all();
  const f = await fees(env);
  return { ok:true, build: BUILD, seller: pubSeller(x, origin),
    reviews: (r.results || []).map(v => ({ stars: v.stars, said: v.words, by: v.buyer_name, on: v.made })),
    offers: (o.results || []).map(v => pubOffer(v, f)) };
}

/* ============================================================
   WHAT I CAN DO — the seller's offer, in their words
   ============================================================ */
function pubOffer(v, f, seller) {
  const o = { id: v.id, site: v.site || null, title: v.title, blurb: v.blurb || null, category: v.category || null,
    price: money(v.cents), buyer_pays: money(v.cents + f.buyer_cents),
    delivery: v.delivery || "text", where: v.where_ || "remote", days: v.days || null,
    advice: !!v.advice, made: v.made };
  if (seller) o.by = seller;
  return o;
}
async function offer(env, me, q) {
  const title = clean(q.get("title")), amount = cents(q.get("price"));
  if (!title || title.length < 6) return { ok:false, error:"say what you can do, in a sentence" };
  if (!amount) return { ok:false, error:"what does it cost?" };
  const delivery = pick(q.get("delivery"), DELIVERY) || "text";
  const where = pick(q.get("where"), WHERE) || (delivery === "in_person" ? "in_place" : "remote");
  const advice = yes(q.get("advice"));
  /* ⚠ THE ONE GATE ON THE TASK: advice needs a credential on file */
  if (advice && !me.credential) return { ok:false, error:"an offer marked as advice needs a licence or credential on your profile — everything else is an opinion, and is labelled so" };
  /* a nomad with a stale location cannot offer in-place work until they check in */
  if (where === "in_place" && locationState(me).stale) return { ok:false, error:"your location is not current — check in (?action=where) before offering in-place work" };
  const site = clean(q.get("site")) || me.home_site || null;
  const sr = site ? await bySite(env, site) : null;
  if (site && !sr) return { ok:false, error:"no such site, or that site's market is paused" };
  /* ⚠ THE SITE'S PURPOSE, ENFORCED: its age floor and the kinds of work it takes */
  if (sr && Number(sr.min_age) > 0) {
    const age = ageOf(me.born);
    if (age == null || age < Number(sr.min_age)) return { ok:false, error: sr.name + " is for sellers " + sr.min_age + " and older" + (age == null ? " — your date of birth is not on file; ask the desk" : "") };
  }
  if (sr && kindsOf(sr).length && kindsOf(sr).indexOf(delivery) < 0)
    return { ok:false, error: sr.name + " takes " + kindsOf(sr).map(sayKind).join(", ") + " — not " + sayKind(delivery), kinds: kindsOf(sr) };
  const ins = await env.OVERHANG.prepare(
    `INSERT INTO gp_offers (seller_id, site, title, blurb, category, cents, delivery, where_, days, advice)
     VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .bind(me.id, site, shorten(title, 120), shorten(q.get("blurb"), 600) || null, shorten(q.get("category"), 40) || null,
          amount, delivery, where, num(q.get("days")) == null ? null : Math.round(num(q.get("days"))), advice ? 1 : 0).run();
  const f = await fees(env);
  return { ok:true, build: BUILD, id: lastId(ins), price: money(amount), where, delivery,
    fee: money(sellerFee(f, delivery)), you_keep: money(amount - sellerFee(f, delivery)),
    buyer_pays: money(amount + f.buyer_cents),
    note:"Live. Your name, city and country show beside it; your telephone does not." };
}
async function offers(env, q, origin) {
  const site = clean(q.get("site")) || null, where = pick(q.get("where"), WHERE);
  let sql = `SELECT o.*, s.name, s.city, s.country, s.nomad, s.location_on, s.location_at, s.credential, s.photo_key, s.id AS sid,
                    (SELECT COUNT(*) FROM gp_ratings g WHERE g.seller_id = s.id) reviews,
                    (SELECT ROUND(AVG(stars),1) FROM gp_ratings g WHERE g.seller_id = s.id) stars
               FROM gp_offers o JOIN gp_sellers s ON s.id = o.seller_id
              WHERE o.state = 'live' AND s.state = 'verified'`;
  const binds = [];
  if (site) { sql += " AND (o.site = ? OR o.site IS NULL) AND s.id NOT IN (SELECT seller_id FROM gp_hidden WHERE site = ?)"; binds.push(site, site);
    const sr = await siteRow(env, site);
    if (sr && Number(sr.min_age) > 0) { sql += " AND s.born IS NOT NULL AND s.born <= ?"; binds.push(bornBy(sr.min_age)); }
    if (sr && kindsOf(sr).length) { sql += " AND o.delivery IN (" + kindsOf(sr).map(() => "?").join(",") + ")"; binds.push(...kindsOf(sr)); }
  }
  if (where) { sql += " AND o.where_ = ?"; binds.push(where); }
  sql += " ORDER BY o.made DESC LIMIT 200";
  const st = env.OVERHANG.prepare(sql);
  const r = await (binds.length ? st.bind(...binds) : st).all();
  const f = await fees(env);
  const out = (r.results || []).map(x => {
    const loc = locationState(x);
    return pubOffer(x, f, { id: x.sid, name: x.name, credential: x.credential || null, photo: x.photo_key ? ((origin || "") + "/?photo=" + x.sid) : null,
      city: x.city, country: x.country, location: loc, reviews: Number(x.reviews) || 0, stars: (Number(x.reviews) || 0) ? Number(x.stars) : null });
  }).filter(o => !(o.where === "in_place" && o.by.location.stale));
  return { ok:true, build: BUILD, site: site || "all", where: where || "all", offers: out };
}

/* ============================================================
   A BUYER WANTS SOMETHING. Remote: name and email. In-place:
   telephone and city too, and a person calls before the address
   crosses to a seller.
   ============================================================ */
async function want(env, q) {
  const subject = clean(q.get("subject")), name = clean(q.get("name")), email = clean(q.get("email")).toLowerCase();
  const phone = clean(q.get("phone")), where = pick(q.get("where"), WHERE) || "remote";
  const city = clean(q.get("city")), country = clean(q.get("country"));
  const missing = [];
  if (!subject || subject.length < 6) missing.push("what you need, in a sentence");
  if (!name || name.split(/\s+/).length < 2) missing.push("your full name — nobody here is anonymous, buyers included");
  if (!email || email.indexOf("@") < 1) missing.push("an email address, so the bids can reach you");
  if (where === "in_place") {
    if (!phone || phone.replace(/\D/g, "").length < 7) missing.push("a telephone number — in-place work means a person calls you first");
    if (!city || !country) missing.push("the city and country where the work is");
  }
  const site = clean(q.get("site")) || "wire";
  /* an 18+ site takes the buyer's word for their age, on the record */
  const sr = await siteRow(env, site);
  if (sr && Number(sr.min_age) >= 18 && !yes(q.get("adult"))) missing.push("confirmation that you are " + sr.min_age + " or older — " + sr.name + " is for adults");
  if (missing.length) return { ok:false, build: BUILD, error:"incomplete", missing };
  const r = await env.OVERHANG.prepare(
    `INSERT INTO gp_requests (site, subject, note, where_, budget_cents, buyer_name, buyer_email, buyer_phone, city, country)
     VALUES (?,?,?,?,?,?,?,?,?,?)`)
    .bind(site, shorten(subject, 160), shorten(q.get("note"), 600) || null, where, cents(q.get("budget")) || null,
          name, email, phone || null, city || null, country || null).run();
  return { ok:true, build: BUILD, id: lastId(r), where,
    note: where === "in_place"
      ? "Open for bids. A person will telephone you before any seller sees where the work is. Money is held until you say the job is done."
      : "Open for bids. Nothing is owed and no bid has to be taken." };
}
async function wanted(env, q) {
  const site = clean(q.get("site")) || null, where = pick(q.get("where"), WHERE);
  let sql = `SELECT r.id, r.site, r.subject, r.note, r.where_, r.budget_cents, r.city, r.country, r.buyer_name, r.buyer_verified, r.made,
                    (SELECT COUNT(*) FROM gp_bids b WHERE b.request_id = r.id AND b.state='open') bids
               FROM gp_requests r WHERE r.state = 'open'`;
  const binds = [];
  if (site) { sql += " AND r.site = ?"; binds.push(site); }
  if (where) { sql += " AND r.where_ = ?"; binds.push(where); }
  sql += " ORDER BY r.made DESC LIMIT 200";
  const st = env.OVERHANG.prepare(sql);
  const r = await (binds.length ? st.bind(...binds) : st).all();
  /* ⚠ PUBLIC: the buyer's first name and city, never the email, the phone or the address */
  return { ok:true, build: BUILD, site: site || "all", where: where || "all",
    requests: (r.results || []).map(x => ({ id: x.id, site: x.site, subject: x.subject, note: x.note, where: x.where_,
      budget: x.budget_cents ? money(x.budget_cents) : null,
      near: x.where_ === "in_place" && x.city ? x.city + ", " + x.country : null,
      by: String(x.buyer_name || "").split(/\s+/)[0], buyer_verified: !!x.buyer_verified, bids: Number(x.bids) || 0, made: x.made })) };
}
async function oneRequest(env, id) {
  const x = await env.OVERHANG.prepare("SELECT id, site, subject, note, where_, budget_cents, city, country, buyer_name, buyer_verified, state, made FROM gp_requests WHERE id=?").bind(id).first();
  if (!x) return { ok:false, error:"no such request" };
  const b = await env.OVERHANG.prepare(
    `SELECT b.id, b.cents, b.delivery, b.note, b.made, s.id sid, s.name, s.city, s.country, s.credential
       FROM gp_bids b JOIN gp_sellers s ON s.id = b.seller_id WHERE b.request_id = ? AND b.state = 'open' ORDER BY b.cents`).bind(id).all();
  return { ok:true, build: BUILD,
    request: { id: x.id, site: x.site, subject: x.subject, note: x.note, where: x.where_, budget: x.budget_cents ? money(x.budget_cents) : null,
      near: x.where_ === "in_place" && x.city ? x.city + ", " + x.country : null, by: String(x.buyer_name || "").split(/\s+/)[0], state: x.state, made: x.made },
    bids: (b.results || []).map(v => ({ id: v.id, by: { id: v.sid, name: v.name, city: v.city, country: v.country, credential: v.credential || null },
      price: money(v.cents), delivery: v.delivery, note: v.note, made: v.made })) };
}
async function allRequests(env) {
  const r = await env.OVERHANG.prepare(`SELECT r.*, (SELECT COUNT(*) FROM gp_bids b WHERE b.request_id = r.id) bids FROM gp_requests r ORDER BY r.made DESC LIMIT 200`).all();
  return { ok:true, build: BUILD, rows: r.results || [] };
}
async function bid(env, me, q) {
  const rid = q.get("request"), amount = cents(q.get("price"));
  if (!rid) return { ok:false, error:"which request?" };
  if (!amount) return { ok:false, error:"what do you charge for it?" };
  const r = await env.OVERHANG.prepare("SELECT id, where_, state FROM gp_requests WHERE id = ?").bind(rid).first();
  if (!r) return { ok:false, error:"no such request" };
  if (r.state !== "open") return { ok:false, error:"that request is closed" };
  if (r.where_ === "in_place" && locationState(me).stale) return { ok:false, error:"your location is not current — check in before bidding on in-place work" };
  const delivery = pick(q.get("delivery"), DELIVERY) || (r.where_ === "in_place" ? "in_person" : "text");
  const f = await fees(env);
  const had = await env.OVERHANG.prepare("SELECT id FROM gp_bids WHERE request_id=? AND seller_id=? AND state='open'").bind(rid, me.id).first();
  if (had) {
    await env.OVERHANG.prepare("UPDATE gp_bids SET cents=?, delivery=?, note=?, made=datetime('now') WHERE id=?").bind(amount, delivery, shorten(q.get("note"), 400) || null, had.id).run();
    return { ok:true, build: BUILD, id: had.id, replaced:true, price: money(amount), you_keep: money(amount - sellerFee(f, delivery)) };
  }
  const ins = await env.OVERHANG.prepare("INSERT INTO gp_bids (request_id, seller_id, cents, delivery, note) VALUES (?,?,?,?,?)").bind(rid, me.id, amount, delivery, shorten(q.get("note"), 400) || null).run();
  return { ok:true, build: BUILD, id: lastId(ins), price: money(amount), fee: money(sellerFee(f, delivery)), you_keep: money(amount - sellerFee(f, delivery)) };
}
async function mine(env, me, origin) {
  const o = await env.OVERHANG.prepare("SELECT * FROM gp_offers WHERE seller_id = ? ORDER BY made DESC LIMIT 50").bind(me.id).all();
  const b = await env.OVERHANG.prepare(`SELECT b.id, b.cents, b.state, b.made, r.subject, r.where_ FROM gp_bids b JOIN gp_requests r ON r.id = b.request_id WHERE b.seller_id = ? ORDER BY b.made DESC LIMIT 50`).bind(me.id).all();
  const s = await env.OVERHANG.prepare("SELECT COUNT(*) n, SUM(price_cents - seller_fee_cents) earned FROM gp_sales WHERE seller_id = ? AND state IN ('released')").bind(me.id).first();
  const f = await fees(env);
  return { ok:true, build: BUILD, you: pubSeller(Object.assign({}, me, { reviews: 0 }), origin),
    offers: (o.results || []).map(v => pubOffer(v, f)), bids: b.results || [],
    sales: { released: Number(s && s.n) || 0, earned: money(Number(s && s.earned) || 0) } };
}

/* ============================================================
   A BUYER RATES A FINISHED JOB — publishes as written, named,
   and nobody can take it down.
   ============================================================ */
async function rate(env, q) {
  const seller = q.get("seller"), ref = clean(q.get("ref")), name = clean(q.get("name")), email = clean(q.get("email")).toLowerCase();
  const stars = Math.round(Number(q.get("stars")));
  const missing = [];
  if (!seller) missing.push("which seller");
  if (!ref) missing.push("which job (the reference on your receipt)");
  if (!name || name.split(/\s+/).length < 2) missing.push("your full name");
  if (!email || email.indexOf("@") < 1) missing.push("your email address");
  if (!(stars >= 1 && stars <= 5)) missing.push("a rating from one to five");
  if (missing.length) return { ok:false, build: BUILD, error:"incomplete", missing };
  const s = await env.OVERHANG.prepare("SELECT id FROM gp_sellers WHERE id = ? AND state = 'verified'").bind(seller).first();
  if (!s) return { ok:false, error:"no such seller" };
  try {
    await env.OVERHANG.prepare("INSERT INTO gp_ratings (seller_id, ref, buyer_name, buyer_email, stars, words) VALUES (?,?,?,?,?,?)")
      .bind(seller, ref, name, email, stars, shorten(q.get("words"), 600) || null).run();
  } catch (e) {
    return { ok:false, build: BUILD, error:"you have already rated that job", note:"A rating cannot be changed once it is published." };
  }
  return { ok:true, build: BUILD, published:true, note:"Published as written. Nobody can remove it, including us." };
}

/* ============================================================
   THE SITE'S SIDE — its ledger and who it keeps off its pages
   ============================================================ */
/* ---- the half-year: Jan–Jun is H1, Jul–Dec is H2; `to` is exclusive ---- */
function halfOf(d) {
  const y = d.getUTCFullYear(), h = d.getUTCMonth() < 6 ? 1 : 2;
  return { half: y + "H" + h, from: y + (h === 1 ? "-01-01" : "-07-01"), to: h === 1 ? y + "-07-01" : (y + 1) + "-01-01" };
}
function parseHalf(s) {
  const m = /^(\d{4})H([12])$/i.exec(String(s || "")); if (!m) return null;
  return halfOf(new Date(Date.UTC(+m[1], m[2] === "1" ? 0 : 6, 1)));
}
/* a site's gross in one half, and what the house is owed on it at the rate the half earns */
async function halfBooks(env, f, key, h) {
  const t = await env.OVERHANG.prepare(
    "SELECT COUNT(*) sales, COALESCE(SUM(price_cents),0) gross FROM gp_sales WHERE site = ? AND state <> 'refunded' AND made >= ? AND made < ?")
    .bind(key, h.from, h.to).first();
  const gross = Number(t && t.gross) || 0, rate = houseRate(f, gross);
  return { half: h.half, from: h.from, to: h.to, sales: Number(t && t.sales) || 0, gross_cents: gross, gross: money(gross),
    rate_bps: rate, rate: pct(rate), due_cents: Math.round(gross * rate / 10000), due: money(Math.round(gross * rate / 10000)) };
}
function pubInvoice(v) {
  const days = Math.floor((Date.now() - Date.parse(String(v.issued).replace(" ", "T") + "Z")) / 86400000);
  const overdue = v.state === "open" && Date.now() > Date.parse(String(v.due_by).replace(" ", "T") + "Z");
  return { id: v.id, half: v.half, sales: v.sales, gross: money(v.gross_cents), rate: pct(v.rate_bps), due: money(v.due_cents),
    issued: String(v.issued).slice(0, 10), due_by: String(v.due_by).slice(0, 10), state: v.state, paid_at: v.paid_at || null,
    days_since_issued: days, overdue, note: v.note || null };
}

async function ledger(env, site) {
  const f = await fees(env);
  const t = await env.OVERHANG.prepare(
    `SELECT COUNT(*) sales, COALESCE(SUM(price_cents),0) gross, COALESCE(SUM(buyer_fee_cents + seller_fee_cents),0) fees
       FROM gp_sales WHERE site = ? AND state <> 'refunded'`).bind(site.key).first();
  const rows = await env.OVERHANG.prepare("SELECT id, made, where_, seller_id, price_cents, buyer_fee_cents, seller_fee_cents, state, ref FROM gp_sales WHERE site = ? ORDER BY made DESC LIMIT 200").bind(site.key).all();
  const inv = await env.OVERHANG.prepare("SELECT * FROM gp_invoices WHERE site = ? ORDER BY period_from DESC").bind(site.key).all();
  const g = await gate(env, site.key);
  return { ok:true, build: BUILD, site: Object.assign(pubSite(site), { state: site.state, paused: !!(g && g.off), why: g && g.off ? g.why : null }),
    all_time: { sales: Number(t && t.sales) || 0, gross: money(Number(t && t.gross) || 0), flat_fees_collected_by_gigapoo: money(Number(t && t.fees) || 0) },
    this_half: await halfBooks(env, f, site.key, halfOf(new Date())),
    terms: "Every six months Gigapoo bills " + pct(f.house_small_bps) + " of the half-year's sales on this site, or " + pct(f.house_large_bps) + " once they pass " + money(f.house_threshold_cents) + "; due in " + Number(f.due_days) + " days; " + Number(f.late_days) + " days late and the market here is switched off until paid.",
    invoices: (inv.results || []).map(pubInvoice),
    sales: (rows.results || []).map(v => ({ id: v.id, made: v.made, where: v.where_, seller: v.seller_id, price: money(v.price_cents), state: v.state, ref: v.ref || null })) };
}

/* ⚠ A SALE IS RECORDED HERE, ON EVERY SITE, OURS INCLUDED. The pay desk
   calls it when a buyer pays; a site with its own checkout calls it with
   its key. The books the house bills from are these rows. */
async function sale(env, site, q) {
  const sellerId = q.get("seller"), amount = cents(q.get("price"));
  if (!sellerId) return { ok:false, error:"which seller?" };
  if (!amount) return { ok:false, error:"the price paid, in dollars" };
  const s = await env.OVERHANG.prepare("SELECT id, name FROM gp_sellers WHERE id = ? AND state = 'verified'").bind(sellerId).first();
  if (!s) return { ok:false, error:"no such verified seller" };
  const f = await fees(env);
  let delivery = pick(q.get("delivery"), DELIVERY);
  const offerId = q.get("offer") || null;
  if (offerId && !delivery) { const o = await env.OVERHANG.prepare("SELECT delivery FROM gp_offers WHERE id = ?").bind(offerId).first(); delivery = o ? o.delivery : null; }
  const where = pick(q.get("where"), WHERE) || "remote";
  const ref = clean(q.get("ref")) || null;
  if (ref) { const had = await env.OVERHANG.prepare("SELECT id FROM gp_sales WHERE site = ? AND ref = ?").bind(site.key, ref).first();
    if (had) return { ok:true, build: BUILD, already:true, id: had.id, note:"That reference is already on the books." }; }
  const r = await env.OVERHANG.prepare(
    `INSERT INTO gp_sales (site, seller_id, offer_id, request_id, buyer_email, price_cents, buyer_fee_cents, seller_fee_cents, site_share_cents, where_, state, ref)
     VALUES (?,?,?,?,?,?,?,?,0,?,?,?)`)
    .bind(site.key, s.id, offerId, q.get("request") || null, clean(q.get("buyer_email")).toLowerCase() || null, amount,
          f.buyer_cents, sellerFee(f, delivery || "text"), where, where === "in_place" ? "held" : "paid", ref).run();
  const h = await halfBooks(env, f, site.key, halfOf(new Date()));
  return { ok:true, build: BUILD, id: lastId(r), site: site.key, seller: s.name, price: money(amount),
    seller_keeps: money(amount - sellerFee(f, delivery || "text")), buyer_paid: money(amount + f.buyer_cents),
    this_half: { gross: h.gross, sales: h.sales, gigapoo_is_owed_so_far: h.due + " (" + h.rate + ")" } };
}

/* ---- the house's books: every site, all-time, this half, what is owed, what is late ---- */
async function books(env) {
  const f = await fees(env), now = halfOf(new Date());
  const sitesR = await env.OVERHANG.prepare("SELECT * FROM gp_sites WHERE state IN ('live','off') ORDER BY name").all();
  const out = [];
  for (const s of (sitesR.results || [])) {
    const t = await env.OVERHANG.prepare("SELECT COUNT(*) sales, COALESCE(SUM(price_cents),0) gross FROM gp_sales WHERE site = ? AND state <> 'refunded'").bind(s.key).first();
    const inv = await env.OVERHANG.prepare("SELECT * FROM gp_invoices WHERE site = ? ORDER BY period_from DESC").bind(s.key).all();
    const open = (inv.results || []).filter(v => v.state === "open").map(pubInvoice);
    const g = await gate(env, s.key);
    out.push({ id: s.id, key: s.key, name: s.name, domain: s.domain, state: s.state, paused: !!(g && g.off), why: g && g.off ? g.why : null,
      purpose: s.purpose || null, min_age: Number(s.min_age) || 0,
      all_time: { sales: Number(t.sales) || 0, gross: money(Number(t.gross) || 0) },
      this_half: await halfBooks(env, f, s.key, now),
      owed_now: money(open.reduce((a, v) => a + Number(String(v.due).replace(/[$,]/g, "")) * 100, 0)),
      open_invoices: open, most_days_late: open.length ? Math.max(...open.map(v => v.days_since_issued)) : 0,
      invoices: (inv.results || []).map(pubInvoice) });
  }
  return { ok:true, build: BUILD, half: now.half, terms: (await feesPublic(env)).the_site_pays_gigapoo.says,
    late_after_days: Number(f.late_days), sites: out };
}
/* write the invoices for a half — the last one that ended, unless told which */
async function bill(env, which) {
  const f = await fees(env);
  let h = which ? parseHalf(which) : null;
  if (which && !h) return { ok:false, error:"which half? like 2026H1" };
  if (!h) { const n = new Date(); h = halfOf(new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() - 6, 1))); }
  const ended = Date.now() >= Date.parse(h.to + "T00:00:00Z");
  const sitesR = await env.OVERHANG.prepare("SELECT key, name FROM gp_sites WHERE state IN ('live','off')").all();
  const wrote = [], skipped = [];
  for (const s of (sitesR.results || [])) {
    const b = await halfBooks(env, f, s.key, h);
    if (!b.gross_cents) { skipped.push({ site: s.key, why: "no sales" }); continue; }
    try {
      const r = await env.OVERHANG.prepare(
        `INSERT INTO gp_invoices (site, half, period_from, period_to, sales, gross_cents, rate_bps, due_cents, due_by)
         VALUES (?,?,?,?,?,?,?,?, datetime('now', ?))`)
        .bind(s.key, h.half, h.from, h.to, b.sales, b.gross_cents, b.rate_bps, b.due_cents, "+" + (Number(f.due_days) || 30) + " days").run();
      wrote.push({ invoice: lastId(r), site: s.key, name: s.name, half: h.half, gross: b.gross, rate: b.rate, due: b.due });
    } catch (e) { skipped.push({ site: s.key, why: "already billed for " + h.half }); }
  }
  return { ok:true, build: BUILD, half: h.half, period: h.from + " to " + h.to, ended, note: ended ? null : "That half has not ended — these are bills on the sales so far.", wrote, skipped };
}
async function markPaid(env, id, note) {
  if (!id) return { ok:false, error:"which invoice? (&invoice=)" };
  const v = await env.OVERHANG.prepare("SELECT * FROM gp_invoices WHERE id = ?").bind(id).first();
  if (!v) return { ok:false, error:"no such invoice" };
  await env.OVERHANG.prepare("UPDATE gp_invoices SET state='paid', paid_at=datetime('now'), note=COALESCE(?, note) WHERE id=?").bind(clean(note) || null, id).run();
  const g = await gate(env, v.site);
  return { ok:true, build: BUILD, invoice: pubInvoice(await env.OVERHANG.prepare("SELECT * FROM gp_invoices WHERE id = ?").bind(id).first()),
    site: v.site, market: g && g.off ? "still paused: " + g.why : "live" };
}
async function hideSeller(env, site, sellerId, hide) {
  if (!sellerId) return { ok:false, error:"which seller?" };
  if (hide) await env.OVERHANG.prepare("INSERT OR IGNORE INTO gp_hidden (site, seller_id) VALUES (?,?)").bind(site.key, sellerId).run();
  else await env.OVERHANG.prepare("DELETE FROM gp_hidden WHERE site=? AND seller_id=?").bind(site.key, sellerId).run();
  return { ok:true, build: BUILD, site: site.key, seller: Number(sellerId), hidden: !!hide };
}

async function stats(env) {
  const one = async (sql) => { try { return (await env.OVERHANG.prepare(sql).first()) || {}; } catch (e) { return { failed: true }; } };
  return { ok:true, build: BUILD,
    sites: await one("SELECT COUNT(*) all_of_them, SUM(CASE WHEN state='live' THEN 1 ELSE 0 END) live, SUM(CASE WHEN state='applied' THEN 1 ELSE 0 END) waiting FROM gp_sites"),
    sellers: await one("SELECT COUNT(*) all_of_them, SUM(CASE WHEN state='verified' THEN 1 ELSE 0 END) verified, SUM(CASE WHEN state='applied' THEN 1 ELSE 0 END) waiting, SUM(nomad) nomads FROM gp_sellers"),
    offers: await one("SELECT COUNT(*) all_of_them, SUM(CASE WHEN where_='in_place' THEN 1 ELSE 0 END) in_place FROM gp_offers WHERE state='live'"),
    requests: await one("SELECT COUNT(*) all_of_them, SUM(CASE WHEN state='open' THEN 1 ELSE 0 END) open FROM gp_requests"),
    bids: await one("SELECT COUNT(*) all_of_them FROM gp_bids"),
    sales: await one("SELECT COUNT(*) all_of_them, SUM(price_cents) gross FROM gp_sales"),
    fees: await fees(env) };
}

/* ============================================================
   THE PHOTOGRAPH — verified seller only, own photo only, type
   read from the bytes, key from the id, served with nosniff.
   ============================================================ */
const PHOTO_MAX = 2 * 1024 * 1024;
function sniff(bytes) {
  const b = new Uint8Array(bytes.slice(0, 12));
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return { type: "image/jpeg", ext: "jpg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return { type: "image/png", ext: "png" };
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return { type: "image/webp", ext: "webp" };
  return null;
}
async function putPhoto(env, me, req, origin) {
  if (!env.IMG) return { ok:false, error:"no IMG binding" };
  if (req.method !== "POST" && req.method !== "PUT") return { ok:false, error:"POST the image as the body" };
  const bytes = await req.arrayBuffer();
  if (!bytes.byteLength) return { ok:false, error:"nothing was sent" };
  if (bytes.byteLength > PHOTO_MAX) return { ok:false, error:"two megabytes at most" };
  const kind = sniff(bytes);
  if (!kind) return { ok:false, error:"a JPEG, PNG or WebP — read from the file itself, not its name. No SVG, ever." };
  const key = "gp/seller-" + me.id + "." + kind.ext;
  await env.IMG.put(key, bytes, { httpMetadata: { contentType: kind.type } });
  await env.OVERHANG.prepare("UPDATE gp_sellers SET photo_key=? WHERE id=?").bind(key, me.id).run();
  return { ok:true, build: BUILD, shows_at: (origin || "") + "/?photo=" + me.id,
    note:"A picture out of a phone often carries where it was taken. If that matters to you, use one that does not." };
}
async function servePhoto(env, id) {
  const s = await env.OVERHANG.prepare("SELECT photo_key FROM gp_sellers WHERE id = ? AND state='verified'").bind(id).first();
  if (!s || !s.photo_key || !env.IMG) return new Response("no photo", { status: 404 });
  const o = await env.IMG.get(s.photo_key);
  if (!o) return new Response("no photo", { status: 404 });
  return new Response(o.body, { headers: { "Content-Type": (o.httpMetadata && o.httpMetadata.contentType) || "image/jpeg",
    "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=3600", "Access-Control-Allow-Origin": "*" } });
}

/* ============================================================ helpers */
function clean(v) { return String(v == null ? "" : v).replace(/\s+/g, " ").trim(); }
function sayKind(k) { return { text: "written work", voice: "written + a machine voice", own: "written + the seller's own voice", file: "a file", in_person: "in-person work" }[k] || k; }
function shorten(v, n) { const s = clean(v); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
function url(v, mustContain) { const s = clean(v); if (!/^https?:\/\//i.test(s)) return null; if (mustContain && s.toLowerCase().indexOf(mustContain) < 0) return null; return s.slice(0, 200); }
function year(v) { const n = parseInt(v, 10); return n >= 1940 && n <= 2030 ? n : null; }
function pick(v, allowed) { const s = clean(v).toLowerCase(); return allowed.indexOf(s) > -1 ? s : null; }
function yes(v) { return /^(1|y|yes|true|on)$/i.test(String(v || "")); }
function num(v) { if (v == null || v === "") return null; const n = Number(v); return isNaN(n) ? null : n; }
function cents(v) { const n = Number(String(v || "").replace(/[$,]/g, "")); return n > 0 ? Math.round(n * 100) : 0; }
function money(c) { const d = (c || 0) / 100; return "$" + d.toLocaleString("en-US", { minimumFractionDigits: (c % 100) ? 2 : 0, maximumFractionDigits: 2 }); }
function surnameOf(name) { const p = clean(name).split(" "); return (p[p.length - 1] || "").toLowerCase(); }
function makeToken() { const a = new Uint8Array(18); crypto.getRandomValues(a); return Array.from(a, b => b.toString(16).padStart(2, "0")).join(""); }
function lastId(r) { return (r && r.meta && r.meta.last_row_id) || (r && r.lastInsertRowid) || null; }
function json(o, h, s = 200) { return new Response(JSON.stringify(o, null, 2), { status: s, headers: h }); }
