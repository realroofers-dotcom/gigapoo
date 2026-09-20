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

   ⚠ THE FEES ARE DATA. gp_fees holds the yearly site fee, the flat buyer
     fee, the flat seller fee by delivery, and the site's share — read from
     the table, never from a constant, and the same numbers gigapoo.com
     prints. Flat, never a percentage of the seller's price.

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
     ?action=join        apply to sell   name, email, phone, city, country,
                                        [region, lat, lng, nomad=1, location_on=1,
                                         site, about, credential, org, photo…]
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
     ?action=ledger&key=<site key>        the site's sales and share
     ?action=hide&key=…&seller=<id>       keep someone off this site
     ?action=unhide&key=…&seller=<id>

   HOUSE — needs LOG_KEY
     ?action=applications   who has applied to sell
     ?action=verify&id=…    verify one, issue their token
     ?action=refuse&id=…&why=…
     ?action=sites          every site, applied and live
     ?action=verify_site&id=…   issue the site's key
     ?action=fees&…         change a fee (year_cents, buyer_cents, seller_text_cents,
                            seller_voice_cents, seller_own_cents, site_share_bps)
     ?action=requests       every request
     ?action=stats
   ========================================================================== */

const BUILD = "gigapoo-1a · 2026-09-20 · the engine: sites, offers, location on";
const LOCATION_STALE_DAYS = 30;
const DELIVERY = ["text", "voice", "own", "file", "in_person"];
const WHERE = ["remote", "in_place"];

/* the fee defaults — written into gp_fees once, then the table is the truth.
   The same four numbers gigapoo.com prints (index-1a). */
