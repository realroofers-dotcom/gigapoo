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

   ⚠ GIGS, JOBS AND EVENTS — AND NOTHING IS FREE. His rule, 20 Sep, looking
     at the WordPress marketplace builders: "allow for jobs and events if
     people are holding them — a type of meetup and gig economy. Only paid
     events, same service charge paid every 6 months. Emphasize the concept:
     free has no value, for events and for gigs."
       A GIG is an offer or a request, as before. A JOB is a request with
     kind='job' — ongoing work at a rate, not a one-off. An EVENT is held by
     a verified seller (a host is not anonymous either) at a date, a place or
     online, with a description, a location, a limit on attendance if the
     host wants one, and A PRICE — the engine refuses a $0 event, a $0 offer
     and a $0 bid alike. Every kind of event: meetup, class, talk, walk, dinner.

   ⚠ WHO COMES TO AN EVENT, AND HOW THEY PAY. His rule, 20 Sep: "all event
     attendees must register with Gigapoo with their name and their picture,
     email, to be verified by the event creator. Attendees can get a credit
     line; the event creators take the risk of receiving payment and so
     does Gigapoo — but it's better to receive larger payments — and they
     should be paid with achpay.com."
       So an ATTENDEE registers once (gp_attendees): full name, email,
     telephone, AND A PICTURE — no picture, no ticket. They ask to attend;
     the HOST sees the name, the picture and the email and approves or
     declines. Approval is the credit line: the ticket is a sale on the
     site's books at once, in state 'credit' — owed, not yet received. It
     settles by ACH through achpay.com (?action=sale&ticket=… flips it to
     'paid'). The half-year bill counts credit sales as sales: the host and
     the house carry the risk together, and a larger payment received is
     worth the wait. Seats are taken by approved and paid tickets; requests
     wait.

   ⚠ SECURITY AT EVENTS IS THE PICTURE AND THE HOST. His rule, 20 Sep: "the
     best security for events is the picture and the event coordinator, who
     should have the right to ban an attendee temporarily or permanently.
     All attendee profiles should give hometown and present location area.
     All should be welcome but security is key: telephone numbers required
     in profile or no attendance." So an attendee's profile carries name,
     telephone, email, picture, HOMETOWN and PRESENT LOCATION (city and
     country) — none optional. The host sees all of it before saying yes,
     and may bar an attendee from their events for N days or for good
     (gp_bans; ?action=ban / ?action=unban). The house may bar from all.

   ⚠ MEMBERS HEAR WHAT IS NEW NEAR THEM. His rule, 20 Sep: "members should
     get announcement of new gig opportunities and new event opportunities in
     their area, and be able to change their desired location as people
     travel." So every attendee (and every seller) carries a WATCH AREA — a
     city and country they want news from, separate from where they are now
     — changed any time with ?action=watch. ?action=news&token= is what is
     new there (events and requests of the last 14 days). ?action=digest
     (house) builds one message per member and sends it when a MAIL binding
     (MAIL_URL + MAIL_KEY, Resend-shaped) is set; without one it returns the
     messages for sending by hand. Nothing is sent to a member who turned
     alerts off.

   ⚠ CREDIT IS FOR EVENT ATTENDANCE ONLY. His emphasis, 20 Sep: the credit
     line is for people coming to events, NOT for those hiring gig workers —
     a gig is paid up front and held until done. And a request may be marked
     ANYONE COULD DO THIS (anyone=1): no skill needed, any verified seller
     may bid; the roster shows it as such.

   ⚠ EVERYONE IS REVIEWED, 140 CHARACTERS AT MOST. His rule, 20 Sep: event
     creators, gig workers, event attendees and the people who hire gig
     workers all get reviewed. gp_reviews holds them: who it is about
     (seller:<id>, host:<id>, attendee:<id>, buyer:<email>), who wrote it,
     the sale or ticket it rests on, one to five stars, and at most 140
     characters — refused if longer, never cut. Published as written, under
     the writer's name, and nobody takes one down. A buyer's rating of a
     seller (?action=rate) is the same table with the same cap.

   ⚠ STRIPE IN, ACHPAY OUT. His rule, 20 Sep: "implement Stripe for gig
     workers, except they must also have achpay.com to receive our payment;
     they absorb the Stripe fees." So a gig is paid by card through Stripe
     Checkout (?action=checkout&key=<site>&offer=…); Stripe's webhook
     (POST ?stripe=1, signature checked) puts the sale on the books with
     rail 'stripe' and Stripe's fee (gp_fees.stripe_bps + stripe_fixed_cents,
     2.9% + 30¢ by default) charged to the SELLER, not the buyer. Payout is
     by ACH through achpay.com only: a seller's achpay address is on their
     profile (join: achpay=…, or ?action=bank&token=…&achpay=…) and
     ?action=payout refuses without it. Event tickets never touch Stripe —
     they are credit, settled by ACH.
     VARIABLES  STRIPE_SECRET, STRIPE_WEBHOOK_SECRET (cf.ps1 setvar; never in
     a file). Without them ?action=checkout says so and nothing else changes.

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
                                        budget, note, kind=gig|job, rate]
     ?events=1&site=<key>                            what is on — paid events, dated
     ?event=<id>                                     one event
     ?action=register    an attendee registers once: name, email, phone, hometown,
                         city, country → a token
     ?apic=<attendee id>                             the attendee's picture
     ?pins=events&site=<key>                         events with a position, for the map
     ?pins=sellers&site=<key>                        sellers near, at ~1 km — never the exact point

   ATTENDEE — needs the attendee token
     ?action=attendee_photo&token=…   POST the picture as the body (required before any ticket)
     ?action=attend&token=…&event=<id>[&seats=]   ask to attend
     ?action=tickets&token=…          my tickets and what I owe
     ?action=watch&token=…&city=&country=[&alerts=0|1]   my desired area for news (travel: change it any time)
     ?action=news&token=…             what is new in my area: events and requests, last 14 days
     ?action=rate        a buyer rates  seller, ref, name, email, stars, [words ≤140]
     ?action=review&token=…  everyone else: about=host:<id>|attendee:<id>|buyer:<email>,
                             ref=<ticket or sale id>, stars, [words ≤140]
                             (a seller token reviews a buyer or an attendee of their
                              event; an attendee token reviews a host)
     ?action=site        a site applies name, email, phone, site (the domain)
     ?photo=<seller id>                              the photograph

   SELLER — needs the token issued at verification
     ?action=offer&token=…   what I can do: title, price, [blurb, delivery,
                             where, days, category, site, advice=1]
     ?action=bid&token=…     answer a request: request, price, [delivery, note]
     ?action=event&token=…   hold an event: title, price, starts (YYYY-MM-DDTHH:MM),
                             [blurb, city, country, venue, online=1, seats, site]
     ?action=guests&token=…&event=<id>       who asked to come: name, picture, email
     ?action=approve&token=…&ticket=<id>     let them in — opens the credit line
     ?action=decline&token=…&ticket=<id>
     ?action=ban&token=…&attendee=<id>[&days=30][&why=]   bar them from your events (no days = for good)
     ?action=unban&token=…&attendee=<id>
     ?action=reach&token=…&event=<id>[&who=in|asked|all]   the telephone and email list
                             of who is coming, with sms: and mailto: links to send one
                             message from the host's own phone (small bulk)
     ?action=where&token=…   check in: city, country, [region, lat, lng]
     ?action=bank&token=…&achpay=<your achpay.com address>   where Gigapoo pays you
     ?action=me&token=…      what is mine
     ?action=photo&token=…   POST the image as the body

   SITE — needs the site key
     ?action=ledger&key=<site key>        the site's sales, this half's bill, its invoices
     ?action=sale&key=…                   record a sale: seller, price, [offer, request,
                                          event, ticket, buyer_email, where, ref]
                                          (the pay desk, or the site's own checkout; the
                                          house key works too; a paid ticket is a sale)
     ?action=checkout&key=…&offer=<id>&buyer_email=…[&name=&success=<url>&cancel=<url>]
                                          a Stripe Checkout page for a gig; the webhook books the sale
     POST ?stripe=1                       Stripe's webhook (checkout.session.completed)
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
     ?action=scenarios[&site=&topic=]   every scenario described, whole, with bids and sales — to learn from
     ?action=stats
   ========================================================================== */

const BUILD = "gigapoo-1d · 2026-09-20 · the engine: gigs, jobs and paid events on every site's books; attendees registered and verified by the host; credit settled by ACH; nothing is free";
const NOTHING_FREE = "Free has no value here. Every gig, job and event carries a price.";
const ACH = "achpay.com";   /* the rail tickets settle on — his call, 20 Sep */
/* HIS RULE, 20 Sep, on meetups: "people want for free but that costs time and
   problems. The minimum price to attend an event is $5; we get 5% of the
   6-month total; if the attendee signs up they have to agree to pay for their
   attendance even though we are giving a credit line. They pay the system;
   we pay the creator of the events." */
const MIN_TICKET_CENTS = 500;
const REVIEW_MAX = 140;
const CREDIT_IS_FOR_EVENTS = "Credit is for coming to events. A gig is paid up front and held until the work is done.";
const PAYS_THE_SYSTEM = "You pay Gigapoo; Gigapoo pays the host.";
/* HIS RULE, 20 Sep, from eleven years of running a meetup: contact is
   critical; people must be able to search for the TYPE of event they want;
   the fee per event weeds out the time-wasters; attendees sign and agree to
   pay their ACCUMULATED credit, and WE CHARGE NO INTEREST. */