const FEE_DEFAULTS = { year_cents: 120000, buyer_cents: 1000,
  seller_text_cents: 2500, seller_voice_cents: 5000, seller_own_cents: 7500,
  site_share_bps: 5000 };

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

      if (!a) {
        if (q.get("photo"))   return await servePhoto(env, q.get("photo"));
        if (q.get("seller"))  return json(await profile(env, q.get("seller"), u.origin), H);
        if (q.get("request")) return json(await oneRequest(env, q.get("request")), H);
        if (q.get("sellers")) return json(await roster(env, q, u.origin), H);
        if (q.get("offers"))  return json(await offers(env, q, u.origin), H);
        if (q.get("requests")) return json(await wanted(env, q), H);
        if (q.get("fees"))    return json(await feesPublic(env), H);
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

      /* ---- site, by its key ---- */
      if (["ledger", "hide", "unhide"].indexOf(a) > -1) {
        const site = await bySite(env, q.get("key"));
        if (!site) return json({ ok:false, build: BUILD, error:"not a live site key" }, H, 401);
        if (a === "ledger") return json(await ledger(env, site), H);
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

  /* the house's own three sites exist from the first request, live, no fee */
  for (const s of [["wire", "Warrant Wire", "warrantwire.com"], ["k8", "8K10Q", "8k10q.com"], ["nujobi", "Nujobi", "nujobi.com"]]) {
    await D.prepare(
      `INSERT OR IGNORE INTO gp_sites (key, name, domain, owner_name, owner_email, owner_phone, state, verified)
       VALUES (?,?,?,?,?,?,'live',datetime('now'))`)
      .bind(s[0], s[1], s[2], "Mark Nejmeh", "realroofers@gmail.com", "732-995-3914").run();
  }
}

async function fees(env) {
  return (await env.OVERHANG.prepare("SELECT * FROM gp_fees WHERE id = 1").first()) || FEE_DEFAULTS;
}
function sellerFee(f, delivery) {
  return delivery === "own" ? f.seller_own_cents : delivery === "voice" ? f.seller_voice_cents : f.seller_text_cents;
}
async function feesPublic(env) {
  const f = await fees(env);
  return { ok:true, build: BUILD,
    a_year_for_a_site: money(f.year_cents),
    on_every_sale: { from_the_buyer: money(f.buyer_cents),
      from_the_seller: { written: money(f.seller_text_cents), with_a_machine_voice: money(f.seller_voice_cents), with_the_sellers_own_voice: money(f.seller_own_cents) },
      the_sites_share: (f.site_share_bps / 100) + "%" },
    rule: "Flat, never a percentage of the seller's price. The site's share is paid each quarter." };
}
async function setFees(env, q) {
  const f = await fees(env);
  const n = k => q.get(k) != null ? Math.max(0, Math.round(Number(q.get(k)))) : f[k];
  await env.OVERHANG.prepare(
    `UPDATE gp_fees SET year_cents=?, buyer_cents=?, seller_text_cents=?, seller_voice_cents=?,
       seller_own_cents=?, site_share_bps=?, changed=datetime('now') WHERE id=1`)
    .bind(n("year_cents"), n("buyer_cents"), n("seller_text_cents"), n("seller_voice_cents"), n("seller_own_cents"), n("site_share_bps")).run();
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
  const r = await env.OVERHANG.prepare(
    "INSERT INTO gp_sites (name, domain, owner_name, owner_email, owner_phone) VALUES (?,?,?,?,?)")
    .bind(domain, domain, name, email, phone).run();
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
    note:"Send the key to the site owner with the two install lines. Their yearly fee is recorded in paid_through by the pay desk." };
}
async function bySite(env, key) {
  if (!key) return null;
  return await env.OVERHANG.prepare("SELECT * FROM gp_sites WHERE key = ? AND state = 'live'").bind(key).first();
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

  const missing = [];
  if (!name || name.split(/\s+/).length < 2) missing.push("a full name, first and last");
  if (!email || email.indexOf("@") < 1) missing.push("an email address");
  if (!phone || phone.replace(/\D/g, "").length < 7) missing.push("a telephone number");
  if (!city || !country) missing.push("where you are — city and country");
  /* ⚠ THE NOMAD RULE. No fixed address is fine. No location is not. */
  if (nomad && !locOn) missing.push("location sharing ON — a seller with no fixed address must keep their location current");
  if (nomad && (lat == null || lng == null)) missing.push("your current position (let the page use your location)");

  if (missing.length)
    return { ok:false, build: BUILD, error:"application incomplete", missing,
      note:"Nobody sells here anonymously. A real name, a real telephone, and where you are — " +
           "city and country. No fixed address is fine; then location sharing stays on." };

  const had = await env.OVERHANG.prepare("SELECT id, state FROM gp_sellers WHERE email = ?").bind(email).first();
  if (had) return { ok:true, build: BUILD, already:true, id: had.id, state: had.state,
    note:"That address has already applied. Nothing was changed." };

  const site = clean(q.get("site")) || null;
  const r = await env.OVERHANG.prepare(
    `INSERT INTO gp_sellers (name, sort, email, phone, city, region, country, lat, lng, nomad, location_on,
       org, credential, about, education, linkedin, since_year, home_site, us_bank)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(name, surnameOf(name), email, phone, city, region || null, country, lat, lng, nomad ? 1 : 0, locOn ? 1 : 0,
          clean(q.get("org")) || null, clean(q.get("credential")) || null, shorten(q.get("about"), 320) || null,
          shorten(q.get("education"), 160) || null, url(q.get("linkedin"), "linkedin.com"), year(q.get("since")),
          site, yes(q.get("bank")) ? 1 : 0).run();

  return { ok:true, build: BUILD, id: lastId(r), state:"applied",
    note:"Applied. A person telephones you before anything you write is published. " +
         "Until then the roster does not carry your name." };
}

async function applications(env) {
  const r = await env.OVERHANG.prepare(
    `SELECT id, name, email, phone, city, region, country, nomad, location_on, org, credential,
            home_site, us_bank, state, applied FROM gp_sellers WHERE state = 'applied' ORDER BY applied`).all();
  return { ok:true, build: BUILD, rows: r.results || [] };
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
                 AND (s.home_site = ?1 OR s.id IN (SELECT seller_id FROM gp_offers WHERE site = ?1 AND state='live'))`; }
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
  if (site && !(await bySite(env, site)) && ["wire", "k8", "nujobi"].indexOf(site) < 0) return { ok:false, error:"no such site" };
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
  if (site) { sql += " AND (o.site = ? OR o.site IS NULL) AND s.id NOT IN (SELECT seller_id FROM gp_hidden WHERE site = ?)"; binds.push(site, site); }
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
  if (missing.length) return { ok:false, build: BUILD, error:"incomplete", missing };
  const site = clean(q.get("site")) || "wire";
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
async function ledger(env, site) {
  const f = await fees(env);
  const t = await env.OVERHANG.prepare(
    `SELECT COUNT(*) sales, SUM(price_cents) gross, SUM(buyer_fee_cents + seller_fee_cents) fees, SUM(site_share_cents) share
       FROM gp_sales WHERE site = ? AND state <> 'refunded'`).bind(site.key).first();
  const rows = await env.OVERHANG.prepare("SELECT id, made, where_, price_cents, buyer_fee_cents, seller_fee_cents, site_share_cents, state FROM gp_sales WHERE site = ? ORDER BY made DESC LIMIT 200").bind(site.key).all();
  return { ok:true, build: BUILD, site: { key: site.key, name: site.name, domain: site.domain, paid_through: site.paid_through },
    totals: { sales: Number(t && t.sales) || 0, gross: money(Number(t && t.gross) || 0), fees: money(Number(t && t.fees) || 0), your_share: money(Number(t && t.share) || 0) },
    share: (f.site_share_bps / 100) + "% of every sale's fees, paid each quarter", rows: rows.results || [] };
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