const NO_INTEREST = "Credit accumulates across events and is paid by ACH; Gigapoo charges no interest on it.";
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
  due_days: 30, late_days: 180,
  ticket_buyer_cents: 200, ticket_host_cents: 100,   /* per seat: a $15 ticket is not a $150 reading */
  stripe_bps: 290, stripe_fixed_cents: 30 };          /* Stripe's card fee, absorbed by the seller */

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
  /* 21 Sep — Wise Sleuth: a research club for senior citizens. Research gigs
     (paid, in writing or by voice) and the club's events — meetups to do the
     research together. His call: "add it as a gig on Gigapoo and a group for
     events, just wisesleuth." */
  { key: "wisesleuth", name: "Wise Sleuth", domain: "wisesleuth.com", min_age: 18, kinds: "text,voice,own,file,in_person",
    purpose: "A research club — gig work for seniors and for people coming out of prison", audience: "seniors, ex-offenders, and anyone who likes to dig",
    blurb: "Research gigs done by named people who dig — a company, a claim, a family history, a property, a public record — and the club's meetups to do it together. Built for people with time and patience who need honest work under their own name: senior citizens, and people who have done their time. Nobody is anonymous." },
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
      if (q.get("stripe") && req.method === "POST") return json(await stripeHook(env, req), H);
      /* ⚠ THE ACTION IS READ FIRST, ALWAYS, AND EVERY BARE LOOKUP IS GUARDED
         BY IT — the lesson from nujobi-1b, where ?action=bid&request=1 was
         answered by the public request listing. */
      const a = q.get("action") || "";

      /* ⚠ A PAUSED SITE ANSWERS NOTHING BUT "PAUSED". Every public read and
         write that names a site goes through the gate first. */
      if (q.get("site") && ["", "join", "want", "offer", "event"].indexOf(a) > -1) {
        const g = await gate(env, q.get("site"));
        if (g && g.off) return json({ ok:false, build: BUILD, paused:true, site: g.key, error: g.why }, H, 402);
      }

      if (!a) {
        if (q.get("photo"))   return await servePhoto(env, q.get("photo"));
        if (q.get("apic"))    return await servePhoto(env, q.get("apic"), "attendee");
        if (q.get("epic"))    return await servePhoto(env, q.get("epic"), "event");
        if (q.get("pictures")) return json(await pictures(env, q, u.origin), H);
        if (q.get("pins"))    return json(await pins(env, q, u.origin), H);
        if (q.get("seller"))  return json(await profile(env, q.get("seller"), u.origin), H);
        if (q.get("request")) return json(await oneRequest(env, q.get("request")), H);
        if (q.get("sellers")) return json(await roster(env, q, u.origin), H);
        if (q.get("offers"))  return json(await offers(env, q, u.origin), H);
        if (q.get("requests")) return json(await wanted(env, q), H);
        if (q.get("events")) return json(await events(env, q, u.origin), H);
        if (q.get("event"))  return json(await oneEvent(env, q.get("event"), u.origin), H);
        if (q.get("fees"))    return json(await feesPublic(env), H);
        if (q.get("site"))    return json(await siteInfo(env, q.get("site")), H);
      }
      if (a === "join")  return json(await join(env, q), H);
      if (a === "want")  return json(await want(env, q), H);
      if (a === "register") return json(await register(env, q), H);
      if (a === "review") {
        const s = await bySeller(env, q.get("token")), w = s ? null : await byAttendee(env, q.get("token"));
        if (!s && !w) return json({ ok:false, build: BUILD, error:"a seller's or an attendee's token" }, H, 401);
        return json(await review(env, s, w, q), H);
      }
      if (a === "rate")  return json(await rate(env, q), H);
      if (a === "site")  return json(await siteApply(env, q), H);

      /* ---- attendee, by their token ---- */
      if (["attendee_photo", "attend", "tickets", "watch", "news"].indexOf(a) > -1) {
        const who = await byAttendee(env, q.get("token"));
        if (!who) return json({ ok:false, build: BUILD, error:"not a registered attendee — register first (name, email, telephone, picture)" }, H, 401);
        if (a === "attendee_photo") return json(await putPhoto(env, who, req, u.origin, "attendee"), H);
        if (a === "attend") return json(await attend(env, who, q), H);
        if (a === "watch") return json(await watch(env, "gp_attendees", who, q), H);
        if (a === "news") return json(await news(env, who.watch_city || who.city, who.watch_country || who.country, 14, u.origin), H);
        return json(await myTickets(env, who), H);
      }

      /* ---- seller, by token ---- */
      if (["offer", "bid", "event", "event_photo", "guests", "approve", "decline", "ban", "unban", "reach", "watch", "news", "where", "bank", "me", "photo"].indexOf(a) > -1) {
        const me = await bySeller(env, q.get("token"));
        if (!me) return json({ ok:false, build: BUILD, error:"not a verified seller" }, H, 401);
        if (a === "offer") return json(await offer(env, me, q), H);
        if (a === "bid")   return json(await bid(env, me, q), H);
        if (a === "event") return json(await holdEvent(env, me, q), H);
        if (a === "event_photo") {
          const e = await env.OVERHANG.prepare("SELECT id FROM gp_events WHERE id = ? AND host_id = ?").bind(q.get("event"), me.id).first();
          if (!e) return json({ ok:false, error:"not your event" }, H, 403);
          return json(await putPhoto(env, e, req, u.origin, "event"), H);
        }
        if (a === "guests") return json(await guests(env, me, q.get("event"), u.origin), H);
        if (a === "approve" || a === "decline") return json(await decide(env, me, q.get("ticket"), a === "approve"), H);
        if (a === "ban" || a === "unban") return json(await ban(env, me.id, q, a === "ban"), H);
        if (a === "reach") return json(await reach(env, me, q), H);
        if (a === "watch") return json(await watch(env, "gp_sellers", me, q), H);
        if (a === "news") return json(await news(env, me.watch_city || me.city, me.watch_country || me.country, 14, u.origin), H);
        if (a === "where") return json(await whereAmI(env, me, q), H);
        if (a === "bank")  return json(await bank(env, me, q), H);
        if (a === "photo") return json(await putPhoto(env, me, req, u.origin), H);
        return json(await mine(env, me, u.origin), H);
      }

      /* ---- site, by its key (the house key opens any site's desk) ---- */
      if (["ledger", "hide", "unhide", "sale", "checkout"].indexOf(a) > -1) {
        const k = req.headers.get("X-Auth-Key") || q.get("key");
        const house = !!env.LOG_KEY && k === env.LOG_KEY;
        /* the ledger and a sale still work while a site is off — the books
           must close; only the market stops */
        const site = house ? await siteRow(env, q.get("site")) : await bySite(env, k, true);
        if (!site) return json({ ok:false, build: BUILD, error: house ? "which site? (&site=key)" : "not a live site key" }, H, 401);
        if (a === "ledger") return json(await ledger(env, site), H);
        if (a === "sale")   return json(await sale(env, site, q), H);
        if (a === "checkout") return json(await checkout(env, site, q, u.origin), H);
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
      if (a === "payout")       return json(await payout(env, q.get("sale"), q.get("ref")), H);
      if (a === "ban" || a === "unban") return json(await ban(env, 0, q, a === "ban"), H);   /* the house bars from every event */
      if (a === "digest")       return json(await digest(env, q, u.origin), H);
      if (a === "off" || a === "on") return json(await switchSite(env, q.get("id"), a === "off", q.get("why")), H);
      if (a === "fees")         return json(await setFees(env, q), H);
      if (a === "requests")     return json(await allRequests(env), H);
      if (a === "scenarios")    return json(await scenarios(env, q), H);
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
  await add("ALTER TABLE gp_fees ADD COLUMN ticket_buyer_cents INTEGER DEFAULT 200");
  await add("ALTER TABLE gp_fees ADD COLUMN ticket_host_cents INTEGER DEFAULT 100");
  await add("ALTER TABLE gp_fees ADD COLUMN stripe_bps INTEGER DEFAULT 290");
  await add("ALTER TABLE gp_fees ADD COLUMN stripe_fixed_cents INTEGER DEFAULT 30");
  await add("ALTER TABLE gp_sales ADD COLUMN stripe_fee_cents INTEGER DEFAULT 0");
  await add("ALTER TABLE gp_sellers ADD COLUMN achpay TEXT");   /* where Gigapoo pays them — required before any payout */
  /* 1d — a request is a gig (one-off) or a job (ongoing, at a rate) */
  await add("ALTER TABLE gp_requests ADD COLUMN kind TEXT DEFAULT 'gig'");
  await add("ALTER TABLE gp_requests ADD COLUMN rate TEXT");
  await add("ALTER TABLE gp_requests ADD COLUMN anyone INTEGER DEFAULT 0");   /* no skill needed — anyone could do this */
  /* 21 Sep — THE SCENARIO. His rule for Wise Sleuth: "they should have to request
     a sleuth by describing the scenario. This data and pattern we will learn
     from." A request may carry a topic and a long scenario (what happened,
     what is known, what is wanted); the house reads them all at ?action=scenarios. */
  await add("ALTER TABLE gp_requests ADD COLUMN topic TEXT");
  await add("ALTER TABLE gp_requests ADD COLUMN scenario TEXT");
  await add("ALTER TABLE gp_requests ADD COLUMN known TEXT");
  await add("ALTER TABLE gp_requests ADD COLUMN wanted TEXT");
  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_reviews (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       about TEXT NOT NULL,        /* seller:12 | host:12 | attendee:4 | buyer:jane@x */
       by_who TEXT NOT NULL,       /* seller:5 | attendee:4 | buyer:jane@x */
       by_name TEXT NOT NULL, ref TEXT NOT NULL,
       stars INTEGER NOT NULL, words TEXT,
       made TEXT DEFAULT (datetime('now')),
       UNIQUE (about, by_who, ref))`).run();
  await add("ALTER TABLE gp_sales ADD COLUMN event_id INTEGER");

  /* ⚠ EVENTS — held by a verified seller, dated, placed, PRICED. A $0 event
     is refused: free has no value. Tickets are reserved with a name, an
     email and a telephone, and become sales when paid. */
  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_events (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       host_id INTEGER NOT NULL, site TEXT,
       title TEXT NOT NULL, blurb TEXT,
       starts TEXT NOT NULL,                      /* ISO, the host's local time as given */
       online INTEGER DEFAULT 0, venue TEXT, city TEXT, country TEXT,
       cents INTEGER NOT NULL, seats INTEGER,
       state TEXT DEFAULT 'live',                 /* live | cancelled | done */
       made TEXT DEFAULT (datetime('now')))`).run();
  /* ⚠ ATTENDEES register once with Gigapoo: name, email, telephone, and a
     picture. The host sees all four before letting them in. */
  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_attendees (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, phone TEXT NOT NULL,
       photo_key TEXT, token TEXT NOT NULL,
       made TEXT DEFAULT (datetime('now')))`).run();
  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_tickets (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       event_id INTEGER NOT NULL, attendee_id INTEGER NOT NULL, seats INTEGER DEFAULT 1,
       name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
       state TEXT DEFAULT 'requested',            /* requested | approved (credit) | paid | declined | cancelled */
       sale_id INTEGER, decided TEXT, made TEXT DEFAULT (datetime('now')),
       UNIQUE (event_id, email))`).run();
  await add("ALTER TABLE gp_sales ADD COLUMN rail TEXT");   /* 'achpay.com' on tickets */
  await add("ALTER TABLE gp_events ADD COLUMN photo_key TEXT");   /* the promotional picture, in the header */
  await add("ALTER TABLE gp_tickets ADD COLUMN agreed TEXT");     /* when the attendee agreed to pay */
  await add("ALTER TABLE gp_attendees ADD COLUMN hometown TEXT");
  await add("ALTER TABLE gp_attendees ADD COLUMN city TEXT");      /* present location area */
  await add("ALTER TABLE gp_attendees ADD COLUMN country TEXT");
  await add("ALTER TABLE gp_attendees ADD COLUMN watch_city TEXT");     /* the desired area — news comes from here */
  await add("ALTER TABLE gp_attendees ADD COLUMN watch_country TEXT");
  await add("ALTER TABLE gp_attendees ADD COLUMN alerts INTEGER DEFAULT 1");
  await add("ALTER TABLE gp_attendees ADD COLUMN last_digest TEXT");
  await add("ALTER TABLE gp_sellers ADD COLUMN watch_city TEXT");
  await add("ALTER TABLE gp_sellers ADD COLUMN watch_country TEXT");
  await add("ALTER TABLE gp_sellers ADD COLUMN alerts INTEGER DEFAULT 1");
  await D.prepare(
    `CREATE TABLE IF NOT EXISTS gp_bans (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       host_id INTEGER NOT NULL,                  /* 0 = the house: barred from every event */
       attendee_id INTEGER NOT NULL,
       until TEXT,                                /* NULL = permanent */
       why TEXT, made TEXT DEFAULT (datetime('now')),
       lifted TEXT)`).run();
  await add("ALTER TABLE gp_sales ADD COLUMN host_paid TEXT");     /* when Gigapoo paid the host */
  await add("ALTER TABLE gp_sales ADD COLUMN host_ref TEXT");
  await add("ALTER TABLE gp_events ADD COLUMN copied_from INTEGER"); /* the archive is for copying: this one came from that one */
  await add("ALTER TABLE gp_events ADD COLUMN kind TEXT");
  await add("ALTER TABLE gp_events ADD COLUMN lat REAL");   /* geocoded from the place, for the map with icons */
  await add("ALTER TABLE gp_events ADD COLUMN lng REAL");
  /* the geocode cache: a place as written → a point. OpenStreetMap's
     Nominatim, one call per new place, kept for good. */
  await D.prepare("CREATE TABLE IF NOT EXISTS gp_geo (place TEXT PRIMARY KEY, lat REAL, lng REAL, made TEXT DEFAULT (datetime('now')))").run();            /* the type: walk, talk, dinner, class, game… the host's word, searchable */
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
      from_the_seller: { written: money(f.seller_text_cents), with_a_machine_voice: money(f.seller_voice_cents), with_the_sellers_own_voice: money(f.seller_own_cents) },
      on_a_ticket_per_seat: { from_the_buyer: money(f.ticket_buyer_cents), from_the_host: money(f.ticket_host_cents) } },
    nothing_is_free: NOTHING_FREE,
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
       house_small_bps=?, house_large_bps=?, house_threshold_cents=?, due_days=?, late_days=?, ticket_buyer_cents=?, ticket_host_cents=?, changed=datetime('now') WHERE id=1`)
    .bind(n("buyer_cents"), n("seller_text_cents"), n("seller_voice_cents"), n("seller_own_cents"),
          n("house_small_bps"), n("house_large_bps"), n("house_threshold_cents"), n("due_days"), n("late_days"), n("ticket_buyer_cents"), n("ticket_host_cents")).run();
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
  if (clean(q.get("achpay"))) await env.OVERHANG.prepare("UPDATE gp_sellers SET achpay=? WHERE id=?").bind(shorten(q.get("achpay"), 120), lastId(r)).run();

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
  /* ⚠ THE PROFILE IS THE RECORD. His rule, 21 Sep: "everyone needs a profile
     still" — the work delivered, the events held, every review as written,
     under the person's own name. A record of your own is how value gets seen. */
  const ev = await env.OVERHANG.prepare(EVENT_SQL + " WHERE e.host_id = ? AND e.state = 'live' ORDER BY e.starts DESC LIMIT 30").bind(id).all();
  const hostRev = await env.OVERHANG.prepare("SELECT stars, words, by_name, made FROM gp_reviews WHERE about = ? ORDER BY made DESC LIMIT 50").bind("host:" + id).all();
  const done = await env.OVERHANG.prepare("SELECT COUNT(*) n, SUM(CASE WHEN event_id IS NOT NULL THEN 1 ELSE 0 END) tickets FROM gp_sales WHERE seller_id = ? AND state IN ('paid','released')").bind(id).first();
  const events = (ev.results || []).map(v => pubEvent(v, f, origin));
  return { ok:true, build: BUILD, seller: pubSeller(x, origin),
    reviews: (r.results || []).map(v => ({ stars: v.stars, said: v.words, by: v.buyer_name, on: v.made })),
    as_host: Object.assign(await starsOf(env, "host:" + id), { reviews: (hostRev.results || []).map(v => ({ stars: v.stars, said: v.words, by: v.buyer_name || v.by_name, on: v.made })) }),
    offers: (o.results || []).map(v => pubOffer(v, f)),
    events: events.filter(e => Date.parse(String(e.starts)) >= Date.now() - 6 * 3600000),
    past_events: events.filter(e => Date.parse(String(e.starts)) < Date.now() - 6 * 3600000),
    record: { jobs_delivered: Number(done && done.n) || 0, tickets_sold: Number(done && done.tickets) || 0, events_held: events.length, member_since: x.verified || x.applied } };
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
  if (!amount) return { ok:false, error:"what does it cost? " + NOTHING_FREE };
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
  /* a job is ongoing work at a rate — the rate is required, because free has no value */
  const kind = pick(q.get("kind"), ["gig", "job"]) || "gig", rateS = shorten(q.get("rate"), 40);
  if (kind === "job" && !rateS) missing.push("the pay — a rate like $25/hour or $900/week. " + NOTHING_FREE);
  if (missing.length) return { ok:false, build: BUILD, error:"incomplete", missing };
  const r = await env.OVERHANG.prepare(
    `INSERT INTO gp_requests (site, subject, note, where_, budget_cents, buyer_name, buyer_email, buyer_phone, city, country, kind, rate)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(site, shorten(subject, 160), shorten(q.get("note"), 600) || null, where, cents(q.get("budget")) || null,
          name, email, phone || null, city || null, country || null, kind, kind === "job" ? rateS : null).run();
  if (yes(q.get("anyone"))) await env.OVERHANG.prepare("UPDATE gp_requests SET anyone=1 WHERE id=?").bind(lastId(r)).run();
  /* the scenario, when the site asks for one: the topic, what happened, what is known, what is wanted */
  if (clean(q.get("scenario")) || clean(q.get("topic")))
    await env.OVERHANG.prepare("UPDATE gp_requests SET topic=?, scenario=?, known=?, wanted=? WHERE id=?")
      .bind(shorten(q.get("topic"), 40).toLowerCase() || null, shorten(q.get("scenario"), 4000) || null, shorten(q.get("known"), 2000) || null, shorten(q.get("wanted"), 1000) || null, lastId(r)).run();
  return { ok:true, build: BUILD, id: lastId(r), where, kind, anyone: yes(q.get("anyone")), paying: CREDIT_IS_FOR_EVENTS,
    note: where === "in_place"
      ? "Open for bids. A person will telephone you before any seller sees where the work is. Money is held until you say the job is done."
      : "Open for bids. Nothing is owed and no bid has to be taken." };
}
async function wanted(env, q) {
  const site = clean(q.get("site")) || null, where = pick(q.get("where"), WHERE);
  let sql = `SELECT r.id, r.site, r.subject, r.note, r.where_, r.budget_cents, r.city, r.country, r.buyer_name, r.buyer_verified, r.made, r.kind, r.rate, r.anyone, r.topic, r.scenario, r.wanted,
                    (SELECT COUNT(*) FROM gp_bids b WHERE b.request_id = r.id AND b.state='open') bids,
                    (SELECT COUNT(*) FROM gp_reviews v WHERE v.about = 'buyer:' || r.buyer_email) reviews,
                    (SELECT ROUND(AVG(stars),1) FROM gp_reviews v WHERE v.about = 'buyer:' || r.buyer_email) stars
               FROM gp_requests r WHERE r.state = 'open'`;
  const binds = [];
  if (site) { sql += " AND r.site = ?"; binds.push(site); }
  if (where) { sql += " AND r.where_ = ?"; binds.push(where); }
  const kind = pick(q.get("kind"), ["gig", "job"]);
  if (kind) { sql += " AND COALESCE(r.kind,'gig') = ?"; binds.push(kind); }
  sql += " ORDER BY r.made DESC LIMIT 200";
  const st = env.OVERHANG.prepare(sql);
  const r = await (binds.length ? st.bind(...binds) : st).all();
  /* ⚠ PUBLIC: the buyer's first name and city, never the email, the phone or the address */
  return { ok:true, build: BUILD, site: site || "all", where: where || "all",
    requests: (r.results || []).map(x => ({ id: x.id, site: x.site, subject: x.subject, note: x.note, where: x.where_,
      kind: x.kind || "gig", rate: x.rate || null, anyone: !!x.anyone,
      topic: x.topic || null, scenario: x.scenario || null, wanted: x.wanted || null,
      buyer_reviews: Number(x.reviews) || 0, buyer_stars: (Number(x.reviews) || 0) ? Number(x.stars) : null,
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
/* the scenarios, whole, newest first — the data the house learns from:
   what people need looked into, how they describe it, what they would pay,
   which topics recur, which get bids and which get done */
async function scenarios(env, q) {
  const site = clean(q.get("site")) || null, topic = clean(q.get("topic")).toLowerCase() || null;
  let sql = `SELECT r.*, (SELECT COUNT(*) FROM gp_bids b WHERE b.request_id = r.id) bids,
                    (SELECT COUNT(*) FROM gp_sales s WHERE s.request_id = r.id) sales
               FROM gp_requests r WHERE r.scenario IS NOT NULL`;
  const binds = [];
  if (site) { sql += " AND r.site = ?"; binds.push(site); }
  if (topic) { sql += " AND r.topic = ?"; binds.push(topic); }
  sql += " ORDER BY r.made DESC LIMIT 500";
  const st = env.OVERHANG.prepare(sql); const r = await (binds.length ? st.bind(...binds) : st).all();
  const byTopic = await env.OVERHANG.prepare("SELECT COALESCE(topic,'(none)') topic, COUNT(*) n, SUM(CASE WHEN state='open' THEN 1 ELSE 0 END) open FROM gp_requests WHERE scenario IS NOT NULL GROUP BY topic ORDER BY n DESC").all();
  return { ok:true, build: BUILD, topics: byTopic.results || [], rows: r.results || [] };
}
async function allRequests(env) {
  const r = await env.OVERHANG.prepare(`SELECT r.*, (SELECT COUNT(*) FROM gp_bids b WHERE b.request_id = r.id) bids FROM gp_requests r ORDER BY r.made DESC LIMIT 200`).all();
  return { ok:true, build: BUILD, rows: r.results || [] };
}
async function bid(env, me, q) {
  const rid = q.get("request"), amount = cents(q.get("price"));
  if (!rid) return { ok:false, error:"which request?" };
  if (!amount) return { ok:false, error:"what do you charge for it? " + NOTHING_FREE };
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
  const ev = await env.OVERHANG.prepare(EVENT_SQL + " WHERE e.host_id = ? AND e.state = 'live' ORDER BY e.starts LIMIT 50").bind(me.id).all();
  return { ok:true, build: BUILD, you: pubSeller(Object.assign({}, me, { reviews: 0 }), origin),
    offers: (o.results || []).map(v => pubOffer(v, f)), bids: b.results || [],
    events: (ev.results || []).map(v => pubEvent(v, f, origin)),
    sales: { released: Number(s && s.n) || 0, earned: money(Number(s && s.earned) || 0) },
    paid_through: me.achpay ? ACH + " · " + me.achpay : "nothing on file — add your achpay.com address (?action=bank) or you cannot be paid" };
}

/* ============================================================
   EVENTS — a meetup, a class, a talk, a walk. Held by a verified
   seller, at a date, at a place or online, WITH A PRICE. A ticket
   is reserved with a name, an email and a telephone; it is a sale
   on the site's books the moment it is paid.
   ============================================================ */
/* maps and directions, generated from the place as given — no key, no
   geocoding of ours; the map service finds it from the words */
function mapsFor(v) {
  if (v.online) return { map: null, directions: null, embed: null };
  const place = [v.venue, v.city, v.country].filter(Boolean).join(", ");
  if (!place) return { map: null, directions: null, embed: null };
  const qs = encodeURIComponent(place);
  return { place, map: "https://www.google.com/maps/search/?api=1&query=" + qs,
    directions: "https://www.google.com/maps/dir/?api=1&destination=" + qs,
    embed: "https://maps.google.com/maps?q=" + qs + "&z=14&output=embed" };
}
function pubEvent(v, f, origin) {
  const sold = Number(v.sold) || 0, held = Number(v.held) || 0;
  const m = mapsFor(v);
  return { id: v.id, site: v.site || null, title: v.title, kind: v.kind || null, blurb: v.blurb || null,
    picture: v.photo_key ? ((origin || "") + "/?epic=" + v.id) : null,
    starts: v.starts, online: !!v.online, venue: v.online ? null : (v.venue || null),
    where: v.online ? "online" : [v.city, v.country].filter(Boolean).join(", "),
    map: m.map, directions: m.directions, map_embed: m.embed,
    copied_from: v.copied_from || null,
    price: money(v.cents), buyer_pays: money(v.cents + Number(f.ticket_buyer_cents || 0)),
    seats: v.seats || null, going: sold, waiting: held, left: v.seats ? Math.max(0, v.seats - sold) : null,
    to_attend: "Register with Gigapoo — name, email, telephone and a picture — and ask; the host verifies who is coming. Approval opens your credit line; it settles by ACH through " + ACH + ".",
    state: v.state, made: v.made,
    host: v.host_name ? { id: v.host_id, name: v.host_name, city: v.host_city, country: v.host_country, photo: v.host_photo ? ((origin || "") + "/?photo=" + v.host_id) : null,
      reviews: Number(v.reviews) || 0, stars: (Number(v.reviews) || 0) ? Number(v.stars) : null } : undefined };
}
const EVENT_SQL = `SELECT e.*, s.name host_name, s.city host_city, s.country host_country, s.photo_key host_photo,
                    (SELECT COALESCE(SUM(seats),0) FROM gp_tickets t WHERE t.event_id = e.id AND t.state IN ('approved','paid')) sold,
                    (SELECT COALESCE(SUM(seats),0) FROM gp_tickets t WHERE t.event_id = e.id AND t.state = 'requested') held,
                    (SELECT COUNT(*) FROM gp_ratings g WHERE g.seller_id = s.id) reviews,
                    (SELECT ROUND(AVG(stars),1) FROM gp_ratings g WHERE g.seller_id = s.id) stars
               FROM gp_events e JOIN gp_sellers s ON s.id = e.host_id`;
async function holdEvent(env, me, q) {
  /* ⚠ THE ARCHIVE IS FOR COPYING. copy=<id> starts from any past or present
     event — the host's own or anyone's — and each field given here overrides. */
  let from = null;
  if (q.get("copy")) { from = await env.OVERHANG.prepare("SELECT * FROM gp_events WHERE id = ?").bind(q.get("copy")).first(); if (!from) return { ok:false, error:"no such event to copy" }; }
  const g = (k, fk) => { const v = clean(q.get(k)); return v || (from ? clean(from[fk || k]) : ""); };
  const title = g("title"), amount = cents(q.get("price")) || (from ? from.cents : 0), starts = clean(q.get("starts"));
  const online = q.get("online") != null ? yes(q.get("online")) : !!(from && from.online);
  const city = g("city") || me.city, country = g("country") || me.country;
  const missing = [];
  if (!title || title.length < 6) missing.push("what the event is, in a sentence");
  /* ⚠ NO FREE EVENTS. His rule: free has no value. */
  if (!amount) missing.push("a ticket price — " + NOTHING_FREE);
  else if (amount < MIN_TICKET_CENTS) missing.push("a ticket price of at least " + money(MIN_TICKET_CENTS) + " — free, and nearly free, costs everyone time and problems");
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(starts)) missing.push("when it starts (YYYY-MM-DDTHH:MM)");
  else if (Date.parse(starts) < Date.now() - 3600000) missing.push("a start in the future");
  if (!online && (!city || !country)) missing.push("where it is — city and country — or mark it online");
  if (!online && locationState(me).stale) missing.push("a current location — check in before holding an in-person event");
  if (missing.length) return { ok:false, build: BUILD, error:"incomplete", missing };
  const site = clean(q.get("site")) || me.home_site || null;
  const sr = site ? await bySite(env, site) : null;
  if (site && !sr) return { ok:false, error:"no such site, or that site's market is paused" };
  if (sr && Number(sr.min_age) > 0) { const age = ageOf(me.born); if (age == null || age < Number(sr.min_age)) return { ok:false, error: sr.name + " is for hosts " + sr.min_age + " and older" }; }
  const seatsIn = q.get("seats") != null ? num(q.get("seats")) : (from ? from.seats : null);
  const seats = seatsIn == null ? null : Math.max(1, Math.round(seatsIn));
  const blurb = shorten(q.get("blurb"), 1200) || (from ? from.blurb : null) || null;
  const kind = shorten(q.get("kind"), 40).toLowerCase() || (from ? from.kind : null) || null;
  const venue = online ? null : (shorten(q.get("venue"), 120) || (from ? from.venue : null) || null);
  const r = await env.OVERHANG.prepare(
    `INSERT INTO gp_events (host_id, site, title, blurb, starts, online, venue, city, country, cents, seats, copied_from, kind) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(me.id, site, shorten(title, 120), blurb, starts, online ? 1 : 0, venue, online ? null : city, online ? null : country, amount, seats, from ? from.id : null, kind).run();
  const id = lastId(r), f = await fees(env);
  if (!online) { const pt = await geocode(env, [venue, city, country].filter(Boolean).join(", ")) || await geocode(env, [city, country].filter(Boolean).join(", ")); if (pt) await env.OVERHANG.prepare("UPDATE gp_events SET lat=?, lng=? WHERE id=?").bind(pt.lat, pt.lng, id).run(); }
  /* a copy carries the promotional picture too, unless a new one is posted */
  if (from && from.photo_key) await env.OVERHANG.prepare("UPDATE gp_events SET photo_key=? WHERE id=?").bind(from.photo_key, id).run();
  const m = mapsFor({ online, venue, city, country });
  return { ok:true, build: BUILD, id, price: money(amount), buyer_pays: money(amount + Number(f.ticket_buyer_cents || 0)),
    you_keep_per_ticket: money(amount - Number(f.ticket_host_cents || 0)), starts, where: online ? "online" : city + ", " + country,
    map: m.map, directions: m.directions, copied_from: from ? from.id : null,
    picture: "POST a promotional picture to ?action=event_photo&event=" + id + "&token=… — it heads the event",
    note: "On. Your name, city and country show as the host; your telephone does not. People who ask to come are registered with Gigapoo — name, picture, email, telephone — and you decide who is in. Approval opens their credit line; it settles by ACH through " + ACH + "." };
}
/* ---- the map with icons: a place becomes a point, once ---- */
async function geocode(env, place) {
  place = clean(place); if (!place) return null;
  const key = place.toLowerCase();
  const had = await env.OVERHANG.prepare("SELECT lat, lng FROM gp_geo WHERE place = ?").bind(key).first();
  if (had) return had.lat == null ? null : { lat: had.lat, lng: had.lng };
  let pt = null;
  try {
    const r = await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(place),
      { headers: { "User-Agent": "Gigapoo/1.0 (realroofers@gmail.com)", "Accept": "application/json" } });
    const j = r.ok ? await r.json() : [];
    if (j && j[0]) pt = { lat: Number(j[0].lat), lng: Number(j[0].lon) };
  } catch (e) { pt = null; }
  await env.OVERHANG.prepare("INSERT OR REPLACE INTO gp_geo (place, lat, lng) VALUES (?,?,?)").bind(key, pt ? pt.lat : null, pt ? pt.lng : null).run();
  return pt;
}
/* ~1 km: two decimals. The exact point is never published. */
function coarse(v) { return v == null ? null : Math.round(Number(v) * 100) / 100; }
async function pins(env, q, origin) {
  const what = pick(q.get("pins"), ["events", "sellers"]) || "events", site = clean(q.get("site")) || null;
  const f = await fees(env);
  if (what === "events") {
    let sql = EVENT_SQL + " WHERE e.state = 'live' AND s.state = 'verified' AND e.online = 0 AND e.starts >= datetime('now')";
    const binds = [];
    if (site) { sql += " AND (e.site = ? OR e.site IS NULL)"; binds.push(site); }
    const r = await env.OVERHANG.prepare(sql + " ORDER BY e.starts LIMIT 300").bind(...binds).all();
    const out = [];
    for (const v of (r.results || [])) {
      let lat = v.lat, lng = v.lng;
      if (lat == null) { const pt = await geocode(env, [v.venue, v.city, v.country].filter(Boolean).join(", ")) || await geocode(env, [v.city, v.country].filter(Boolean).join(", ")); if (pt) { lat = pt.lat; lng = pt.lng; await env.OVERHANG.prepare("UPDATE gp_events SET lat=?, lng=? WHERE id=?").bind(lat, lng, v.id).run(); } }
      if (lat == null) continue;
      const e = pubEvent(v, f, origin);
      out.push({ id: e.id, lat, lng, title: e.title, kind: e.kind, starts: e.starts, where: e.where, venue: e.venue, price: e.buyer_pays, going: e.going, picture: e.picture, host: e.host ? e.host.name : null });
    }
    return { ok:true, build: BUILD, pins: out, icon: "event" };
  }
  /* sellers: their point at ~1 km if they shared one; else their city */
  let sql = `SELECT s.id, s.name, s.city, s.country, s.lat, s.lng, s.nomad, s.location_on, s.location_at, s.credential, s.photo_key,
                    (SELECT COUNT(*) FROM gp_offers o WHERE o.seller_id = s.id AND o.state = 'live'` + (site ? " AND (o.site = ?1 OR o.site IS NULL)" : "") + `) offers,
                    (SELECT title FROM gp_offers o WHERE o.seller_id = s.id AND o.state = 'live' ORDER BY made DESC LIMIT 1) latest
               FROM gp_sellers s WHERE s.state = 'verified'`;
  const binds = [];
  if (site) { binds.push(site); sql += " AND s.id NOT IN (SELECT seller_id FROM gp_hidden WHERE site = ?1) AND (s.home_site = ?1 OR s.id IN (SELECT seller_id FROM gp_offers WHERE site = ?1 AND state='live'))"; }
  const st = env.OVERHANG.prepare(sql + " LIMIT 500");
  const r = await (binds.length ? st.bind(...binds) : st).all();
  const out = [];
  for (const s of (r.results || [])) {
    const loc = locationState(s); if (loc.stale) continue;
    let lat = coarse(s.lat), lng = coarse(s.lng);
    if (lat == null) { const pt = await geocode(env, [s.city, s.country].filter(Boolean).join(", ")); if (pt) { lat = coarse(pt.lat); lng = coarse(pt.lng); } }
    if (lat == null) continue;
    out.push({ id: s.id, lat, lng, name: s.name, city: s.city, country: s.country, nomad: !!s.nomad, credential: s.credential || null, offers: Number(s.offers) || 0, latest: s.latest || null, photo: s.photo_key ? ((origin || "") + "/?photo=" + s.id) : null, about: "~1 km — never the exact point" });
  }
  return { ok:true, build: BUILD, pins: out, icon: "seller", rule: "A seller's point is shown to about a kilometre, or at their city. The exact position is never published." };
}

/* the events on a site: what is coming, or with past=1 THE ARCHIVE — every
   event ever held, kept for copying; q= searches title, description, venue,
   city, host — and the pictures come with them */
async function events(env, q, origin) {
  const site = clean(q.get("site")) || null, past = yes(q.get("past")), word = clean(q.get("q")).toLowerCase();
  let sql = EVENT_SQL + " WHERE s.state = 'verified'";
  const binds = [];
  if (past) { sql += " AND e.starts < ?"; binds.push(new Date().toISOString().slice(0, 16)); }
  else { sql += " AND e.state = 'live' AND e.starts >= ?"; binds.push(new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 16)); }
  if (site) { sql += " AND (e.site = ? OR e.site IS NULL) AND s.id NOT IN (SELECT seller_id FROM gp_hidden WHERE site = ?)"; binds.push(site, site); }
  if (word) { sql += " AND (lower(e.title) LIKE ? OR lower(COALESCE(e.blurb,'')) LIKE ? OR lower(COALESCE(e.venue,'')) LIKE ? OR lower(COALESCE(e.city,'')) LIKE ? OR lower(s.name) LIKE ? OR lower(COALESCE(e.kind,'')) LIKE ?)"; for (let i = 0; i < 6; i++) binds.push("%" + word + "%"); }
  const kind = clean(q.get("kind")).toLowerCase();
  if (kind) { sql += " AND lower(COALESCE(e.kind,'')) = ?"; binds.push(kind); }
  sql += past ? " ORDER BY e.starts DESC LIMIT 200" : " ORDER BY e.starts LIMIT 200";
  const r = await env.OVERHANG.prepare(sql).bind(...binds).all();
  const f = await fees(env);
  /* the types on offer, so a reader can pick one — the hosts' own words, counted */
  const kr = await env.OVERHANG.prepare("SELECT lower(kind) kind, COUNT(*) n FROM gp_events WHERE kind IS NOT NULL AND state='live' AND starts >= datetime('now') " + (site ? "AND (site = ? OR site IS NULL) " : "") + "GROUP BY lower(kind) ORDER BY n DESC LIMIT 40").bind(...(site ? [site] : [])).all();
  return { ok:true, build: BUILD, site: site || "all", archive: past, q: word || null, kind: kind || null, kinds: (kr.results || []).map(x => ({ kind: x.kind, n: x.n })),
    events: (r.results || []).map(v => pubEvent(v, f, origin)), rule: NOTHING_FREE,
    note: past ? "The archive. Every detail is kept for copying — a host starts a new event from any of these with ?action=event&copy=<id>." : null };
}
/* one event, in full — and WHO IS COMING: the name and picture of everyone
   the host let in, on credit or paid. His rule: show them. */
async function oneEvent(env, id, origin) {
  const v = await env.OVERHANG.prepare(EVENT_SQL + " WHERE e.id = ?").bind(id).first();
  if (!v) return { ok:false, error:"no such event" };
  const a = await env.OVERHANG.prepare(
    `SELECT t.name, t.seats, t.state, a.id aid, a.photo_key, a.hometown FROM gp_tickets t JOIN gp_attendees a ON a.id = t.attendee_id
      WHERE t.event_id = ? AND t.state IN ('approved','paid') ORDER BY t.decided`).bind(id).all();
  const hostRev = await env.OVERHANG.prepare("SELECT stars, words, by_name, made FROM gp_reviews WHERE about = ? ORDER BY made DESC LIMIT 20").bind("host:" + v.host_id).all();
  return { ok:true, build: BUILD, event: pubEvent(v, await fees(env), origin),
    host_as_host: Object.assign(await starsOf(env, "host:" + v.host_id), { reviews_said: (hostRev.results || []).map(x => ({ stars: x.stars, said: x.words, by: x.by_name, on: x.made })) }),
    attending: (a.results || []).map(t => ({ name: t.name, hometown: t.hometown || null, picture: t.photo_key ? ((origin || "") + "/?apic=" + t.aid) : null, seats: t.seats, paid: t.state === "paid" })),
    copy: "A host starts a new event from this one with ?action=event&copy=" + id + "&starts=…" };
}
/* every picture, searchable through its event: the promotional pictures,
   and the faces of the people who came */
async function pictures(env, q, origin) {
  const word = clean(q.get("q")).toLowerCase(), site = clean(q.get("site")) || null;
  let sql = `SELECT e.id, e.title, e.starts, e.city, e.country, e.photo_key, s.name host FROM gp_events e JOIN gp_sellers s ON s.id = e.host_id WHERE 1=1`;
  const binds = [];
  if (site) { sql += " AND (e.site = ? OR e.site IS NULL)"; binds.push(site); }
  if (word) { sql += " AND (lower(e.title) LIKE ? OR lower(COALESCE(e.blurb,'')) LIKE ? OR lower(COALESCE(e.city,'')) LIKE ? OR lower(s.name) LIKE ?)"; for (let i = 0; i < 4; i++) binds.push("%" + word + "%"); }
  sql += " ORDER BY e.starts DESC LIMIT 100";
  const r = await env.OVERHANG.prepare(sql).bind(...binds).all();
  const out = [];
  for (const e of (r.results || [])) {
    const a = await env.OVERHANG.prepare("SELECT t.name, a.id aid FROM gp_tickets t JOIN gp_attendees a ON a.id = t.attendee_id WHERE t.event_id = ? AND t.state IN ('approved','paid') AND a.photo_key IS NOT NULL").bind(e.id).all();
    out.push({ event: e.id, title: e.title, starts: e.starts, where: [e.city, e.country].filter(Boolean).join(", "), host: e.host,
      picture: e.photo_key ? ((origin || "") + "/?epic=" + e.id) : null,
      people: (a.results || []).map(t => ({ name: t.name, picture: (origin || "") + "/?apic=" + t.aid })) });
  }
  return { ok:true, build: BUILD, q: word || null, events: out };
}
/* ---- the attendee: registered once with Gigapoo, verified by each host ---- */
async function register(env, q) {
  const name = clean(q.get("name")), email = clean(q.get("email")).toLowerCase(), phone = clean(q.get("phone"));
  const hometown = shorten(q.get("hometown"), 80), city = clean(q.get("city")), country = clean(q.get("country"));
  const missing = [];
  if (!name || name.split(/\s+/).length < 2) missing.push("your full name — nobody here is anonymous");
  if (!email || email.indexOf("@") < 1) missing.push("an email address");
  /* ⚠ TELEPHONE REQUIRED OR NO ATTENDANCE. His words. */
  if (!phone || phone.replace(/\D/g, "").length < 7) missing.push("a telephone number — required in the profile, or no attendance");
  if (!hometown) missing.push("your hometown");
  if (!city || !country) missing.push("where you are now — city and country");
  if (missing.length) return { ok:false, build: BUILD, error:"incomplete", missing, note:"All are welcome; security is key. Name, telephone, email, picture, hometown and where you are now — the host sees them all." };
  const had = await env.OVERHANG.prepare("SELECT id, token, photo_key FROM gp_attendees WHERE email = ?").bind(email).first();
  if (had) {
    await env.OVERHANG.prepare("UPDATE gp_attendees SET phone=?, hometown=?, city=?, country=? WHERE id=?").bind(phone, hometown, city, country, had.id).run();
    return { ok:true, build: BUILD, already:true, id: had.id, token: had.token, has_picture: !!had.photo_key,
      note:"That email is registered; telephone, hometown and present location updated. " + (had.photo_key ? "Your picture is on file." : "Add your picture before asking to attend — the host verifies who is coming.") };
  }
  const token = makeToken();
  const r = await env.OVERHANG.prepare("INSERT INTO gp_attendees (name, email, phone, token, hometown, city, country, watch_city, watch_country) VALUES (?,?,?,?,?,?,?,?,?)").bind(name, email, phone, token, hometown, city, country, city, country).run();
  return { ok:true, build: BUILD, id: lastId(r), token, has_picture:false,
    note:"Registered. Now add your picture (POST it to ?action=attendee_photo&token=…) — no picture, no ticket. The host sees your name, your picture and your email before letting you in." };
}
async function byAttendee(env, token) {
  if (!token || String(token).length < 12) return null;
  return await env.OVERHANG.prepare("SELECT * FROM gp_attendees WHERE token = ?").bind(token).first();
}
/* ask to attend: the seat is not taken until the host says yes */
async function attend(env, who, q) {
  const id = q.get("event"), seats = Math.max(1, Math.min(20, Math.round(num(q.get("seats")) || 1)));
  if (!id) return { ok:false, error:"which event?" };
  if (!who.photo_key) return { ok:false, error:"add your picture first — the host verifies who is coming, and a name without a face is not a person" };
  /* ⚠ THE AGREEMENT: a credit line is not a free ticket. No agreement, no request. */
  if (!yes(q.get("agree"))) return { ok:false, error:"agree to pay for your attendance and your accumulated credit (agree=1) — the credit line lets you pay after, not never. " + NO_INTEREST + " " + PAYS_THE_SYSTEM, must_agree:true };
  const v = await env.OVERHANG.prepare(EVENT_SQL + " WHERE e.id = ? AND e.state = 'live'").bind(id).first();
  if (!v) return { ok:false, error:"that event is not on" };
  /* ⚠ THE HOST'S BAN, OR THE HOUSE'S */
  const barred = await env.OVERHANG.prepare(
    "SELECT until, why, host_id FROM gp_bans WHERE attendee_id = ? AND host_id IN (0, ?) AND lifted IS NULL AND (until IS NULL OR until > datetime('now')) ORDER BY host_id LIMIT 1")
    .bind(who.id, v.host_id).first();
  if (barred) return { ok:false, error: (barred.host_id ? "the host of this event has barred you" : "you are barred from events on Gigapoo") + (barred.until ? " until " + String(barred.until).slice(0, 10) : " permanently") + (barred.why ? " — " + barred.why : ""), barred:true };
  const ev = pubEvent(v, await fees(env));
  if (ev.left != null && ev.left < seats) return { ok:false, error: ev.left ? "only " + ev.left + " seat" + (ev.left === 1 ? "" : "s") + " left" : "full" };
  try {
    const r = await env.OVERHANG.prepare("INSERT INTO gp_tickets (event_id, attendee_id, seats, name, email, phone, agreed) VALUES (?,?,?,?,?,?,datetime('now'))").bind(id, who.id, seats, who.name, who.email, who.phone).run();
    return { ok:true, build: BUILD, ticket: lastId(r), event: ev.title, starts: ev.starts, seats, each: ev.buyer_pays, state:"requested",
      agreed: "You agreed to pay " + money((v.cents + Number((await fees(env)).ticket_buyer_cents || 0)) * seats) + " for your attendance, and whatever credit you accumulate. " + NO_INTEREST,
      note: "Asked. The host sees your name, picture and email and decides. If approved, that amount goes on your credit line and settles by ACH through " + ACH + ". " + PAYS_THE_SYSTEM + " " + NOTHING_FREE };
  } catch (e) { return { ok:false, error:"you have already asked to attend this event" }; }
}
async function myTickets(env, who) {
  const r = await env.OVERHANG.prepare(
    `SELECT t.id, t.seats, t.state, t.made, t.decided, e.id event_id, e.title, e.starts, e.online, e.city, e.country, e.venue, e.cents, s.name host,
            (SELECT price_cents + buyer_fee_cents FROM gp_sales x WHERE x.id = t.sale_id) owed_cents,
            (SELECT state FROM gp_sales x WHERE x.id = t.sale_id) sale_state
       FROM gp_tickets t JOIN gp_events e ON e.id = t.event_id JOIN gp_sellers s ON s.id = e.host_id
      WHERE t.attendee_id = ? ORDER BY e.starts DESC LIMIT 100`).bind(who.id).all();
  const rows = (r.results || []).map(v => ({ ticket: v.id, event: v.event_id, title: v.title, starts: v.starts, where: v.online ? "online" : [v.venue, v.city, v.country].filter(Boolean).join(", "),
    host: v.host, seats: v.seats, state: v.state, decided: v.decided || null,
    owed: v.sale_state === "credit" ? money(v.owed_cents) : null, paid: v.sale_state === "paid" }));
  const owed = rows.reduce((a, v) => a + (v.owed ? Number(v.owed.replace(/[$,]/g, "")) : 0), 0);
  return { ok:true, build: BUILD, you: { id: who.id, name: who.name, email: who.email, has_picture: !!who.photo_key, hometown: who.hometown || null, now: [who.city, who.country].filter(Boolean).join(", ") || null, watching: [who.watch_city || who.city, who.watch_country || who.country].filter(Boolean).join(", ") || null, alerts: who.alerts == null ? true : !!who.alerts }, tickets: rows,
    on_credit: "$" + owed.toLocaleString("en-US", { minimumFractionDigits: (owed % 1) ? 2 : 0, maximumFractionDigits: 2 }),
    settles_by: "ACH through " + ACH, interest: "none — " + NO_INTEREST };
}
/* ---- everyone reviews everyone they dealt with: 140 characters, as written ---- */
async function review(env, seller, attendee, q) {
  const about = clean(q.get("about")).toLowerCase(), ref = clean(q.get("ref")), stars = Math.round(Number(q.get("stars"))), words = clean(q.get("words"));
  const m = /^(host|attendee|buyer):(.+)$/.exec(about);
  if (!m) return { ok:false, error:"about=host:<id>, attendee:<id> or buyer:<email>" };
  if (!ref) return { ok:false, error:"which ticket or sale? (&ref=)" };
  if (!(stars >= 1 && stars <= 5)) return { ok:false, error:"one to five stars" };
  if (words.length > REVIEW_MAX) return { ok:false, error: REVIEW_MAX + " characters at most — yours is " + words.length + ". Say it shorter; it is published as written." };
  const kind = m[1], who = m[2];
  let byWho, byName, allowed = false;
  if (seller) {
    byWho = "seller:" + seller.id; byName = seller.name;
    if (kind === "attendee") allowed = !!(await env.OVERHANG.prepare("SELECT t.id FROM gp_tickets t JOIN gp_events e ON e.id = t.event_id WHERE t.id = ? AND t.attendee_id = ? AND e.host_id = ? AND t.state IN ('approved','paid')").bind(ref, who, seller.id).first());
    if (kind === "buyer") allowed = !!(await env.OVERHANG.prepare("SELECT id FROM gp_sales WHERE id = ? AND seller_id = ? AND lower(buyer_email) = ?").bind(ref, seller.id, who).first());
  } else {
    byWho = "attendee:" + attendee.id; byName = attendee.name;
    if (kind === "host") allowed = !!(await env.OVERHANG.prepare("SELECT t.id FROM gp_tickets t JOIN gp_events e ON e.id = t.event_id WHERE t.id = ? AND t.attendee_id = ? AND e.host_id = ? AND t.state IN ('approved','paid')").bind(ref, attendee.id, who).first());
  }
  if (!allowed) return { ok:false, error:"you can only review someone you dealt with, on the ticket or sale you dealt on" };
  try {
    await env.OVERHANG.prepare("INSERT INTO gp_reviews (about, by_who, by_name, ref, stars, words) VALUES (?,?,?,?,?,?)").bind(about, byWho, byName, ref, stars, words || null).run();
  } catch (e) { return { ok:false, error:"you have already reviewed them on that one — a review cannot be changed once it is published" }; }
  return { ok:true, build: BUILD, published:true, about, stars, words: words || null, note:"Published as written, under your name. Nobody can remove it, including us." };
}
async function starsOf(env, about) {
  const r = await env.OVERHANG.prepare("SELECT COUNT(*) n, ROUND(AVG(stars),1) s FROM gp_reviews WHERE about = ?").bind(about).first();
  return { reviews: Number(r && r.n) || 0, stars: (Number(r && r.n) || 0) ? Number(r.s) : null };
}
/* ---- the host's side: who asked, and yes or no ---- */
async function guests(env, me, eventId, origin) {
  if (!eventId) return { ok:false, error:"which event?" };
  const e = await env.OVERHANG.prepare("SELECT * FROM gp_events WHERE id = ? AND host_id = ?").bind(eventId, me.id).first();
  if (!e) return { ok:false, error:"not your event" };
  const r = await env.OVERHANG.prepare(
    `SELECT t.*, a.photo_key, a.hometown, a.city, a.country, (SELECT state FROM gp_sales x WHERE x.id = t.sale_id) sale_state,
            (SELECT COUNT(*) FROM gp_reviews v WHERE v.about = 'attendee:' || t.attendee_id) reviews,
            (SELECT ROUND(AVG(stars),1) FROM gp_reviews v WHERE v.about = 'attendee:' || t.attendee_id) stars,
            (SELECT COUNT(*) FROM gp_bans b WHERE b.attendee_id = t.attendee_id AND b.host_id IN (0, ?) AND b.lifted IS NULL AND (b.until IS NULL OR b.until > datetime('now'))) barred
       FROM gp_tickets t JOIN gp_attendees a ON a.id = t.attendee_id WHERE t.event_id = ? ORDER BY t.state, t.made`).bind(me.id, eventId).all();
  /* ⚠ THE HOST SEES THE FACE, THE NAME, THE EMAIL, THE TELEPHONE, THE HOMETOWN AND WHERE THEY ARE NOW — that is the verification */
  return { ok:true, build: BUILD, event: { id: e.id, title: e.title, starts: e.starts, seats: e.seats },
    guests: (r.results || []).map(t => ({ ticket: t.id, attendee: t.attendee_id, name: t.name, email: t.email, phone: t.phone,
      hometown: t.hometown || null, now: [t.city, t.country].filter(Boolean).join(", ") || null, barred: !!t.barred,
      reviews: Number(t.reviews) || 0, stars: (Number(t.reviews) || 0) ? Number(t.stars) : null,
      picture: t.photo_key ? ((origin || "") + "/?apic=" + t.attendee_id) : null,
      seats: t.seats, state: t.state, asked: t.made, decided: t.decided || null,
      money: t.sale_state === "credit" ? "on credit — settles by ACH" : t.sale_state === "paid" ? "paid" : null })) };
}
/* ---- what is new near a member, and the member's watch area ---- */
async function watch(env, table, who, q) {
  const city = clean(q.get("city")) || who.watch_city || who.city, country = clean(q.get("country")) || who.watch_country || who.country;
  const alerts = q.get("alerts") != null ? (yes(q.get("alerts")) ? 1 : 0) : (who.alerts == null ? 1 : Number(who.alerts));
  if (!city || !country) return { ok:false, error:"the area you want news from — city and country" };
  await env.OVERHANG.prepare("UPDATE " + table + " SET watch_city=?, watch_country=?, alerts=? WHERE id=?").bind(city, country, alerts, who.id).run();
  return { ok:true, build: BUILD, watching: city + ", " + country, alerts: !!alerts, note: alerts ? "You will hear what is new in " + city + " — events and gig requests. Change it whenever you travel." : "Alerts off. Your area is kept; turn them on any time." };
}
/* the news in an area: events coming up there (or online) and requests
   posted there, in the last `days` days */
async function news(env, city, country, days, origin) {
  city = clean(city).toLowerCase(); country = clean(country).toLowerCase();
  if (!city) return { ok:false, error:"no area on file — set one with ?action=watch" };
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 19).replace("T", " ");
  const ev = await env.OVERHANG.prepare(EVENT_SQL + " WHERE e.state = 'live' AND s.state = 'verified' AND e.made >= ? AND e.starts >= datetime('now') AND (e.online = 1 OR (lower(e.city) = ? AND lower(COALESCE(e.country,'')) = ?)) ORDER BY e.starts LIMIT 50").bind(since, city, country).all();
  const rq = await env.OVERHANG.prepare("SELECT id, site, subject, where_, kind, rate, budget_cents, city, country, buyer_name, made FROM gp_requests WHERE state = 'open' AND made >= ? AND (where_ = 'remote' OR (lower(city) = ? AND lower(COALESCE(country,'')) = ?)) ORDER BY made DESC LIMIT 50").bind(since, city, country).all();
  const f = await fees(env);
  return { ok:true, build: BUILD, area: city + ", " + country, since_days: days,
    events: (ev.results || []).map(v => pubEvent(v, f, origin)),
    requests: (rq.results || []).map(x => ({ id: x.id, site: x.site, subject: x.subject, kind: x.kind || "gig", rate: x.rate || null, where: x.where_, budget: x.budget_cents ? money(x.budget_cents) : null, near: x.where_ === "in_place" && x.city ? x.city + ", " + x.country : "remote", by: String(x.buyer_name || "").split(/\s+/)[0], made: x.made })) };
}
/* the digest: one message per member with alerts on, from their watch area.
   Sent through MAIL (Resend-shaped: POST MAIL_URL with {from,to,subject,text})
   when it is bound; otherwise returned, ready to send by hand. */
async function digest(env, q, origin) {
  const days = Math.max(1, Math.min(30, Math.round(num(q.get("days")) || 7))), send = yes(q.get("send")) && !!(env.MAIL_URL && env.MAIL_KEY);
  const members = [];
  const A = await env.OVERHANG.prepare("SELECT id, name, email, COALESCE(watch_city, city) city, COALESCE(watch_country, country) country FROM gp_attendees WHERE COALESCE(alerts,1) = 1").all();
  const S = await env.OVERHANG.prepare("SELECT id, name, email, COALESCE(watch_city, city) city, COALESCE(watch_country, country) country FROM gp_sellers WHERE state = 'verified' AND COALESCE(alerts,1) = 1").all();
  const seen = {};
  for (const m of [...(A.results || []), ...(S.results || [])]) { if (!m.email || seen[m.email]) continue; seen[m.email] = 1; members.push(m); }
  const out = [], byArea = {};
  for (const m of members) {
    const k = (m.city + "|" + m.country).toLowerCase();
    if (!byArea[k]) byArea[k] = await news(env, m.city, m.country, days, origin);
    const n = byArea[k]; if (!n.ok || (!n.events.length && !n.requests.length)) continue;
    const lines = ["New near " + m.city + " on Gigapoo, last " + days + " days:", ""];
    n.events.forEach(e => lines.push("EVENT · " + e.title + " — " + String(e.starts).replace("T", " ") + " · " + e.where + " · " + e.buyer_pays + " a seat" + (e.host ? " · held by " + e.host.name : "")));
    n.requests.forEach(r => lines.push((r.kind === "job" ? "JOB" : "GIG") + " · " + r.subject + (r.rate ? " — " + r.rate : r.budget ? " — budget " + r.budget : "") + " · " + r.near));
    lines.push("", "Change the area you hear from whenever you travel: gigapoo.com. Free has no value here.");
    const msg = { to: m.email, name: m.name, area: m.city + ", " + m.country, subject: "New near " + m.city + ": " + n.events.length + " event" + (n.events.length === 1 ? "" : "s") + ", " + n.requests.length + " gig" + (n.requests.length === 1 ? "" : "s"), text: lines.join("\n") };
    if (send) {
      try {
        const r = await fetch(env.MAIL_URL, { method: "POST", headers: { "Authorization": "Bearer " + env.MAIL_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ from: env.MAIL_FROM || "Gigapoo <news@gigapoo.com>", to: [m.email], subject: msg.subject, text: msg.text }) });
        msg.sent = r.ok; if (!r.ok) msg.error = (await r.text()).slice(0, 200);
      } catch (e) { msg.sent = false; msg.error = String(e); }
    }
    out.push(msg);
  }
  return { ok:true, build: BUILD, days, members: members.length, messages: out.length, sent: send, mail_bound: !!(env.MAIL_URL && env.MAIL_KEY),
    note: send ? null : (env.MAIL_URL ? "Add &send=1 to send." : "No MAIL binding (MAIL_URL, MAIL_KEY, MAIL_FROM) — set them with cf.ps1 setvar and the digest sends itself; until then, these are the messages."),
    digest: out };
}

/* where Gigapoo pays the seller: their achpay.com address */
async function bank(env, me, q) {
  const a = shorten(q.get("achpay"), 120);
  if (!a) return { ok:false, error:"your achpay.com address (the email or handle achpay knows you by)" };
  await env.OVERHANG.prepare("UPDATE gp_sellers SET achpay=?, us_bank=1 WHERE id=?").bind(a, me.id).run();
  return { ok:true, build: BUILD, achpay: a, note:"On file. Gigapoo pays you by ACH through " + ACH + " — nothing else. On a card-paid gig, Stripe's fee comes off your side." };
}
/* ---- Stripe in: a Checkout page for one gig, and the webhook that books it ---- */
function form(o) { return Object.keys(o).map(k => encodeURIComponent(k) + "=" + encodeURIComponent(o[k])).join("&"); }
async function checkout(env, site, q, origin) {
  if (!env.STRIPE_SECRET) return { ok:false, error:"Stripe is not configured on the engine yet (STRIPE_SECRET) — until then a gig is booked with ?action=sale", not_configured:true };
  const offerId = q.get("offer"), email = clean(q.get("buyer_email")).toLowerCase(), name = clean(q.get("name"));
  if (!offerId) return { ok:false, error:"which offer?" };
  if (!email || email.indexOf("@") < 1) return { ok:false, error:"the buyer's email" };
  const o = await env.OVERHANG.prepare("SELECT o.*, s.name seller_name, s.achpay FROM gp_offers o JOIN gp_sellers s ON s.id = o.seller_id WHERE o.id = ? AND o.state = 'live' AND s.state = 'verified'").bind(offerId).first();
  if (!o) return { ok:false, error:"no such offer" };
  if (!o.achpay) return { ok:false, error: o.seller_name + " cannot be paid yet — no achpay.com address on file. Ask them to add it; then buy." };
  const f = await fees(env), total = o.cents + f.buyer_cents;
  const body = form({
    "mode": "payment", "customer_email": email,
    "line_items[0][quantity]": 1, "line_items[0][price_data][currency]": "usd", "line_items[0][price_data][unit_amount]": total,
    "line_items[0][price_data][product_data][name]": o.title, "line_items[0][price_data][product_data][description]": "by " + o.seller_name + " · " + money(o.cents) + " to the seller + " + money(f.buyer_cents) + " flat fee",
    "metadata[site]": site.key, "metadata[seller]": o.seller_id, "metadata[offer]": o.id, "metadata[buyer_email]": email, "metadata[buyer_name]": name, "metadata[delivery]": o.delivery || "text", "metadata[where]": o.where_ || "remote",
    "success_url": clean(q.get("success")) || ("https://gigapoo.com/?paid=" + o.id), "cancel_url": clean(q.get("cancel")) || "https://gigapoo.com/"
  });
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { "Authorization": "Bearer " + env.STRIPE_SECRET, "Content-Type": "application/x-www-form-urlencoded" }, body });
  const j = await r.json();
  if (!r.ok) return { ok:false, error:"Stripe: " + ((j.error && j.error.message) || r.status) };
  return { ok:true, build: BUILD, url: j.url, session: j.id, total: money(total), note:"Send the buyer to url. When they pay, Stripe calls the webhook and the sale goes on the books; the seller absorbs Stripe's fee." };
}
async function stripeHook(env, req) {
  if (!env.STRIPE_WEBHOOK_SECRET) return { ok:false, error:"STRIPE_WEBHOOK_SECRET not set" };
  const payload = await req.text(), sig = req.headers.get("Stripe-Signature") || "";
  const parts = Object.fromEntries(sig.split(",").map(x => x.split("=")));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(parts.t + "." + payload)))).map(b => b.toString(16).padStart(2, "0")).join("");
  if (mac !== parts.v1) return { ok:false, error:"bad signature" };
  const ev = JSON.parse(payload);
  if (ev.type !== "checkout.session.completed") return { ok:true, ignored: ev.type };
  const s = ev.data.object, m = s.metadata || {};
  const site = await siteRow(env, m.site); if (!site) return { ok:false, error:"unknown site in metadata" };
  const f = await fees(env);
  const price = Number(s.amount_total || 0) - f.buyer_cents;   /* what the buyer paid, less our flat fee, is the seller's price */
  const q = new URLSearchParams({ seller: m.seller, offer: m.offer, price: (price / 100).toFixed(2), buyer_email: m.buyer_email || s.customer_email || "", delivery: m.delivery || "text", where: m.where || "remote", ref: "stripe:" + s.id, rail: "stripe" });
  return await sale(env, site, q);
}

/* THE HOST REACHES THEIR GUESTS. His ask, 20 Sep: a list of telephone
   numbers so the coordinator can text and email a message — texting through
   the creator's own phone, in small bulk. So: the numbers and the emails of
   everyone in (or everyone who asked), a `sms:` link that opens the host's
   own messaging app with all of them and the message, and a `mailto:` with
   all of them in bcc. Nothing is sent by the engine; the host sends it, from
   their phone, under their name. */
async function reach(env, me, q) {
  const eventId = q.get("event"); if (!eventId) return { ok:false, error:"which event?" };
  const e = await env.OVERHANG.prepare("SELECT * FROM gp_events WHERE id = ? AND host_id = ?").bind(eventId, me.id).first();
  if (!e) return { ok:false, error:"not your event" };
  const who = pick(q.get("who"), ["in", "asked", "all"]) || "in";
  const states = who === "in" ? "('approved','paid')" : who === "asked" ? "('requested')" : "('requested','approved','paid')";
  const r = await env.OVERHANG.prepare("SELECT name, email, phone, seats, state FROM gp_tickets WHERE event_id = ? AND state IN " + states + " ORDER BY name").bind(eventId).all();
  const rows = r.results || [];
  const phones = rows.map(x => x.phone.replace(/[^\d+]/g, "")).filter(Boolean);
  const emails = rows.map(x => x.email).filter(Boolean);
  const msg = clean(q.get("message")) || (e.title + " — " + String(e.starts).replace("T", " ") + (e.online ? ", online" : ", " + [e.venue, e.city].filter(Boolean).join(", ")) + ". See you there. — " + me.name);
  const uniq = a => a.filter((v, i) => a.indexOf(v) === i);
  return { ok:true, build: BUILD, event: { id: e.id, title: e.title, starts: e.starts }, who, count: rows.length,
    people: rows.map(x => ({ name: x.name, phone: x.phone, email: x.email, seats: x.seats, state: x.state })),
    phones: uniq(phones).join(", "), emails: uniq(emails).join(", "),
    text_them: "sms:" + uniq(phones).join(",") + "?body=" + encodeURIComponent(msg),          /* Android; iPhone reads it too on most versions */
    text_them_ios: "sms:/open?addresses=" + uniq(phones).join(",") + "&body=" + encodeURIComponent(msg),
    email_them: "mailto:?bcc=" + encodeURIComponent(uniq(emails).join(",")) + "&subject=" + encodeURIComponent(e.title) + "&body=" + encodeURIComponent(msg),
    message: msg,
    note: "Sent from your own phone and email, under your name. Small bulk: phones cap a group text at a few dozen; split a big list. The engine sends nothing itself." };
}

/* the host bars an attendee from their events — for N days, or for good.
   The house (host_id 0) bars from every event. A ban is never deleted; it
   is lifted, and the record stays. */
async function ban(env, hostId, q, on) {
  const aid = q.get("attendee"); if (!aid) return { ok:false, error:"which attendee? (&attendee=id)" };
  const who = await env.OVERHANG.prepare("SELECT id, name FROM gp_attendees WHERE id = ?").bind(aid).first();
  if (!who) return { ok:false, error:"no such attendee" };
  if (!on) {
    await env.OVERHANG.prepare("UPDATE gp_bans SET lifted=datetime('now') WHERE attendee_id=? AND host_id=? AND lifted IS NULL").bind(aid, hostId).run();
    return { ok:true, build: BUILD, attendee: who.id, name: who.name, barred:false };
  }
  const days = num(q.get("days"));
  const until = days && days > 0 ? new Date(Date.now() + days * 86400000).toISOString().slice(0, 19).replace("T", " ") : null;
  await env.OVERHANG.prepare("INSERT INTO gp_bans (host_id, attendee_id, until, why) VALUES (?,?,?,?)").bind(hostId, aid, until, shorten(q.get("why"), 200) || null).run();
  return { ok:true, build: BUILD, attendee: who.id, name: who.name, barred:true, until: until ? until.slice(0, 10) : "permanently",
    from: hostId ? "your events" : "every event on Gigapoo", note:"Barred. They cannot ask to attend; a pending request of theirs should be declined. The record stays even when lifted." };
}
async function decide(env, me, ticketId, approve) {
  if (!ticketId) return { ok:false, error:"which ticket?" };
  const t = await env.OVERHANG.prepare("SELECT t.*, e.host_id, e.site, e.cents, e.seats event_seats, e.title FROM gp_tickets t JOIN gp_events e ON e.id = t.event_id WHERE t.id = ?").bind(ticketId).first();
  if (!t || t.host_id !== me.id) return { ok:false, error:"not your guest" };
  if (t.state !== "requested") return { ok:false, error:"that ticket is already " + t.state };
  if (!approve) {
    await env.OVERHANG.prepare("UPDATE gp_tickets SET state='declined', decided=datetime('now') WHERE id=?").bind(ticketId).run();
    return { ok:true, build: BUILD, ticket: Number(ticketId), state:"declined" };
  }
  const v = await env.OVERHANG.prepare(EVENT_SQL + " WHERE e.id = ?").bind(t.event_id).first();
  const f = await fees(env), ev = pubEvent(v, f);
  if (ev.left != null && ev.left < t.seats) return { ok:false, error: ev.left ? "only " + ev.left + " seat" + (ev.left === 1 ? "" : "s") + " left" : "full" };
  /* ⚠ APPROVAL IS THE CREDIT LINE: on the books now, in state 'credit'.
     The host and the house carry it until the ACH clears. */
  const amount = t.cents * t.seats;
  const r = await env.OVERHANG.prepare(
    `INSERT INTO gp_sales (site, seller_id, event_id, buyer_email, price_cents, buyer_fee_cents, seller_fee_cents, site_share_cents, where_, state, ref, rail)
     VALUES (?,?,?,?,?,?,?,0,'in_place','credit',?,?)`)
    .bind(t.site || "gigapoo", me.id, t.event_id, t.email, amount, Number(f.ticket_buyer_cents || 0) * t.seats, Number(f.ticket_host_cents || 0) * t.seats, "ticket-" + ticketId, ACH).run();
  await env.OVERHANG.prepare("UPDATE gp_tickets SET state='approved', decided=datetime('now'), sale_id=? WHERE id=?").bind(lastId(r), ticketId).run();
  return { ok:true, build: BUILD, ticket: Number(ticketId), state:"approved", guest: t.name, seats: t.seats,
    on_credit: money(amount + Number(f.ticket_buyer_cents || 0) * t.seats), you_receive: money(amount - Number(f.ticket_host_cents || 0) * t.seats),
    settles_by: "ACH through " + ACH,
    note: "In. The amount is on the books as credit — owed, not yet received. They agreed to pay it when they asked. " + PAYS_THE_SYSTEM + " You and Gigapoo carry the credit until the ACH clears; a larger payment received is worth the wait." };
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
  const words = clean(q.get("words"));
  if (words.length > REVIEW_MAX) missing.push(REVIEW_MAX + " characters at most — yours is " + words.length);
  if (missing.length) return { ok:false, build: BUILD, error:"incomplete", missing };
  const s = await env.OVERHANG.prepare("SELECT id FROM gp_sellers WHERE id = ? AND state = 'verified'").bind(seller).first();
  if (!s) return { ok:false, error:"no such seller" };
  try {
    await env.OVERHANG.prepare("INSERT INTO gp_ratings (seller_id, ref, buyer_name, buyer_email, stars, words) VALUES (?,?,?,?,?,?)")
      .bind(seller, ref, name, email, stars, words || null).run();
    await env.OVERHANG.prepare("INSERT OR IGNORE INTO gp_reviews (about, by_who, by_name, ref, stars, words) VALUES (?,?,?,?,?,?)")
      .bind("seller:" + seller, "buyer:" + email, name, ref, stars, words || null).run();
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
  /* credit counts: an approved ticket is a sale the host and the house
     carry until the ACH clears — the bill does not wait for it */
  const t = await env.OVERHANG.prepare(
    "SELECT COUNT(*) sales, COALESCE(SUM(price_cents),0) gross, COALESCE(SUM(CASE WHEN state='credit' THEN price_cents ELSE 0 END),0) on_credit, COALESCE(SUM(CASE WHEN event_id IS NOT NULL THEN price_cents ELSE 0 END),0) tickets FROM gp_sales WHERE site = ? AND state <> 'refunded' AND made >= ? AND made < ?")
    .bind(key, h.from, h.to).first();
  /* gigs and jobs at the half's rate; EVENT TICKETS AT 5% OF THE SIX-MONTH TOTAL, his rule */
  const gross = Number(t && t.gross) || 0, tickets = Number(t && t.tickets) || 0, gigs = gross - tickets;
  const rate = houseRate(f, gigs), due = Math.round(gigs * rate / 10000) + Math.round(tickets * Number(f.house_large_bps) / 10000);
  return { half: h.half, from: h.from, to: h.to, sales: Number(t && t.sales) || 0, gross_cents: gross, gross: money(gross), on_credit: money(Number(t && t.on_credit) || 0), settles_by: "ACH through " + ACH,
    gigs_and_jobs: money(gigs), rate_bps: rate, rate: pct(rate), event_tickets: money(tickets), ticket_rate: pct(Number(f.house_large_bps)),
    due_cents: due, due: money(due) };
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
  const rows = await env.OVERHANG.prepare("SELECT id, made, where_, seller_id, price_cents, buyer_fee_cents, seller_fee_cents, state, ref, event_id, rail FROM gp_sales WHERE site = ? ORDER BY made DESC LIMIT 200").bind(site.key).all();
  const inv = await env.OVERHANG.prepare("SELECT * FROM gp_invoices WHERE site = ? ORDER BY period_from DESC").bind(site.key).all();
  const g = await gate(env, site.key);
  return { ok:true, build: BUILD, site: Object.assign(pubSite(site), { state: site.state, paused: !!(g && g.off), why: g && g.off ? g.why : null }),
    all_time: { sales: Number(t && t.sales) || 0, gross: money(Number(t && t.gross) || 0), flat_fees_collected_by_gigapoo: money(Number(t && t.fees) || 0) },
    this_half: await halfBooks(env, f, site.key, halfOf(new Date())),
    terms: "Every six months Gigapoo bills " + pct(f.house_small_bps) + " of the half-year's sales on this site, or " + pct(f.house_large_bps) + " once they pass " + money(f.house_threshold_cents) + "; due in " + Number(f.due_days) + " days; " + Number(f.late_days) + " days late and the market here is switched off until paid.",
    invoices: (inv.results || []).map(pubInvoice),
    sales: (rows.results || []).map(v => ({ id: v.id, made: v.made, where: v.where_, seller: v.seller_id, price: money(v.price_cents), state: v.state, ref: v.ref || null, event: v.event_id || null, rail: v.rail || null })) };
}

/* ⚠ A SALE IS RECORDED HERE, ON EVERY SITE, OURS INCLUDED. The pay desk
   calls it when a buyer pays; a site with its own checkout calls it with
   its key. The books the house bills from are these rows. */
async function sale(env, site, q) {
  let sellerId = q.get("seller"), amount = cents(q.get("price")), eventId = q.get("event") || null, buyerEmail = clean(q.get("buyer_email")).toLowerCase() || null;
  /* a paid ticket: the host is the seller, the price is seats × the ticket */
  let ticket = null;
  if (q.get("ticket")) {
    ticket = await env.OVERHANG.prepare("SELECT t.*, e.host_id, e.cents FROM gp_tickets t JOIN gp_events e ON e.id = t.event_id WHERE t.id = ?").bind(q.get("ticket")).first();
    if (!ticket) return { ok:false, error:"no such ticket" };
    if (ticket.state === "paid") return { ok:true, build: BUILD, already:true, id: ticket.sale_id, note:"That ticket is already paid and on the books." };
    if (ticket.state !== "approved") return { ok:false, error:"that ticket is " + ticket.state + " — the host has not let them in" };
    /* ⚠ THE ACH CLEARED: the credit line closes. The sale was on the books
       at approval; it turns from 'credit' to 'paid' — no second row. */
    if (ticket.sale_id) {
      await env.OVERHANG.prepare("UPDATE gp_sales SET state='paid', rail=COALESCE(?, rail), ref=COALESCE(?, ref) WHERE id=? AND state='credit'").bind(clean(q.get("rail")) || ACH, clean(q.get("ref")) || null, ticket.sale_id).run();
      await env.OVERHANG.prepare("UPDATE gp_tickets SET state='paid' WHERE id=?").bind(ticket.id).run();
      const f0 = await fees(env), h0 = await halfBooks(env, f0, site.key, halfOf(new Date()));
      return { ok:true, build: BUILD, id: ticket.sale_id, site: site.key, kind:"ticket", state:"paid", settled_by: clean(q.get("rail")) || ACH,
        guest: ticket.name, seats: ticket.seats, this_half: { gross: h0.gross, sales: h0.sales, gigapoo_is_owed_so_far: h0.due + " (" + h0.rate + ")" } };
    }
    sellerId = ticket.host_id; eventId = ticket.event_id; amount = amount || ticket.cents * (ticket.seats || 1); buyerEmail = buyerEmail || ticket.email;
  }
  if (!sellerId) return { ok:false, error:"which seller?" };
  if (!amount) return { ok:false, error:"the price paid, in dollars. " + NOTHING_FREE };
  const s = await env.OVERHANG.prepare("SELECT id, name FROM gp_sellers WHERE id = ? AND state = 'verified'").bind(sellerId).first();
  if (!s) return { ok:false, error:"no such verified seller" };
  const f = await fees(env);
  let delivery = pick(q.get("delivery"), DELIVERY);
  const offerId = q.get("offer") || null;
  if (offerId && !delivery) { const o = await env.OVERHANG.prepare("SELECT delivery FROM gp_offers WHERE id = ?").bind(offerId).first(); delivery = o ? o.delivery : null; }
  const where = pick(q.get("where"), WHERE) || (eventId ? "in_place" : "remote");
  const seatsN = ticket ? (Number(ticket.seats) || 1) : Math.max(1, Math.round(num(q.get("seats")) || 1));
  const ref = clean(q.get("ref")) || null;
  /* the rail: stripe for a card-paid gig — Stripe's fee comes off the seller's side */
  const rail = pick(q.get("rail"), ["stripe", "achpay.com", "cash", "other"]) || (eventId ? ACH : null);
  const stripeFee = rail === "stripe" ? Math.round((amount + f.buyer_cents) * Number(f.stripe_bps || 0) / 10000) + Number(f.stripe_fixed_cents || 0) : 0;
  if (ref) { const had = await env.OVERHANG.prepare("SELECT id FROM gp_sales WHERE site = ? AND ref = ?").bind(site.key, ref).first();
    if (had) return { ok:true, build: BUILD, already:true, id: had.id, note:"That reference is already on the books." }; }
  const r = await env.OVERHANG.prepare(
    `INSERT INTO gp_sales (site, seller_id, offer_id, request_id, event_id, buyer_email, price_cents, buyer_fee_cents, seller_fee_cents, site_share_cents, where_, state, ref, rail, stripe_fee_cents)
     VALUES (?,?,?,?,?,?,?,?,?,0,?,?,?,?,?)`)
    .bind(site.key, s.id, offerId, q.get("request") || null, eventId, buyerEmail, amount,
          eventId ? Number(f.ticket_buyer_cents || 0) * seatsN : f.buyer_cents, eventId ? Number(f.ticket_host_cents || 0) * seatsN : sellerFee(f, delivery || "text"),
          where, (where === "in_place" && !eventId) ? "held" : "paid", ref, rail, stripeFee).run();
  const saleId = lastId(r);
  if (ticket) await env.OVERHANG.prepare("UPDATE gp_tickets SET state='paid', sale_id=? WHERE id=?").bind(saleId, ticket.id).run();
  const h = await halfBooks(env, f, site.key, halfOf(new Date()));
  return { ok:true, build: BUILD, id: saleId, site: site.key, seller: s.name, price: money(amount), kind: eventId ? "ticket" : (q.get("request") ? "request" : "gig"),
    rail, stripe_fee_absorbed_by_seller: stripeFee ? money(stripeFee) : null,
    seller_keeps: money(amount - (eventId ? Number(f.ticket_host_cents || 0) * seatsN : sellerFee(f, delivery || "text")) - stripeFee),
    buyer_paid: money(amount + (eventId ? Number(f.ticket_buyer_cents || 0) * seatsN : f.buyer_cents)),
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
/* Gigapoo paid the host (or the seller) for a sale — by ACH through achpay.com */
async function payout(env, id, ref) {
  if (!id) return { ok:false, error:"which sale? (&sale=)" };
  const v = await env.OVERHANG.prepare("SELECT * FROM gp_sales WHERE id = ?").bind(id).first();
  if (!v) return { ok:false, error:"no such sale" };
  if (v.state !== "paid" && v.state !== "released") return { ok:false, error:"that sale is " + v.state + " — Gigapoo has not received it yet, so it does not pay it out" };
  const s = await env.OVERHANG.prepare("SELECT id, name, achpay FROM gp_sellers WHERE id = ?").bind(v.seller_id).first();
  /* ⚠ PAID BY ACH THROUGH ACHPAY.COM ONLY — no achpay on file, no payout */
  if (!s || !s.achpay) return { ok:false, error:(s ? s.name : "the seller") + " has no achpay.com address on file — Gigapoo pays only through " + ACH + ". They add it with ?action=bank&token=…&achpay=…", needs_achpay:true };
  await env.OVERHANG.prepare("UPDATE gp_sales SET host_paid=datetime('now'), host_ref=? WHERE id=?").bind(clean(ref) || null, id).run();
  return { ok:true, build: BUILD, sale: Number(id), seller: v.seller_id, to: s.achpay, paid_out: money(v.price_cents - v.seller_fee_cents - Number(v.stripe_fee_cents || 0)), stripe_fee_absorbed: Number(v.stripe_fee_cents || 0) ? money(v.stripe_fee_cents) : null, by: ACH, ref: clean(ref) || null };
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
    events: await one("SELECT COUNT(*) all_of_them, SUM(CASE WHEN starts >= datetime('now') THEN 1 ELSE 0 END) coming FROM gp_events WHERE state='live'"),
    tickets: await one("SELECT COUNT(*) all_of_them, SUM(CASE WHEN state='paid' THEN seats ELSE 0 END) paid_seats FROM gp_tickets"),
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
/* one store for three kinds of picture: a seller's face, an attendee's face,
   an event's promotional picture. All kept in R2 under gp/, all searchable
   through the event they belong to. */
const PIC = { seller: { table: "gp_sellers", prefix: "seller", q: "photo", live: " AND state='verified'" },
              attendee: { table: "gp_attendees", prefix: "attendee", q: "apic", live: "" },
              event: { table: "gp_events", prefix: "event", q: "epic", live: "" } };
async function putPhoto(env, me, req, origin, which) {
  const p = PIC[which || "seller"];
  if (!env.IMG) return { ok:false, error:"no IMG binding" };
  if (req.method !== "POST" && req.method !== "PUT") return { ok:false, error:"POST the image as the body" };
  const bytes = await req.arrayBuffer();
  if (!bytes.byteLength) return { ok:false, error:"nothing was sent" };
  if (bytes.byteLength > PHOTO_MAX) return { ok:false, error:"two megabytes at most" };
  const kind = sniff(bytes);
  if (!kind) return { ok:false, error:"a JPEG, PNG or WebP — read from the file itself, not its name. No SVG, ever." };
  const key = "gp/" + p.prefix + "-" + me.id + "." + kind.ext;
  await env.IMG.put(key, bytes, { httpMetadata: { contentType: kind.type } });
  await env.OVERHANG.prepare("UPDATE " + p.table + " SET photo_key=? WHERE id=?").bind(key, me.id).run();
  return { ok:true, build: BUILD, shows_at: (origin || "") + "/?" + p.q + "=" + me.id,
    note: which === "event" ? "Up — it heads the event and is searchable with it." : "A picture out of a phone often carries where it was taken. If that matters to you, use one that does not." };
}
async function servePhoto(env, id, which) {
  const p = PIC[which || "seller"];
  const s = await env.OVERHANG.prepare("SELECT photo_key FROM " + p.table + " WHERE id = ?" + p.live).bind(id).first();
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
