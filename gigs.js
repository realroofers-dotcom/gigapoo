/* BUILT 2026-09-21 · gigapoo gigs.js 1j (1j: the friendly page after a payment — ?paid= from Stripe shows what was bought, what happens next, the receipt and the seven-day promise at the top of the market; ?cancelled=1 says nothing was charged; 1i: why a seller is good at this — detective, ex-con, wisdom, records, mystery reader, seen it all — asked at join and on the desk, shown on the card; 1h: Stripe wherever money moves — an approved ticket paid now by card, a bid taken by paying it; 1g: Buy by card on every offer through the pay desk — Stripe on everything; 1f: data-scenario="1" makes the need door "Request a sleuth" — the scenario, what is known, what is wanted, always remote; 1e: every name links to the person's profile page — data-profile= sets the base)
   BUILT 2026-09-20 · gigapoo gigs.js 1d
   (1d: a fifth door, Events — paid events held by verified sellers, tickets
    reserved by named people with a telephone; a job option on "I need
    someone" with a rate; "free has no value" said on every form)
   (1b: #sell/#need/#wanted in the URL and gigapoo.open() open a door;
    1c: reads the site's purpose first — its headline, the kinds of work it
    takes, its age floor; date of birth on the sell form, a guardian under 18,
    an 18+ box for buyers on adult sites; a paused site draws one notice)
   ============================================================================
   THE EMBED. One line on any site puts the gig market on it:

     <script src="https://gigapoo.com/gigs.js" data-site="wire"></script>
     <div id="gigs"></div>

   It draws into #gigs (or data-into="#some-id"): the trust line, then four
   doors — Offered, Wanted, Sell here, I need someone — talking to the engine
   at api.gigapoo.com with the site's key. No build step, no framework, no
   cookie, nothing stored except the seller's own token in the browser that
   holds it.

   HIS DRESS, 20 Sep: "a friendly light blue and orange/yellow/red
   environment to build trust." Light blue is the ground, orange is the
   thing to press, yellow is the thing to notice, red is the one caution.
   Every colour is a CSS variable on #gigs so a host site can tune it.

   HIS RULE, said on the page and enforced by the engine: nobody is
   anonymous — a name, a telephone and a location. Nomads welcome with
   location on. The form will not send without them, and the engine would
   refuse it if it did.
   ============================================================================ */
(function () {
  "use strict";
  var me = document.currentScript || (function () { var s = document.getElementsByTagName("script"); return s[s.length - 1]; })();
  var SITE = (me && me.getAttribute("data-site")) || "wire";
  var API  = ((me && me.getAttribute("data-api")) || "https://api.gigapoo.com").replace(/\/$/, "");
  var INTO = (me && me.getAttribute("data-into")) || "#gigs";
  var TOKEN_KEY = "gigapoo.token";
  /* every name is a link to the person's profile — the record under their own name */
  var PROFILE = (me && me.getAttribute("data-profile")) || "https://gigapoo.com/profile?id=";
  /* data-scenario="1": the "I need someone" door becomes REQUEST A SLEUTH —
     describe the scenario, what is known, what is wanted; always remote. His
     rule for Wise Sleuth, 21 Sep: the data and the pattern are what the
     house learns from. */
  var SCENARIO = !!(me && me.getAttribute("data-scenario"));
  /* the pay desk — Stripe on everything, 21 Sep. A gig is bought by card with
     one link; Stripe asks for the email; the desk books the sale on the engine. */
  var PAY = (me && me.getAttribute("data-pay")) || "https://pay.warrantwire.com";
  var ON = { wire: "wire", k8: "k8", wisesleuth: "ws" }[SITE] || "gp";

  /* ---- the dress ---------------------------------------------------------- */
  var CSS = ''
    + '.gp{--gp-sky:#eaf4fb;--gp-sky2:#d6e9f6;--gp-paper:#ffffff;--gp-line:#c9dcea;--gp-ink:#12283d;--gp-ink2:#3d5468;--gp-ink3:#6d8294;'
    + '--gp-orange:#f28c28;--gp-orange2:#d9741a;--gp-yellow:#f7c948;--gp-yellow2:#fff3c4;--gp-red:#d9482b;--gp-red2:#fdecea;--gp-green:#2e9e6b;'
    + '--gp-sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;--gp-mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;'
    + 'background:var(--gp-sky);color:var(--gp-ink);font:15px/1.55 var(--gp-sans);border-radius:16px;padding:18px;box-sizing:border-box;max-width:100%}'
    + '.gp *{box-sizing:border-box}.gp a{color:var(--gp-orange2)}'
    + '.gp .trust{display:flex;gap:12px;align-items:flex-start;background:var(--gp-paper);border:1px solid var(--gp-line);border-radius:12px;padding:12px 14px;margin:0 0 14px}'
    + '.gp .trust .shield{width:38px;height:38px;border-radius:50%;background:var(--gp-yellow);display:flex;align-items:center;justify-content:center;flex:0 0 38px}'
    + '.gp .trust .shield svg{width:22px;height:22px;stroke:var(--gp-ink);fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}'
    + '.gp .trust b{display:block;font-size:15px;color:var(--gp-ink)}.gp .trust span{font-size:13.5px;color:var(--gp-ink2)}'
    + '.gp .doors{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px}'
    + '.gp .door{flex:1 1 140px;border:2px solid var(--gp-line);background:var(--gp-paper);border-radius:12px;padding:10px 12px;cursor:pointer;text-align:left;font:inherit;color:var(--gp-ink)}'
    + '.gp .door b{display:block;font-size:15px}.gp .door span{display:block;font-size:12.5px;color:var(--gp-ink3)}'
    + '.gp .door.on{border-color:var(--gp-orange);background:#fff7ee}.gp .door:hover{border-color:var(--gp-orange)}'
    + '.gp .list{display:grid;gap:10px}'
    + '.gp .card{background:var(--gp-paper);border:1px solid var(--gp-line);border-radius:12px;padding:14px 16px;display:grid;grid-template-columns:auto 1fr;gap:12px 14px}'
    + '.gp .face{width:52px;height:52px;border-radius:50%;background:var(--gp-sky2);display:flex;align-items:center;justify-content:center;font:700 18px var(--gp-sans);color:var(--gp-ink2);overflow:hidden}'
    + '.gp .face img{width:100%;height:100%;object-fit:cover}'
    + '.gp .who{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline}.gp .who b{font-size:16px}.gp .who .loc{font-size:13px;color:var(--gp-ink2)}'
    + '.gp .ok{display:inline-flex;align-items:center;gap:4px;font:600 11px var(--gp-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--gp-green);background:#e8f6ef;border-radius:999px;padding:2px 8px}'
    + '.gp .ok.stale{color:var(--gp-red);background:var(--gp-red2)}'
    + '.gp .stars{font-size:12.5px;color:var(--gp-ink3)}'
    + '.gp .title{font:600 16px/1.35 var(--gp-sans);color:var(--gp-ink);margin:4px 0 2px}.gp .blurb{font-size:14px;color:var(--gp-ink2);margin:0 0 6px}'
    + '.gp .meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:12.5px;color:var(--gp-ink3)}'
    + '.gp .thanks{display:flex;gap:14px;align-items:flex-start;background:#eef8f2;border:1.5px solid #9cd3b3;border-radius:14px;padding:14px 16px;margin:0 0 14px;font:15.5px/1.5 var(--gp-sans);color:var(--gp-ink2)}.gp .thanks b{color:var(--gp-ink)}.gp .thanks .face{flex:0 0 40px;width:40px;height:40px;font-size:20px}.gp .thanks[hidden]{display:none}'
    + '.gp .why{grid-column:1/-1;margin:2px 0 0;font:15px/1.45 var(--gp-sans);color:var(--gp-ink2)}.gp .why b{color:var(--gp-ink)}'
    + '.gp .pill{border-radius:999px;padding:2px 9px;background:var(--gp-sky2);color:var(--gp-ink2);font-weight:600}.gp .pill.place{background:var(--gp-yellow2);color:#7a5a00}'
    + '.gp .price{font:700 18px var(--gp-sans);color:var(--gp-ink)}.gp .price small{font:400 12px var(--gp-sans);color:var(--gp-ink3)}'
    + '.gp .row{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between}'
    + '.gp .btn{font:700 14px var(--gp-sans);background:var(--gp-orange);color:#fff;border:0;border-radius:10px;padding:10px 16px;cursor:pointer}'
    + '.gp .btn:hover{background:var(--gp-orange2)}.gp .btn.quiet{background:var(--gp-paper);color:var(--gp-ink);border:2px solid var(--gp-line)}'
    + '.gp .btn:disabled{opacity:.6;cursor:default}'
    + '.gp .empty{background:var(--gp-paper);border:1px dashed var(--gp-line);border-radius:12px;padding:18px;color:var(--gp-ink2);text-align:center}'
    + '.gp form{background:var(--gp-paper);border:1px solid var(--gp-line);border-radius:12px;padding:16px;display:grid;gap:10px}'
    + '.gp .f2{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:560px){.gp .f2{grid-template-columns:1fr}}'
    + '.gp label{display:block;font:600 11px var(--gp-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--gp-ink3);margin:0 0 4px}'
    + '.gp input,.gp select,.gp textarea{width:100%;font:15px var(--gp-sans);padding:10px 12px;border:1px solid var(--gp-line);border-radius:9px;background:#fff;color:var(--gp-ink)}'
    + '.gp input:focus,.gp select:focus,.gp textarea:focus{outline:3px solid rgba(242,140,40,.35);border-color:var(--gp-orange)}'
    + '.gp .hint{font-size:12.5px;color:var(--gp-ink3);margin:2px 0 0}'
    + '.gp .rule{background:var(--gp-yellow2);border:1px solid #f0d98a;border-radius:10px;padding:10px 12px;font-size:13.5px;color:#5a4300}'
    + '.gp .rule b{color:var(--gp-ink)}'
    + '.gp .warn{background:var(--gp-red2);border:1px solid #f3b8ad;border-radius:10px;padding:10px 12px;font-size:13.5px;color:#7a2a1a}'
    + '.gp .done{background:#e8f6ef;border:1px solid #bfe5d1;border-radius:10px;padding:12px 14px;color:#1d5a3f}'
    + '.gp .check{display:flex;gap:10px;align-items:flex-start;font-size:14px;color:var(--gp-ink2)}.gp .check input{width:auto;margin-top:4px}'
    + '.gp .foot{margin:14px 0 0;font-size:12px;color:var(--gp-ink3);text-align:center}.gp .foot a{color:var(--gp-ink3)}';

  /* ---- helpers ------------------------------------------------------------ */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]; }); }
  function el(html) { var d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; }
  function get(url) { return fetch(url).then(function (r) { return r.json(); }); }
  function q(o) { return Object.keys(o).filter(function (k) { return o[k] != null && o[k] !== ""; }).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(o[k]); }).join("&"); }
  function initials(n) { return String(n || "").split(/\s+/).map(function (w) { return w[0] || ""; }).join("").slice(0, 2).toUpperCase(); }
  function stars(s) { if (!s.reviews) return '<span class="stars">no reviews yet</span>'; return '<span class="stars">★ ' + esc(s.stars) + ' · ' + s.reviews + ' review' + (s.reviews === 1 ? '' : 's') + '</span>'; }
  function token() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
  function setToken(t) { try { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); } catch (e) {} }

  /* the install puts the script ABOVE the div, so the div does not exist yet
     when this runs: wait for the page, then draw */
  var root = document.querySelector(INTO);
  if (!root) {
    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); return; }
    root = document.querySelector(INTO); if (!root) return;
  }
  boot();
  function boot() {
  root = root || document.querySelector(INTO);
  if (!root) return;
  var style = document.createElement("style"); style.textContent = CSS; document.head.appendChild(style);
  root.className = (root.className ? root.className + " " : "") + "gp";

  /* ---- the site's purpose, read first --------------------------------------
     Each site's market is for something: Warrant Wire and 8K10Q want readers
     and audio opinions on finance, 18 and older; gigapoo.com is for youth,
     seniors and everyone. The engine tells us; we dress for it and the forms
     only offer what the site takes. A paused site (its bill to Gigapoo more
     than 180 days unpaid) draws one notice and no doors. */
  var SI = { min_age: 0, kinds: ["text", "voice", "own", "file", "in_person"], purpose: null, blurb: null, name: null };
  var KIND_NAME = { text: "written", voice: "written + a machine voice", own: "written + my own voice", file: "a file", in_person: "in person" };
  function kindOptions(sel) { return SI.kinds.map(function (k) { return '<option value="' + k + '"' + (k === sel ? ' selected' : '') + '>' + KIND_NAME[k] + '</option>'; }).join(""); }
  function adult() { return SI.min_age >= 18; }

  root.innerHTML = '<div class="empty">Opening the market…</div>';
  get(API + "/?site=" + encodeURIComponent(SITE)).then(function (d) {
    if (d && d.paused) {
      root.innerHTML = '<div class="warn"><b>This market is paused.</b> ' + esc(d.why || d.error || "") + '</div><p class="foot">Run by <a href="https://gigapoo.com" target="_blank" rel="noopener">Gigapoo</a>.</p>';
      return;
    }
    if (d && d.ok) SI = { min_age: Number(d.min_age) || 0, kinds: (d.kinds && d.kinds.length) ? d.kinds : SI.kinds, purpose: d.purpose, blurb: d.blurb, name: d.name, rule: d.rule, why_kinds: d.why_kinds || null, why_max: Number(d.why_max) || 400 };
    frame();
  }).catch(function () { frame(); });

  var pane;
  function frame() {
  /* ---- the frame ---------------------------------------------------------- */
  var head = SI.purpose ? '<b>' + esc(SI.purpose) + (adult() ? ' · ' + SI.min_age + ' and older' : '') + '</b><span>' + esc(SI.blurb || "") + ' ' + esc(SI.rule || "Every seller here has a name, a telephone and a location on file, verified by a telephone call.") + ' Nobody is anonymous.</span>'
                        : '<b>Real people, real names.</b><span>Every seller here has a name, a telephone and a location on file, and was verified by a telephone call before the first listing. Buyers of in-place work are verified the same way. Nobody is anonymous.</span>';
  root.innerHTML = '<div class="thanks" id="gp-thanks" hidden></div>'
    + '<div class="trust"><div class="shield"><svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg></div>'
    + '<div>' + head + '</div></div>'
    + '<div class="doors">'
    + '<button class="door on" data-door="offered"><b>Offered</b><span>what people here can do</span></button>'
    + '<button class="door" data-door="wanted"><b>Wanted</b><span>what people need done</span></button>'
    + '<button class="door" data-door="events"><b>Events</b><span>meetups, classes, talks — paid</span></button>'
    + (SCENARIO ? '<button class="door" data-door="need"><b>Request a sleuth</b><span>describe the scenario, get bids</span></button>' : '<button class="door" data-door="need"><b>I need someone</b><span>a gig or a job — post it, get bids</span></button>')
    + '<button class="door" data-door="sell"><b>Sell here</b><span>say what you can do, or hold an event</span></button>'
    + '</div>'
    + '<p class="hint" style="margin:-6px 0 12px;text-align:center"><b>Free has no value here.</b> Every gig, job and event carries a price.</p>'
    + '<div class="pane"></div>'
    + '<p class="foot">Run by <a href="https://gigapoo.com" target="_blank" rel="noopener">Gigapoo</a> — the same rules on every site that carries it. Opinions, not advice, unless the seller holds a licence on file.</p>';
  pane = root.querySelector(".pane");
  root.querySelectorAll(".door").forEach(function (b) {
    b.addEventListener("click", function () {
      root.querySelectorAll(".door").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on"); show(b.getAttribute("data-door"));
    });
  });

  function show(door, extra) {
    if (door === "offered") return offered();
    if (door === "wanted")  return wanted();
    if (door === "events")  return eventsList();
    if (door === "need")    return needForm(extra || {});
    if (door === "sell")    return sellForm();
  }
  /* a host page's own links can open a door: <a href="#sell">, or
     gigapoo.open("need"). gigapoo.com's header uses both. */
  var DOORS = ["offered", "wanted", "events", "need", "sell"];
  function openDoor(door, extra) { if (DOORS.indexOf(door) < 0) return; pick(door); show(door, extra); root.scrollIntoView({ block: "start", behavior: "smooth" }); }
  window.gigapoo = window.gigapoo || {}; window.gigapoo.open = openDoor;
  window.addEventListener("hashchange", function () { openDoor(location.hash.slice(1)); });

  /* ---- offered ------------------------------------------------------------ */
  function sellerHead(by) {
    var loc = by.location || {};
    return '<div class="face">' + (by.photo ? '<img src="' + esc(by.photo) + '" alt="">' : esc(initials(by.name))) + '</div>'
      + '<div><div class="who"><b><a href="' + PROFILE + esc(by.id) + '" style="color:inherit;text-decoration:none;border-bottom:1px dotted var(--gp-ink3)">' + esc(by.name) + '</a></b><span class="loc">' + esc(by.city || loc.city) + ', ' + esc(by.country || loc.country) + '</span>'
      + '<span class="ok' + (loc.stale ? ' stale' : '') + '">' + (loc.stale ? 'location not confirmed' : (loc.nomad ? 'on the move · location on' : 'verified')) + '</span>'
      + (by.credential ? '<span class="pill">' + esc(by.credential) + '</span>' : '') + '</div>' + stars(by)
      + whyLine(by);
  }
  /* why they are good at this — the kind they picked and their own words (1i) */
  /* the question every seller answers — his words, 21 Sep: "why they are a good
     sleuth: detective, ex-con, wisdom? mystery readers who have gained knowledge;
     those that have seen it all." The kinds come from the engine (?site=). */
  function whyFields(pfx) {
    var kinds = SI.why_kinds || { detective: "Detective or investigator", excon: "Ex-convict", wisdom: "Wisdom", records: "Records", reader: "Mystery reader", seenitall: "Seen it all", other: "Something else" };
    var opts = '<option value="">choose one</option>' + Object.keys(kinds).map(function (k) { return '<option value="' + k + '">' + esc(kinds[k]) + '</option>'; }).join("");
    return '<div class="rule" style="background:var(--gp-yellow2,#fff3c4);border-color:#f0d98a;color:#5a4300"><b>Why are you good at this?</b> A detective, an ex-con, decades of wisdom, a mystery reader who learned how it is done, someone who has seen it all &mdash; say which, and say why in your own words. It goes on your card and your profile, as written.</div>'
      + '<div class="f2"><div><label for="gp-' + pfx + '-whykind">Which are you?</label><select id="gp-' + pfx + '-whykind">' + opts + '</select></div>'
      + '<div><label for="gp-' + pfx + '-why">Why, in your own words</label><textarea id="gp-' + pfx + '-why" rows="3" maxlength="' + (SI.why_max || 400) + '" placeholder="Thirty years in claims; I can smell a made-up date. / Did six years; I know exactly how the paper gets moved. / I have read every Christie twice."></textarea></div></div>';
  }
  function whyLine(by) {
    if (!by.why_label && !by.why) return '';
    return '<p class="why">' + (by.why_label ? '<b>' + esc(String(by.why_label).split(' — ')[0]) + '.</b> ' : '') + (by.why ? esc(by.why) : '') + '</p>';
  }
  function offered() {
    pane.innerHTML = '<div class="empty">Loading what people here can do…</div>';
    get(API + "/?offers=1&site=" + encodeURIComponent(SITE)).then(function (d) {
      var list = (d && d.offers) || [];
      if (!list.length) { pane.innerHTML = '<div class="meta" style="margin:0 0 10px"><a href="#" id="gp-selmap" class="pill">Map of gig workers nearby</a></div><div id="gp-selmaph"></div><div class="empty"><b>Nobody has posted an offer here yet.</b><br>Be the first — <a href="#" data-go="sell">say what you can do</a>, or <a href="#" data-go="need">post what you need</a> and let people bid.</div>'; wireGo();
        pane.querySelector("#gp-selmap").addEventListener("click", function (e) { e.preventDefault(); var h = pane.querySelector("#gp-selmaph"); if (h.innerHTML) { h.innerHTML = ""; return; } drawMap(h, "sellers", function (id) { location.href = PROFILE + id; }); }); return; }
      pane.innerHTML = '<div class="meta" style="margin:0 0 10px"><a href="#" id="gp-selmap" class="pill">Map of gig workers nearby</a></div><div id="gp-selmaph"></div><div class="list">' + list.map(function (o) {
        return '<div class="card">' + sellerHead(o.by)
          + '<div class="title">' + esc(o.title) + '</div>' + (o.blurb ? '<p class="blurb">' + esc(o.blurb) + '</p>' : '') + '</div>'
          + '<div class="row"><div class="meta"><span class="pill' + (o.where === "in_place" ? ' place' : '') + '">' + (o.where === "in_place" ? 'in person' : 'remote') + '</span>'
          + '<span>' + esc(o.delivery === "text" ? "written" : o.delivery === "voice" ? "written + voice" : o.delivery === "own" ? "written + own voice" : o.delivery === "file" ? "a file" : "in person") + '</span>'
          + (o.days ? '<span>about ' + o.days + ' day' + (o.days === 1 ? '' : 's') + '</span>' : '') + (o.advice ? '<span class="pill">advice · licensed</span>' : '<span>opinion, not advice</span>') + '</div>'
          + '<div class="meta"><span class="price">' + esc(o.buyer_pays) + ' <small>' + esc(o.price) + ' to the seller + our flat fee</small></span>'
          + '<a class="btn" href="' + PAY + '/?go=gig&gig=' + esc(o.id) + '&collect_email=1&on=' + ON + '" style="text-decoration:none">Buy &middot; ' + esc(o.buyer_pays) + '</a> <button class="btn quiet" data-ask="' + esc(o.id) + '" data-ask-title="' + esc(o.title) + '" data-ask-where="' + esc(o.where) + '">Ask first</button></div></div></div>';
      }).join("") + '</div>';
      pane.querySelectorAll("[data-ask]").forEach(function (b) {
        b.addEventListener("click", function () { pick("need"); needForm({ subject: b.getAttribute("data-ask-title"), where: b.getAttribute("data-ask-where"), offer: b.getAttribute("data-ask") }); });
      });
      pane.querySelector("#gp-selmap").addEventListener("click", function (e) { e.preventDefault(); var h = pane.querySelector("#gp-selmaph"); if (h.innerHTML) { h.innerHTML = ""; return; } drawMap(h, "sellers", function (id) { location.href = PROFILE + id; }); });
    }).catch(function () { pane.innerHTML = '<div class="warn">The market is not answering just now. Try again in a moment.</div>'; });
  }
  function wireGo() { pane.querySelectorAll("[data-go]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); pick(a.getAttribute("data-go")); show(a.getAttribute("data-go")); }); }); }
  function pick(door) { root.querySelectorAll(".door").forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-door") === door); }); }

  /* ---- wanted ------------------------------------------------------------- */
  function wanted() {
    pane.innerHTML = '<div class="empty">Loading what people need…</div>';
    get(API + "/?requests=1&site=" + encodeURIComponent(SITE)).then(function (d) {
      var list = (d && d.requests) || [];
      var tok = token();
      if (!list.length) { pane.innerHTML = '<div class="empty"><b>Nothing wanted here yet.</b><br><a href="#" data-go="need">Post what you need</a> — a verified person will bid on it.</div>'; wireGo(); return; }
      pane.innerHTML = '<div class="list">' + list.map(function (r) {
        return '<div class="card" style="grid-template-columns:1fr"><div><div class="title">' + esc(r.subject) + '</div>' + (r.note ? '<p class="blurb">' + esc(r.note) + '</p>' : '')
          + (r.scenario ? '<p class="blurb"><b>The scenario:</b> ' + esc(String(r.scenario).slice(0, 400)) + (String(r.scenario).length > 400 ? '…' : '') + (r.wanted ? '<br><b>Wanted:</b> ' + esc(r.wanted) : '') + '</p>' : '')
          + '<div class="meta">' + (r.topic ? '<span class="pill">' + esc(r.topic) + '</span>' : '') + (r.kind === "job" ? '<span class="pill" style="background:var(--gp-orange);color:#fff">job · ' + esc(r.rate || '') + '</span>' : '') + (r.anyone ? '<span class="pill" style="background:#e8f6ef;color:#1d5a3f">anyone could do this</span>' : '') + '<span class="pill' + (r.where === "in_place" ? ' place' : '') + '">' + (r.where === "in_place" ? 'in person' + (r.near ? ' · ' + esc(r.near) : '') : 'remote') + '</span>'
          + '<span>asked by ' + esc(r.by) + (r.buyer_verified ? ' · verified' : '') + (r.buyer_stars ? ' · ★ ' + r.buyer_stars + ' (' + r.buyer_reviews + ')' : '') + '</span>' + (r.budget ? '<span>budget ' + esc(r.budget) + '</span>' : '') + '<span>' + r.bids + ' bid' + (r.bids === 1 ? '' : 's') + '</span></div></div>'
          + '<div class="row"><span class="hint">' + esc(String(r.made).slice(0, 10)) + (r.bids ? ' · <a href="#" data-bids="' + esc(r.id) + '">see the bids &amp; pay one</a>' : '') + '</span>'
          + (tok ? '<button class="btn quiet" data-bid="' + esc(r.id) + '" data-bid-subject="' + esc(r.subject) + '">Bid on this</button>' : '<span class="hint">Verified sellers bid here — <a href="#" data-go="sell">enrol</a> or paste your token under Sell here.</span>') + '</div><div class="bids" data-for="' + esc(r.id) + '" style="grid-column:1/-1"></div></div>';
      }).join("") + '</div>';
      wireGo();
      pane.querySelectorAll("[data-bid]").forEach(function (b) { b.addEventListener("click", function () { bidForm(b.getAttribute("data-bid"), b.getAttribute("data-bid-subject")); }); });
      /* the bids on a request: the person who asked accepts one by paying it, by card */
      pane.querySelectorAll("[data-bids]").forEach(function (a) {
        a.addEventListener("click", function (e) {
          e.preventDefault(); var id = a.getAttribute("data-bids"), box = pane.querySelector('.bids[data-for="' + id + '"]'); box.innerHTML = '<p class="hint">Loading the bids…</p>';
          get(API + "/?request=" + encodeURIComponent(id)).then(function (d) {
            var bs = (d && d.bids) || [];
            box.innerHTML = bs.length ? '<div class="rule" style="margin-top:8px"><b>' + bs.length + ' bid' + (bs.length === 1 ? '' : 's') + '.</b> If this is your request, take one by paying it — by card, held until the work is delivered.</div>' + bs.map(function (b) {
              return '<div class="meta" style="padding:8px 0;border-top:1px solid var(--gp-line);gap:10px"><b><a href="' + PROFILE + esc(b.by.id) + '" style="color:inherit">' + esc(b.by.name) + '</a></b><span>' + esc(b.by.city) + '</span>' + (b.note ? '<span>' + esc(b.note) + '</span>' : '') + '<span class="price">' + esc(b.price) + '</span><a class="btn" href="' + esc(b.pay) + '" style="text-decoration:none;padding:6px 12px;font-size:13px">Take it &middot; pay by card</a></div>';
            }).join("") : '<p class="hint">No bids yet.</p>';
          });
        });
      });
    }).catch(function () { pane.innerHTML = '<div class="warn">The market is not answering just now.</div>'; });
  }
  function bidForm(rid, subject) {
    pane.innerHTML = '<form><div class="rule"><b>Your bid on:</b> ' + esc(subject) + '</div>'
      + '<div class="f2"><div><label for="gp-bid-price">Your price, in dollars</label><input id="gp-bid-price" type="number" min="1" step="1" placeholder="150"></div>'
      + '<div><label for="gp-bid-delivery">Delivered as</label><select id="gp-bid-delivery">' + kindOptions("text") + '</select></div></div>'
      + '<div><label for="gp-bid-note">A line to the buyer</label><input id="gp-bid-note" placeholder="what you will do and when"></div>'
      + '<div class="row"><span class="hint">A flat fee comes off your price — the form shows what you keep once you bid.</span><button class="btn" type="submit">Send the bid</button></div><div class="msg"></div></form>';
    var f = pane.querySelector("form"), msg = f.querySelector(".msg");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      get(API + "/?" + q({ action: "bid", token: token(), request: rid, price: f.querySelector("#gp-bid-price").value, delivery: f.querySelector("#gp-bid-delivery").value, note: f.querySelector("#gp-bid-note").value }))
        .then(function (d) { msg.innerHTML = d.ok ? '<div class="done">Bid sent: ' + esc(d.price) + ' — you keep ' + esc(d.you_keep) + ' after the flat fee of ' + esc(d.fee || '') + '. The buyer sees your name and city.</div>' : '<div class="warn">' + esc(d.error || "did not send") + '</div>'; })
        .catch(function () { msg.innerHTML = '<div class="warn">Could not reach the market.</div>'; });
    });
  }

  /* ---- the map with icons ---------------------------------------------------
     His ask, 20 Sep: "a map with icons would be ideal for the user, and gig
     workers nearby, same idea, separate map." Leaflet + OpenStreetMap tiles,
     loaded only when a map is opened. Events at their geocoded place; sellers
     at about a kilometre — never the exact point. */
  var LEAF = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/";
  function leaflet() {
    if (window.L) return Promise.resolve(window.L);
    return new Promise(function (ok, no) {
      var l = document.createElement("link"); l.rel = "stylesheet"; l.href = LEAF + "leaflet.min.css"; document.head.appendChild(l);
      var s = document.createElement("script"); s.src = LEAF + "leaflet.min.js"; s.onload = function () { ok(window.L); }; s.onerror = no; document.head.appendChild(s);
    });
  }
  function icon(kind) {
    var svg = kind === "seller"
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40"><path d="M16 1C8 1 2 7 2 15c0 10 14 24 14 24s14-14 14-24C30 7 24 1 16 1z" fill="#f28c28" stroke="#fff" stroke-width="2"/><circle cx="16" cy="13" r="4" fill="#fff"/><path d="M9 24c0-4 3-6 7-6s7 2 7 6" fill="#fff"/></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40"><path d="M16 1C8 1 2 7 2 15c0 10 14 24 14 24s14-14 14-24C30 7 24 1 16 1z" fill="#d9482b" stroke="#fff" stroke-width="2"/><rect x="9" y="9" width="14" height="12" rx="2" fill="#fff"/><rect x="9" y="9" width="14" height="4" fill="#f7c948"/><rect x="12" y="15" width="3" height="3" fill="#d9482b"/><rect x="17" y="15" width="3" height="3" fill="#d9482b"/></svg>';
    return window.L.icon({ iconUrl: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg), iconSize: [30, 38], iconAnchor: [15, 38], popupAnchor: [0, -34] });
  }
  function drawMap(holder, what, onPick) {
    holder.innerHTML = '<div class="empty">Loading the map…</div>';
    Promise.all([leaflet(), get(API + "/?pins=" + what + "&site=" + encodeURIComponent(SITE))]).then(function (r) {
      var L = r[0], pins = (r[1] && r[1].pins) || [];
      holder.innerHTML = '<div class="gpmap" style="height:360px;border-radius:12px;overflow:hidden;border:1px solid var(--gp-line)"></div>'
        + '<p class="hint" style="margin-top:6px">' + (what === "sellers" ? "Gig workers nearby, to about a kilometre — never the exact point. " : "Events with a place. ") + pins.length + ' on the map. <a href="#" data-locate="1">Centre on me</a></p>';
      var map = L.map(holder.querySelector(".gpmap"), { scrollWheelZoom: false });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(map);
      var ic = icon(what === "sellers" ? "seller" : "event"), group = [];
      pins.forEach(function (p) {
        var m = L.marker([p.lat, p.lng], { icon: ic }).addTo(map); group.push(m);
        var html = what === "sellers"
          ? '<b>' + esc(p.name) + '</b>' + (p.credential ? ' · ' + esc(p.credential) : '') + '<br>' + esc(p.city) + ', ' + esc(p.country) + (p.nomad ? ' · on the move' : '') + '<br>' + (p.latest ? '<i>' + esc(p.latest) + '</i><br>' : '') + p.offers + ' offer' + (p.offers === 1 ? '' : 's') + ' · <a href="#" data-seller="' + p.id + '">see them</a>'
          : (p.picture ? '<img src="' + esc(p.picture) + '" style="width:100%;max-height:90px;object-fit:cover;border-radius:6px"><br>' : '') + '<b>' + esc(p.title) + '</b>' + (p.kind ? ' · ' + esc(p.kind) : '') + '<br>' + when(p.starts) + '<br>' + esc(p.venue || p.where) + '<br>' + esc(p.price) + ' a seat · ' + p.going + ' going' + (p.host ? ' · ' + esc(p.host) : '') + '<br><a href="#" data-event="' + p.id + '">see it — ask to come</a>';
        m.bindPopup(html);
      });
      map.on("popupopen", function (e) {
        var a = e.popup.getElement().querySelector("[data-event],[data-seller]");
        if (a) a.addEventListener("click", function (x) { x.preventDefault(); onPick(a.getAttribute("data-event") || a.getAttribute("data-seller")); });
      });
      if (group.length) map.fitBounds(L.featureGroup(group).getBounds().pad(0.2)); else map.setView([40.86, -74.16], 10);
      holder.querySelector("[data-locate]").addEventListener("click", function (e) {
        e.preventDefault(); if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(function (pos) { map.setView([pos.coords.latitude, pos.coords.longitude], 12); L.circleMarker([pos.coords.latitude, pos.coords.longitude], { radius: 7, color: "#2e9e6b" }).addTo(map).bindPopup("You are here").openPopup(); });
      });
    }).catch(function () { holder.innerHTML = '<div class="warn">The map could not load.</div>'; });
  }

  /* ---- events ---------------------------------------------------------------
     A meetup, a class, a walk, a dinner — held by a verified seller, priced
     ($5 at least), with a promotional picture, a map, and the faces of who
     is coming. To come: register once with Gigapoo (name, email, telephone,
     picture), agree to pay, ask; the host lets you in; your credit line
     settles by ACH. You pay Gigapoo; Gigapoo pays the host. */
  var ATT_KEY = "gigapoo.attendee";
  function attToken() { try { return localStorage.getItem(ATT_KEY) || ""; } catch (e) { return ""; } }
  function setAtt(t) { try { if (t) localStorage.setItem(ATT_KEY, t); else localStorage.removeItem(ATT_KEY); } catch (e) {} }
  function when(s) { var d = new Date(String(s).replace(" ", "T")); return isNaN(d) ? esc(s) : d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
  function eventCard(ev, full) {
    var h = ev.host || {};
    return '<div class="card" style="grid-template-columns:1fr">'
      + (ev.picture ? '<img src="' + esc(ev.picture) + '" alt="" style="width:100%;max-height:260px;object-fit:cover;border-radius:10px">' : '')
      + '<div><div class="title">' + esc(ev.title) + '</div>'
      + '<div class="meta">' + (ev.kind ? '<span class="pill" style="background:var(--gp-orange);color:#fff">' + esc(ev.kind) + '</span>' : '') + '<span class="pill place">' + when(ev.starts) + '</span><span class="pill">' + esc(ev.where) + (ev.venue ? ' · ' + esc(ev.venue) : '') + '</span>'
      + (ev.seats ? '<span>' + ev.going + ' going · ' + ev.left + ' of ' + ev.seats + ' seats left</span>' : '<span>' + ev.going + ' going</span>')
      + (h.name ? '<span>held by <b><a href="' + PROFILE + esc(h.id) + '" style="color:inherit">' + esc(h.name) + '</a></b>' + (h.city ? ', ' + esc(h.city) : '') + '</span>' : '') + '</div>'
      + (ev.blurb ? '<p class="blurb" style="margin-top:6px">' + esc(ev.blurb) + '</p>' : '')
      + (ev.map ? '<div class="meta"><a href="' + esc(ev.map) + '" target="_blank" rel="noopener">Map</a> · <a href="' + esc(ev.directions) + '" target="_blank" rel="noopener">Directions</a></div>' : '')
      + (full && ev.map_embed ? '<iframe src="' + esc(ev.map_embed) + '" style="width:100%;height:220px;border:0;border-radius:10px;margin-top:8px" loading="lazy" title="map"></iframe>' : '')
      + '</div>'
      + '<div class="row"><div class="meta"><span class="price">' + esc(ev.buyer_pays) + ' <small>a seat · ' + esc(ev.price) + ' to the host + our flat fee</small></span></div>'
      + (full ? '' : '<button class="btn" data-ev="' + esc(ev.id) + '">See it — ask to come</button>') + '</div></div>';
  }
  /* what is new in the member's watch area, and the control to change it
     as they travel — his rule: members hear of new gigs and events near them */
  function nearYou(el) {
    var at = attToken(), st = token(); if (!el || !(at || st)) { if (el) el.innerHTML = ' <a href="#" data-go="sell">Sell here</a> or register at an event to hear what is new near you.'; return; }
    var who = at ? { action: "news", token: at } : { action: "news", token: st };
    get(API + "/?" + q(who)).then(function (d) {
      if (!d || !d.ok) { el.innerHTML = ""; return; }
      el.innerHTML = ' New near <b>' + esc(d.area) + '</b>: ' + d.events.length + ' event' + (d.events.length === 1 ? '' : 's') + ', ' + d.requests.length + ' gig' + (d.requests.length === 1 ? '' : 's') + ' · <a href="#" id="gp-watch">travelling? change my area</a>';
      el.querySelector("#gp-watch").addEventListener("click", function (e) {
        e.preventDefault(); var v = prompt("The area you want news from — City, Country", d.area); if (!v) return; var cc = v.split(",");
        get(API + "/?" + q({ action: "watch", token: at || st, city: (cc[0] || "").trim(), country: (cc[1] || "").trim() })).then(function (r) { alert(r.ok ? "Now watching " + r.watching : (r.error || "did not change")); nearYou(el); });
      });
    }).catch(function () { el.innerHTML = ""; });
  }
  function eventsList(search, kind) {
    pane.innerHTML = '<div class="empty">Loading what is on…</div>';
    get(API + "/?" + q({ events: 1, site: SITE, q: search || "", kind: kind || "" })).then(function (d) {
      var list = (d && d.events) || [], kinds = (d && d.kinds) || [];
      var top = '<div class="rule"><b>Socialization and community, with a price on the door.</b> Every event here costs at least $5 — free costs everyone time and problems. Who is coming is registered with a name and a picture, and the host decides who is in. <a href="#" data-go="sell">Hold one</a> if you are a verified seller.</div>'
        /* search by type — his rule: people must be able to find the kind of event they want */
        + '<form id="gp-evsearch" style="padding:10px 12px"><div class="row"><input id="gp-evq" placeholder="Search events — walk, talk, dinner, chess, a town, a host…" value="' + esc(search || "") + '" style="flex:1 1 220px"><button class="btn" type="submit">Search</button></div>'
        + (kinds.length ? '<div class="meta" style="margin-top:8px">' + kinds.map(function (k) { return '<a href="#" data-kind="' + esc(k.kind) + '" class="pill"' + (kind === k.kind ? ' style="background:var(--gp-orange);color:#fff"' : '') + '>' + esc(k.kind) + ' · ' + k.n + '</a>'; }).join("") + (kind ? ' <a href="#" data-kind="" class="hint">all types</a>' : '') + '</div>' : '')
        + '<div class="meta" style="margin-top:8px"><a href="#" id="gp-evmap" class="pill">Map of events</a><span id="gp-near" class="hint"></span></div></form><div id="gp-evmaph"></div>';
      pane.innerHTML = top + (list.length ? '<div class="list">' + list.map(function (ev) { return eventCard(ev, false); }).join("") + '</div>'
        : '<div class="empty"><b>' + (search || kind ? 'Nothing matches.' : 'Nothing on yet.') + '</b><br>Any verified seller can hold an event — a meetup, a class, a walk, a dinner. <a href="#" data-go="sell">Sell here</a> to be verified, then hold one from your desk.</div>');
      wireGo();
      pane.querySelector("#gp-evsearch").addEventListener("submit", function (e) { e.preventDefault(); eventsList(pane.querySelector("#gp-evq").value, kind); });
      pane.querySelector("#gp-evmap").addEventListener("click", function (e) { e.preventDefault(); var h = pane.querySelector("#gp-evmaph"); if (h.innerHTML) { h.innerHTML = ""; return; } drawMap(h, "events", function (id) { eventPage(id); }); });
      nearYou(pane.querySelector("#gp-near"));
      pane.querySelectorAll("[data-kind]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); eventsList(search, a.getAttribute("data-kind")); }); });
      pane.querySelectorAll("[data-ev]").forEach(function (b) { b.addEventListener("click", function () { eventPage(b.getAttribute("data-ev")); }); });
    }).catch(function () { pane.innerHTML = '<div class="warn">The market is not answering just now.</div>'; });
  }
  function eventPage(id) {
    pane.innerHTML = '<div class="empty">Opening the event…</div>';
    get(API + "/?event=" + encodeURIComponent(id)).then(function (d) {
      if (!d || !d.ok) { pane.innerHTML = '<div class="warn">' + esc((d && d.error) || "not found") + '</div>'; return; }
      var ev = d.event, going = d.attending || [];
      pane.innerHTML = '<p class="hint"><a href="#" data-go="events">&larr; All events</a></p><div class="list">' + eventCard(ev, true)
        + '<div class="card" style="grid-template-columns:1fr"><div><div class="title">Who is coming</div>'
        + (going.length ? '<div class="meta" style="gap:10px">' + going.map(function (g) { return '<span style="display:inline-flex;align-items:center;gap:6px"><span class="face" style="width:32px;height:32px;font-size:12px">' + (g.picture ? '<img src="' + esc(g.picture) + '" alt="">' : esc(initials(g.name))) + '</span>' + esc(g.name) + (g.hometown ? ' <small class="hint">of ' + esc(g.hometown) + '</small>' : '') + (g.seats > 1 ? ' +' + (g.seats - 1) : '') + (g.paid ? '' : ' <small class="hint">(on credit)</small>') + '</span>'; }).join("") + '</div>'
                        : '<p class="blurb">Nobody yet. Be first.</p>') + '</div></div>'
        + '<div id="gp-attend"></div></div>';
      wireGo();
      attendBox(ev);
    }).catch(function () { pane.innerHTML = '<div class="warn">Could not reach the market.</div>'; });
  }
  /* the box under an event: register (once), picture, agree, ask */
  function attendBox(ev) {
    var box = pane.querySelector("#gp-attend"), tok = attToken();
    function askForm(me, mine_) {
      var held = (mine_ || []).filter(function (t) { return String(t.event) === String(ev.id) && (t.state === "approved" || t.state === "paid"); })[0];
      if (held) {
        box.innerHTML = '<div class="done"><b>You are in' + (held.paid ? ', paid.' : ' — ' + esc(held.owed || "") + ' on your credit line.') + '</b> '
          + (held.paid ? '' : '<a class="btn" href="' + PAY + '/?go=ticket&ticket=' + esc(held.ticket) + '&collect_email=1&on=' + ON + '" style="text-decoration:none;margin:0 8px">Pay now by card &middot; ' + esc(held.owed || "") + '</a> <span class="hint">or settle it by ACH later — no interest.</span> ')
          + '<a href="#" id="gp-rev-host">Review the host</a> — 140 characters, published as written.</div>';
        box.querySelector("#gp-rev-host").addEventListener("click", function (e) {
          e.preventDefault(); var stars = prompt("Stars, 1 to 5:"); if (!stars) return; var words = prompt("In 140 characters or fewer:") || "";
          if (words.length > 140) { alert("140 characters at most — yours is " + words.length + "."); return; }
          get(API + "/?" + q({ action: "review", token: attToken(), about: "host:" + (ev.host ? ev.host.id : ""), ref: held.ticket, stars: stars, words: words })).then(function (r) { alert(r.ok ? "Published." : (r.error || "did not publish")); });
        });
        return;
      }
      box.innerHTML = '<form><div class="rule"><b>Ask to come.</b> ' + (me ? 'You are registered as <b>' + esc(me.name) + '</b>' + (me.has_picture ? ', picture on file.' : ' — <b>add your picture</b> below; the host verifies who is coming.') : '') + '</div>'
        + (me && !me.has_picture ? '<div><label for="gp-a-pic">Your picture (JPEG or PNG)</label><input id="gp-a-pic" type="file" accept="image/jpeg,image/png,image/webp"></div>' : '')
        + '<div class="f2"><div><label for="gp-a-seats">Seats</label><input id="gp-a-seats" type="number" min="1" max="20" value="1"></div><div class="hint" style="align-self:end">' + esc(ev.buyer_pays) + ' a seat. ' + esc(ev.to_attend || '') + '</div></div>'
        + '<div class="check"><input id="gp-a-agree" type="checkbox"><label for="gp-a-agree" style="text-transform:none;letter-spacing:0;font:14px var(--gp-sans);color:var(--gp-ink2)"><b>I agree to pay for my attendance and for the credit I accumulate.</b> If the host lets me in, the amount goes on my credit line and I pay Gigapoo by ACH through achplug.com — the credit line lets me pay after, not never. Gigapoo charges no interest.</label></div>'
        + '<div class="row"><span class="hint">You pay Gigapoo; Gigapoo pays the host. <a href="#" id="gp-a-forget">Not you?</a></span><button class="btn" type="submit">Ask to come</button></div><div class="msg"></div></form>';
      var f = box.querySelector("form"), msg = f.querySelector(".msg");
      f.querySelector("#gp-a-forget").addEventListener("click", function (e) { e.preventDefault(); setAtt(""); attendBox(ev); });
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var pic = f.querySelector("#gp-a-pic"), agree = f.querySelector("#gp-a-agree").checked, seats = f.querySelector("#gp-a-seats").value;
        if (!agree) { msg.innerHTML = '<div class="warn">Tick the agreement — a credit line is not a free ticket.</div>'; return; }
        var up = Promise.resolve({ ok: true });
        if (pic && pic.files && pic.files[0]) up = fetch(API + "/?action=attendee_photo&token=" + encodeURIComponent(attToken()), { method: "POST", body: pic.files[0] }).then(function (r) { return r.json(); });
        else if (pic) { msg.innerHTML = '<div class="warn">Your picture, please — no picture, no ticket.</div>'; return; }
        up.then(function (r) {
          if (!r.ok) throw new Error(r.error || "picture did not upload");
          return get(API + "/?" + q({ action: "attend", token: attToken(), event: ev.id, seats: seats, agree: 1 }));
        }).then(function (r) {
          msg.innerHTML = r.ok ? '<div class="done"><b>Asked.</b> ' + esc(r.agreed || '') + ' ' + esc(r.note) + '</div>' : '<div class="warn">' + esc(r.error) + '</div>';
        }).catch(function (x) { msg.innerHTML = '<div class="warn">' + esc(x.message || "Could not reach the market.") + '</div>'; });
      });
    }
    if (tok) {
      get(API + "/?" + q({ action: "tickets", token: tok })).then(function (d) { if (d && d.ok) askForm(d.you, d.tickets); else { setAtt(""); attendBox(ev); } }).catch(function () { askForm(null); });
      return;
    }
    box.innerHTML = '<form><div class="rule"><b>Register with Gigapoo to come.</b> Your name, email, telephone, hometown, where you are now, and a picture — once, for every event on every site. The host sees them all and decides who is in. All are welcome; security is key. <b>No telephone, no attendance.</b></div>'
      + '<div class="f2"><div><label for="gp-r-name">Full name</label><input id="gp-r-name" autocomplete="name"></div><div><label for="gp-r-email">Email</label><input id="gp-r-email" type="email" autocomplete="email"></div></div>'
      + '<div class="f2"><div><label for="gp-r-phone">Telephone — required</label><input id="gp-r-phone" type="tel" autocomplete="tel"></div><div><label for="gp-r-pic">Your picture (JPEG or PNG)</label><input id="gp-r-pic" type="file" accept="image/jpeg,image/png,image/webp"></div></div>'
      + '<div class="f2"><div><label for="gp-r-home">Hometown</label><input id="gp-r-home" placeholder="Paterson, NJ"></div><div><label for="gp-r-now">Where you are now — City, Country</label><input id="gp-r-now" placeholder="Clifton, USA"></div></div>'
      + '<div class="row"><span class="hint">Already registered on this device? It remembers you.</span><button class="btn" type="submit">Register</button></div><div class="msg"></div></form>';
    var f = box.querySelector("form"), msg = f.querySelector(".msg");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var pic = f.querySelector("#gp-r-pic");
      if (!(pic.files && pic.files[0])) { msg.innerHTML = '<div class="warn">Your picture, please — no picture, no ticket.</div>'; return; }
      var nowcc = (f.querySelector("#gp-r-now").value || "").split(",");
      get(API + "/?" + q({ action: "register", name: f.querySelector("#gp-r-name").value, email: f.querySelector("#gp-r-email").value, phone: f.querySelector("#gp-r-phone").value,
          hometown: f.querySelector("#gp-r-home").value, city: (nowcc[0] || "").trim(), country: (nowcc[1] || "").trim() })).then(function (r) {
        if (!r.ok) { msg.innerHTML = '<div class="warn"><b>Not yet:</b> ' + esc((r.missing || [r.error]).join(" · ")) + '</div>'; return; }
        setAtt(r.token);
        return fetch(API + "/?action=attendee_photo&token=" + encodeURIComponent(r.token), { method: "POST", body: pic.files[0] }).then(function (x) { return x.json(); }).then(function (x) {
          if (!x.ok) { msg.innerHTML = '<div class="warn">' + esc(x.error) + '</div>'; return; }
          attendBox(ev);
        });
      }).catch(function () { msg.innerHTML = '<div class="warn">Could not reach the market.</div>'; });
    });
  }

  /* ---- I need someone ----------------------------------------------------- */
  function needForm(pre) {
    if (SCENARIO) return scenarioForm(pre);
    var inPlace = pre.where === "in_place";
    pane.innerHTML = '<form>'
      + '<div class="rule"><b>Nobody is anonymous — buyers included.</b> Your name and email always; for work done at an address, a telephone too: a person calls you before any seller sees where the work is, and your money is held until you say it is done.</div>'
      + '<div class="f2"><div><label for="gp-need-kind">A gig or a job?</label><select id="gp-need-kind"><option value="gig">a gig — one piece of work, at a price</option><option value="job">a job — ongoing work, at a rate</option></select></div>'
      + '<div class="jobrate" style="display:none"><label for="gp-need-rate">The pay</label><input id="gp-need-rate" placeholder="$22/hour, $900/week…"><p class="hint">Free has no value here.</p></div></div>'
      + '<div><label for="gp-need-subject">What you need, in a sentence</label><input id="gp-need-subject" value="' + esc(pre.subject || "") + '" placeholder="Read the last three 10-Qs and tell me what changed"></div>'
      + '<div><label for="gp-need-note">Anything else the seller should know</label><textarea id="gp-need-note" rows="2"></textarea></div>'
      + '<div class="f2"><div><label for="gp-need-name">Your full name</label><input id="gp-need-name" autocomplete="name"></div><div><label for="gp-need-email">Email</label><input id="gp-need-email" type="email" autocomplete="email"></div></div>'
      + '<div class="f2"><div><label for="gp-need-where">Where the work happens</label><select id="gp-need-where"><option value="remote"' + (inPlace ? '' : ' selected') + '>remote — over the wire</option><option value="in_place"' + (inPlace ? ' selected' : '') + '>in person — at an address</option></select></div>'
      + '<div><label for="gp-need-budget">Budget, in dollars (optional)</label><input id="gp-need-budget" type="number" min="1" step="1"></div></div>'
      + '<div class="place f2" style="' + (inPlace ? '' : 'display:none') + '"><div><label for="gp-need-phone">Telephone</label><input id="gp-need-phone" type="tel" autocomplete="tel"></div><div><label for="gp-need-city">City and country</label><input id="gp-need-city" placeholder="Clifton, USA"></div></div>'
      + (adult() ? '<div class="check"><input id="gp-need-adult" type="checkbox"><label for="gp-need-adult" style="text-transform:none;letter-spacing:0;font:14px var(--gp-sans);color:var(--gp-ink2)"><b>I am ' + SI.min_age + ' or older.</b> ' + esc(SI.name || "This market") + ' is for adults.</label></div>' : '')
      + '<div class="check"><input id="gp-need-anyone" type="checkbox"><label for="gp-need-anyone" style="text-transform:none;letter-spacing:0;font:14px var(--gp-sans);color:var(--gp-ink2)"><b>Anyone could do this.</b> No particular skill — any verified person may bid.</label></div>'
      + '<div class="row"><span class="hint">Nothing is owed to post. Bids come to your email; you pick one or none. <b>A gig is paid up front and held until done</b> — credit lines are for events only.</span><button class="btn" type="submit">Post it</button></div><div class="msg"></div></form>';
    var f = pane.querySelector("form"), msg = f.querySelector(".msg"), wsel = f.querySelector("#gp-need-where"), place = f.querySelector(".place");
    wsel.addEventListener("change", function () { place.style.display = wsel.value === "in_place" ? "" : "none"; });
    var ksel = f.querySelector("#gp-need-kind"), jr = f.querySelector(".jobrate");
    ksel.addEventListener("change", function () { jr.style.display = ksel.value === "job" ? "" : "none"; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var cc = (f.querySelector("#gp-need-city").value || "").split(","), city = (cc[0] || "").trim(), country = (cc[1] || "").trim();
      get(API + "/?" + q({ action: "want", site: SITE, subject: f.querySelector("#gp-need-subject").value, note: f.querySelector("#gp-need-note").value,
          name: f.querySelector("#gp-need-name").value, email: f.querySelector("#gp-need-email").value, where: wsel.value, budget: f.querySelector("#gp-need-budget").value,
          phone: f.querySelector("#gp-need-phone").value, city: city, country: country,
          kind: ksel.value, rate: f.querySelector("#gp-need-rate").value, anyone: f.querySelector("#gp-need-anyone").checked ? 1 : 0,
          adult: (f.querySelector("#gp-need-adult") && f.querySelector("#gp-need-adult").checked) ? 1 : 0 }))
        .then(function (d) { msg.innerHTML = d.ok ? '<div class="done"><b>Posted.</b> ' + esc(d.note) + '</div>' : '<div class="warn"><b>Not yet:</b> ' + esc((d.missing || [d.error]).join(" · ")) + '</div>'; })
        .catch(function () { msg.innerHTML = '<div class="warn">Could not reach the market.</div>'; });
    });
  }

  /* ---- request a sleuth: the scenario ---------------------------------------- */
  /* what a scenario can be about — his list, 21 Sep: company investigations;
     marriage and dating; gaslighting; is the boss fair; the social club, why
     was I not invited; will the coach play me; will I get the part; should I
     stay with this team; is NYC for me, where should I live; is that group a
     syndicate; who is stealing, sales up and profit down, which employee
     cannot be trusted. A host page pre-picks one: gigapoo.open("need", { topic, subject }). */
  var TOPICS = [["company", "a company or its filings"], ["business", "my business — who is stealing, sales up and profit down, who cannot be trusted"], ["work", "work — the boss, a coworker, a promotion"], ["love", "marriage, dating, a relationship"], ["gaslight", "am I being gaslighted"], ["group", "a group, a club, a team — what is going on, why was I left out"], ["chance", "my chances — the coach, the part, the offer"], ["move", "a decision — where to live, whether to stay"], ["person", "a person"], ["property", "a property or a deed"], ["claim", "a claim in the news or online"], ["family", "a family history"], ["court", "a court or public record"], ["money", "money owed, a scam, a contract"], ["other", "something else"]];
  function topicOptions(sel) { return TOPICS.map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === sel ? ' selected' : '') + '>' + esc(t[1]) + '</option>'; }).join(""); }
  function scenarioForm(pre) {
    pane.innerHTML = '<form>'
      + '<div class="rule"><b>Describe the scenario.</b> A sleuth bids on what you write here, so write it all: what happened, what you already know, what you want found out. Always remote, always digital &mdash; a named person&rsquo;s <b>opinion, never advice</b>, for a fee. Nobody is anonymous, buyers included.</div>'
      + '<div class="f2"><div><label for="gp-sc-topic">What is it about?</label><select id="gp-sc-topic">' + topicOptions(pre.topic) + '</select></div>'
      + '<div><label for="gp-sc-subject">In one line</label><input id="gp-sc-subject" value="' + esc(pre.subject || "") + '" placeholder="Who really owns the building at 40 Main Street?"></div></div>'
      + '<div><label for="gp-sc-scenario">The scenario &mdash; what happened, in your own words</label><textarea id="gp-sc-scenario" rows="6" placeholder="Start at the beginning. Names, dates, places, what was said, what was signed."></textarea></div>'
      + '<div class="f2"><div><label for="gp-sc-known">What you already know or have</label><textarea id="gp-sc-known" rows="3" placeholder="documents, links, a ticker, a case number"></textarea></div><div><label for="gp-sc-wanted">What you want found out</label><textarea id="gp-sc-wanted" rows="3" placeholder="the question you need answered"></textarea></div></div>'
      + '<div class="f2"><div><label for="gp-sc-name">Your full name</label><input id="gp-sc-name" autocomplete="name"></div><div><label for="gp-sc-email">Email</label><input id="gp-sc-email" type="email" autocomplete="email"></div></div>'
      + '<div class="f2"><div><label for="gp-sc-phone">Telephone</label><input id="gp-sc-phone" type="tel" autocomplete="tel"></div><div><label for="gp-sc-budget">What you would pay, in dollars</label><input id="gp-sc-budget" type="number" min="5" step="1" placeholder="60"><p class="hint">Free has no value here.</p></div></div>'
      + (adult() ? '<div class="check"><input id="gp-sc-adult" type="checkbox"><label for="gp-sc-adult" style="text-transform:none;letter-spacing:0;font:14px var(--gp-sans);color:var(--gp-ink2)"><b>I am ' + SI.min_age + ' or older.</b></label></div>' : '')
      + '<div class="row"><span class="hint">Nothing is owed to post. Sleuths bid; you pick one or none. What you write is kept &mdash; it is how the club learns what people need.</span><button class="btn" type="submit">Request a sleuth</button></div><div class="msg"></div></form>';
    var f = pane.querySelector("form"), msg = f.querySelector(".msg");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var sc = f.querySelector("#gp-sc-scenario").value.trim();
      if (sc.length < 60) { msg.innerHTML = '<div class="warn">Describe the scenario &mdash; a few sentences at least. A sleuth cannot bid on a line.</div>'; return; }
      get(API + "/?" + q({ action: "want", site: SITE, kind: "gig", where: "remote", subject: f.querySelector("#gp-sc-subject").value, note: sc.slice(0, 600),
          topic: f.querySelector("#gp-sc-topic").value, scenario: sc, known: f.querySelector("#gp-sc-known").value, wanted: f.querySelector("#gp-sc-wanted").value,
          name: f.querySelector("#gp-sc-name").value, email: f.querySelector("#gp-sc-email").value, phone: f.querySelector("#gp-sc-phone").value, budget: f.querySelector("#gp-sc-budget").value,
          adult: (f.querySelector("#gp-sc-adult") && f.querySelector("#gp-sc-adult").checked) ? 1 : 0 }))
        .then(function (d) { msg.innerHTML = d.ok ? '<div class="done"><b>Posted.</b> ' + esc(d.note) + ' A sleuth&rsquo;s answer is an opinion, never advice.</div>' : '<div class="warn"><b>Not yet:</b> ' + esc((d.missing || [d.error]).join(" · ")) + '</div>'; })
        .catch(function () { msg.innerHTML = '<div class="warn">Could not reach the market.</div>'; });
    });
  }

  /* ---- sell here ---------------------------------------------------------- */
  function sellForm() {
    var tok = token();
    if (tok) return mine(tok);
    pane.innerHTML = '<form>'
      + '<div class="rule"><b>The rule, before the form.</b> Nobody sells here anonymously: a real name, a telephone, a date of birth, and where you are. A person telephones you before your first listing shows. No fixed address? Fine — keep location sharing on, and check in every month.'
      + (adult() ? ' <b>' + esc(SI.name || "This market") + ' is for sellers ' + SI.min_age + ' and older.</b>' : ' <b>Under 18?</b> A parent or guardian goes on file with you, and we call them too.') + '</div>'
      + (SI.purpose ? '<div class="rule" style="background:var(--gp-sky2);border-color:var(--gp-line);color:var(--gp-ink2)"><b>What this market is for:</b> ' + esc(SI.purpose) + '. It takes ' + SI.kinds.map(function (k) { return KIND_NAME[k]; }).join(", ") + '.</div>' : '')
      + '<div class="f2"><div><label for="gp-s-name">Full name, first and last</label><input id="gp-s-name" autocomplete="name"></div><div><label for="gp-s-email">Email</label><input id="gp-s-email" type="email" autocomplete="email"></div></div>'
      + '<div class="f2"><div><label for="gp-s-phone">Telephone — we call it</label><input id="gp-s-phone" type="tel" autocomplete="tel"></div><div><label for="gp-s-born">Date of birth — never published</label><input id="gp-s-born" type="date" autocomplete="bday"></div></div>'
      + '<div class="guardian f2" style="display:none"><div><label for="gp-s-gname">Parent or guardian, full name</label><input id="gp-s-gname"></div><div><label for="gp-s-gphone">Their telephone — we call them too</label><input id="gp-s-gphone" type="tel"></div></div>'
      + '<div class="f2"><div><label for="gp-s-cred">Licence or credential, if any</label><input id="gp-s-cred" placeholder="CRD, bar number, press card…"><p class="hint">Only a seller with one on file may mark work as advice.</p></div><div><label for="gp-s-ach">Your achplug.com address — how you are paid</label><input id="gp-s-ach" placeholder="the email achplug.com knows you by"><p class="hint">Gigapoo pays by ACH through achplug.com only. Card-paid gigs: Stripe&rsquo;s fee comes off your side.</p></div></div>'
      + '<div class="f2"><div><label for="gp-s-city">City</label><input id="gp-s-city" autocomplete="address-level2"></div><div><label for="gp-s-country">Country</label><input id="gp-s-country" autocomplete="country-name" placeholder="USA"></div></div>'
      + '<div class="check"><input id="gp-s-nomad" type="checkbox"><label for="gp-s-nomad" style="text-transform:none;letter-spacing:0;font:14px var(--gp-sans);color:var(--gp-ink2)"><b>I move around — no fixed address.</b> I will keep my location on and check in monthly.</label></div>'
      + '<div class="row"><button class="btn quiet" type="button" id="gp-s-locate">Use my location</button><span class="hint" id="gp-s-locmsg">Optional for a fixed address; required if you move around. The exact point is never published — only your city and country.</span></div>'
      + '<div><label for="gp-s-about">About you, in a few lines &mdash; the first thing on your profile</label><textarea id="gp-s-about" rows="3" placeholder="what you can figure out, how long you have done it, what you want to be hired for"></textarea><p class="hint">Everyone here has a profile under their own name: the work delivered, the events held, every review as written. It is your record; it is how your value gets seen.</p></div>'
      + whyFields('s')
      + '<div class="rule" style="background:var(--gp-sky2);border-color:var(--gp-line);color:var(--gp-ink2)"><b>What you can do</b> — your first offer, in your own words. You can add more once you are verified.</div>'
      + '<div><label for="gp-s-title">The task</label><input id="gp-s-title" placeholder="I will read your company&rsquo;s warrant agreement and tell you what it permits"></div>'
      + '<div class="f2"><div><label for="gp-s-price">Your price, in dollars</label><input id="gp-s-price" type="number" min="1" step="1" placeholder="150"></div><div><label for="gp-s-where">Where</label><select id="gp-s-where"><option value="remote">remote — over the wire</option><option value="in_place">in person — at the buyer&rsquo;s address</option></select></div></div>'
      + '<div class="f2"><div><label for="gp-s-delivery">Delivered as</label><select id="gp-s-delivery">' + kindOptions("text") + '</select></div><div><label for="gp-s-days">Turnaround, days</label><input id="gp-s-days" type="number" min="0" step="1" placeholder="2"></div></div>'
      + '<div class="row"><span class="hint">A flat fee comes off each sale — never a percentage. Already verified? <a href="#" id="gp-s-havetoken">Paste your token</a>.</span><button class="btn" type="submit">Apply to sell</button></div><div class="msg"></div></form>';
    var f = pane.querySelector("form"), msg = f.querySelector(".msg"), pos = { lat: null, lng: null };
    /* under 18: the guardian fields appear as soon as the date says so */
    var bornIn = f.querySelector("#gp-s-born"), guard = f.querySelector(".guardian");
    function ageNow() { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(bornIn.value || ""); if (!m) return null; var n = new Date(), a = n.getFullYear() - +m[1]; if (n.getMonth() + 1 < +m[2] || (n.getMonth() + 1 === +m[2] && n.getDate() < +m[3])) a--; return a; }
    bornIn.addEventListener("change", function () { var a = ageNow(); guard.style.display = (a != null && a < 18 && !adult()) ? "" : "none"; });
    f.querySelector("#gp-s-locate").addEventListener("click", function () {
      var m = f.querySelector("#gp-s-locmsg");
      if (!navigator.geolocation) { m.textContent = "This browser cannot share a location. Type your city and country."; return; }
      m.textContent = "Asking your browser…";
      navigator.geolocation.getCurrentPosition(function (p) { pos.lat = p.coords.latitude; pos.lng = p.coords.longitude; m.textContent = "Location on — recorded to the nearest city. Now type the city and country as you would say them."; },
        function () { m.textContent = "Location was not shared. A fixed address needs only city and country; a nomad must share it."; });
    });
    f.querySelector("#gp-s-havetoken").addEventListener("click", function (e) { e.preventDefault(); var t = prompt("Paste the token the desk sent you after the call:"); if (t && t.length >= 12) { setToken(t.trim()); mine(t.trim()); } });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var nomad = f.querySelector("#gp-s-nomad").checked;
      var d = { action: "join", site: SITE, name: f.querySelector("#gp-s-name").value, email: f.querySelector("#gp-s-email").value, phone: f.querySelector("#gp-s-phone").value,
        credential: f.querySelector("#gp-s-cred").value, city: f.querySelector("#gp-s-city").value, country: f.querySelector("#gp-s-country").value,
        born: bornIn.value, guardian_name: f.querySelector("#gp-s-gname").value, guardian_phone: f.querySelector("#gp-s-gphone").value, achpay: f.querySelector("#gp-s-ach").value,
        nomad: nomad ? 1 : 0, location_on: (nomad || pos.lat != null) ? 1 : 0, lat: pos.lat, lng: pos.lng, about: f.querySelector("#gp-s-about").value,
        why_kind: (f.querySelector("#gp-s-whykind") || {}).value || "", why: (f.querySelector("#gp-s-why") || {}).value || "" };
      /* the first offer travels with the application; the engine stores it the moment the token is issued */
      var first = { title: f.querySelector("#gp-s-title").value, price: f.querySelector("#gp-s-price").value, where: f.querySelector("#gp-s-where").value, delivery: f.querySelector("#gp-s-delivery").value, days: f.querySelector("#gp-s-days").value };
      try { localStorage.setItem("gigapoo.first_offer", JSON.stringify(first)); } catch (x) {}
      get(API + "/?" + q(d)).then(function (r) {
        msg.innerHTML = r.ok ? '<div class="done"><b>Applied.</b> ' + esc(r.note) + ' When the desk sends your token, come back to <b>Sell here</b> and paste it — your first offer is saved on this device and goes up with it.</div>'
                             : '<div class="warn"><b>Not yet:</b> ' + esc((r.missing || [r.error]).join(" · ")) + '</div>';
      }).catch(function () { msg.innerHTML = '<div class="warn">Could not reach the market.</div>'; });
    });
  }

  /* ---- the verified seller's own screen ---------------------------------- */
  function mine(tok) {
    pane.innerHTML = '<div class="empty">Opening your desk…</div>';
    get(API + "/?" + q({ action: "me", token: tok })).then(function (d) {
      if (!d || !d.ok) { setToken(""); pane.innerHTML = '<div class="warn">That token is not live. Enrol again or ask the desk.</div><p class="hint"><a href="#" data-go="sell">Back</a></p>'; wireGo(); return; }
      var you = d.you, loc = you.location || {};
      var first = null; try { first = JSON.parse(localStorage.getItem("gigapoo.first_offer") || "null"); } catch (x) {}
      pane.innerHTML = '<div class="list">'
        + '<div class="card">' + sellerHead(you) + '<div class="meta">' + esc(loc.says || "") + ' ' + (you.location && you.location.nomad ? '<button class="btn quiet" id="gp-checkin" style="padding:6px 10px;font-size:13px">Check in — I am here now</button>' : '') + '</div></div>'
        + '<div class="row"><span class="hint">Sales released: ' + (d.sales ? d.sales.released : 0) + ' · earned ' + esc(d.sales ? d.sales.earned : "$0") + '</span><a class="btn quiet" href="' + PROFILE + esc(you.id) + '" style="padding:6px 10px;font-size:13px;text-decoration:none">My profile</a> <button class="btn quiet" id="gp-signout" style="padding:6px 10px;font-size:13px">Forget this token</button></div></div>'
        /* why they are good at this — shown filled in; change it any time */
        + '<form id="gp-why">' + whyFields('w') + '<div class="row"><span class="hint">' + (you.why || you.why_label ? 'Now: ' + esc((you.why_label || '').split(' — ')[0]) + (you.why ? ' — ' + esc(you.why) : '') : 'Not answered yet — it shows on your card once you do.') + '</span><button class="btn quiet" type="submit">Save why</button></div><div class="msg"></div></form>'
        + '<form id="gp-offer"><div class="rule"><b>Add what you can do.</b> Your words, your price. It shows with your name and city.</div>'
        + '<div><label for="gp-o-title">The task</label><input id="gp-o-title" value="' + esc(first ? first.title : "") + '"></div>'
        + '<div><label for="gp-o-blurb">A line or two more (optional)</label><input id="gp-o-blurb"></div>'
        + '<div class="f2"><div><label for="gp-o-price">Price, dollars</label><input id="gp-o-price" type="number" min="1" step="1" value="' + esc(first ? first.price : "") + '"></div><div><label for="gp-o-where">Where</label><select id="gp-o-where"><option value="remote"' + (first && first.where === "in_place" ? '' : ' selected') + '>remote</option><option value="in_place"' + (first && first.where === "in_place" ? ' selected' : '') + '>in person</option></select></div></div>'
        + '<div class="f2"><div><label for="gp-o-delivery">Delivered as</label><select id="gp-o-delivery">' + kindOptions(first && SI.kinds.indexOf(first.delivery) > -1 ? first.delivery : "text") + '</select></div><div><label for="gp-o-days">Turnaround, days</label><input id="gp-o-days" type="number" min="0" step="1" value="' + esc(first ? first.days : "") + '"></div></div>'
        + '<div class="check"><input id="gp-o-advice" type="checkbox"' + (you.credential ? '' : ' disabled') + '><label for="gp-o-advice" style="text-transform:none;letter-spacing:0;font:14px var(--gp-sans);color:var(--gp-ink2)">Mark as <b>advice</b>' + (you.credential ? ' — under my credential on file' : ' — needs a licence on file; everything else is an opinion') + '</label></div>'
        + '<div class="row"><span class="hint"></span><button class="btn" type="submit">Put it up</button></div><div class="msg"></div></form>'
        + (d.offers && d.offers.length ? '<div class="rule" style="background:var(--gp-paper)"><b>Your offers:</b> ' + d.offers.map(function (o) { return esc(o.title) + ' (' + esc(o.price) + ')'; }).join(' · ') + '</div>' : '')
        /* ---- hold an event ---- */
        + '<form id="gp-event"><div class="rule"><b>Hold an event.</b> A meetup, a class, a walk, a dinner — socialization and community, with a price on the door: <b>$5 at least</b>. You see the name, picture and email of everyone who asks, and you decide who is in. You pay nothing; they pay Gigapoo, Gigapoo pays you by ACH.</div>'
        + '<div class="f2"><div><label for="gp-e-title">The event, in a sentence</label><input id="gp-e-title" placeholder="Saturday walk and a talk about reading a 10-K"></div><div><label for="gp-e-kind">Type — one word people search for</label><input id="gp-e-kind" placeholder="walk, talk, dinner, chess, class…"></div></div>'
        + '<div><label for="gp-e-blurb">Description</label><textarea id="gp-e-blurb" rows="3" placeholder="what happens, who it is for, what to bring"></textarea></div>'
        + '<div class="f2"><div><label for="gp-e-starts">Starts</label><input id="gp-e-starts" type="datetime-local"></div><div><label for="gp-e-price">Price a seat, dollars (min 5)</label><input id="gp-e-price" type="number" min="5" step="1" placeholder="15"></div></div>'
        + '<div class="check"><input id="gp-e-online" type="checkbox"><label for="gp-e-online" style="text-transform:none;letter-spacing:0;font:14px var(--gp-sans);color:var(--gp-ink2)">Online — no place</label></div>'
        + '<div class="f2 eplace"><div><label for="gp-e-venue">Where — the place</label><input id="gp-e-venue" placeholder="Clifton Reservoir, north lot"></div><div><label for="gp-e-city">City, Country</label><input id="gp-e-city" value="' + esc((you.location.city || "") + ", " + (you.location.country || "")) + '"></div></div>'
        + '<div class="f2"><div><label for="gp-e-seats">Limit on attendance (blank = none)</label><input id="gp-e-seats" type="number" min="1" step="1"></div><div><label for="gp-e-pic">Promotional picture (optional)</label><input id="gp-e-pic" type="file" accept="image/jpeg,image/png,image/webp"></div></div>'
        + '<div class="row"><span class="hint">A map and directions are made from the place. Every event is archived; you or anyone can copy it later.</span><button class="btn" type="submit">Put it on</button></div><div class="msg"></div></form>'
        + '<div id="gp-myevents"></div>'
        + '</div>';
      /* the host's events, with who asked and yes/no */
      function myEvents() {
        var box = pane.querySelector("#gp-myevents"); if (!box) return;
        var evs = d.events || [];
        if (!evs.length) { box.innerHTML = ''; return; }
        box.innerHTML = evs.map(function (ev) { return '<div class="card" style="grid-template-columns:1fr"><div><div class="title">' + esc(ev.title) + '</div><div class="meta"><span class="pill place">' + when(ev.starts) + '</span><span>' + esc(ev.where) + '</span><span>' + ev.going + ' in' + (ev.waiting ? ' · ' + ev.waiting + ' asking' : '') + '</span>' + (ev.map ? '<a href="' + esc(ev.map) + '" target="_blank" rel="noopener">map</a>' : '') + '</div></div><div class="row"><span class="hint">' + esc(ev.buyer_pays) + ' a seat</span><button class="btn quiet" data-guests="' + esc(ev.id) + '" style="padding:6px 10px;font-size:13px">Who asked</button> <button class="btn quiet" data-reach="' + esc(ev.id) + '" style="padding:6px 10px;font-size:13px">Reach them</button></div><div class="glist" style="grid-column:1/-1"></div></div>'; }).join("");
        /* the reach panel: the numbers and emails of who is in, and one message sent from the host's own phone or mail */
        box.querySelectorAll("[data-reach]").forEach(function (b) {
          b.addEventListener("click", function () {
            var gl = b.parentNode.parentNode.querySelector(".glist"); gl.innerHTML = '<p class="hint">Loading…</p>';
            get(API + "/?" + q({ action: "reach", token: tok, event: b.getAttribute("data-reach") })).then(function (r) {
              if (!r.ok) { gl.innerHTML = '<div class="warn">' + esc(r.error) + '</div>'; return; }
              gl.innerHTML = '<div class="rule" style="margin-top:8px"><b>' + r.count + ' in.</b> Sent from your own phone and email, under your name. Small bulk — split a big list.</div>'
                + '<div><label>Your message</label><textarea id="gp-reach-msg" rows="2">' + esc(r.message) + '</textarea></div>'
                + '<div class="row"><div class="meta"><a class="btn" id="gp-reach-sms" href="' + esc(r.text_them) + '">Text them</a> <a class="btn quiet" id="gp-reach-mail" href="' + esc(r.email_them) + '">Email them</a></div><span class="hint"><a href="#" id="gp-reach-copy">Copy the numbers</a> · <a href="#" id="gp-reach-copye">Copy the emails</a></span></div>'
                + '<p class="hint">' + esc(r.phones) + '</p>';
              var ta = gl.querySelector("#gp-reach-msg"), sms = gl.querySelector("#gp-reach-sms"), mail = gl.querySelector("#gp-reach-mail");
              ta.addEventListener("input", function () { sms.href = r.text_them.split("?body=")[0] + "?body=" + encodeURIComponent(ta.value); mail.href = r.email_them.split("&body=")[0] + "&body=" + encodeURIComponent(ta.value); });
              gl.querySelector("#gp-reach-copy").addEventListener("click", function (e) { e.preventDefault(); if (navigator.clipboard) navigator.clipboard.writeText(r.phones); });
              gl.querySelector("#gp-reach-copye").addEventListener("click", function (e) { e.preventDefault(); if (navigator.clipboard) navigator.clipboard.writeText(r.emails); });
            });
          });
        });
        box.querySelectorAll("[data-guests]").forEach(function (b) {
          b.addEventListener("click", function () {
            var gl = b.parentNode.parentNode.querySelector(".glist"); gl.innerHTML = '<p class="hint">Loading…</p>';
            get(API + "/?" + q({ action: "guests", token: tok, event: b.getAttribute("data-guests") })).then(function (r) {
              var gs = (r && r.guests) || [];
              gl.innerHTML = gs.length ? gs.map(function (g) { return '<div class="meta" style="padding:6px 0;border-top:1px solid var(--gp-line);gap:10px"><span class="face" style="width:40px;height:40px;font-size:13px">' + (g.picture ? '<img src="' + esc(g.picture) + '" alt="">' : esc(initials(g.name))) + '</span><b>' + esc(g.name) + '</b><span>' + esc(g.email) + '</span><span>' + g.seats + ' seat' + (g.seats === 1 ? '' : 's') + '</span><span class="hint">' + esc(g.phone) + (g.hometown ? ' · of ' + esc(g.hometown) : '') + (g.now ? ' · now in ' + esc(g.now) : '') + '</span><span class="pill">' + esc(g.state) + (g.money ? ' · ' + esc(g.money) : '') + (g.barred ? ' · barred' : '') + '</span>'
                + (g.state === "requested" ? '<button class="btn" data-yes="' + g.ticket + '" style="padding:5px 10px;font-size:13px">Let in</button><button class="btn quiet" data-no="' + g.ticket + '" style="padding:5px 10px;font-size:13px">Decline</button>' : '')
                + (g.stars ? '<span class="hint">★ ' + g.stars + ' (' + g.reviews + ')</span>' : '')
                + ((g.state === "approved" || g.state === "paid") ? '<button class="btn quiet" data-review="' + g.attendee + '" data-ticket="' + g.ticket + '" style="padding:5px 10px;font-size:13px">Review</button>' : '')
                + (g.barred ? '<button class="btn quiet" data-unban="' + g.attendee + '" style="padding:5px 10px;font-size:13px">Lift bar</button>' : '<button class="btn quiet" data-ban="' + g.attendee + '" style="padding:5px 10px;font-size:13px;color:var(--gp-red)">Bar</button>') + '</div>'; }).join("") : '<p class="hint">Nobody has asked yet.</p>';
              gl.querySelectorAll("[data-review]").forEach(function (x) {
                x.addEventListener("click", function () {
                  var stars = prompt("Stars, 1 to 5:"); if (!stars) return; var words = prompt("In 140 characters or fewer — published as written, under your name:") || "";
                  if (words.length > 140) { alert("140 characters at most — yours is " + words.length + "."); return; }
                  get(API + "/?" + q({ action: "review", token: tok, about: "attendee:" + x.getAttribute("data-review"), ref: x.getAttribute("data-ticket"), stars: stars, words: words })).then(function (r) { alert(r.ok ? "Published." : (r.error || "did not publish")); b.click(); });
                });
              });
              gl.querySelectorAll("[data-ban],[data-unban]").forEach(function (x) {
                x.addEventListener("click", function () {
                  var on = x.hasAttribute("data-ban"), aid = x.getAttribute(on ? "data-ban" : "data-unban"), days = "";
                  if (on) { days = prompt("Bar from your events for how many days? Leave blank for permanently."); if (days === null) return; }
                  var why = on ? (prompt("Why? (kept on the record)") || "") : "";
                  get(API + "/?" + q({ action: on ? "ban" : "unban", token: tok, attendee: aid, days: days, why: why })).then(function (r) { alert(r.ok ? (on ? "Barred " + r.until + " from " + r.from + "." : "Lifted.") : (r.error || "did not go through")); b.click(); });
                });
              });
              gl.querySelectorAll("[data-yes],[data-no]").forEach(function (x) {
                x.addEventListener("click", function () {
                  var yes = x.hasAttribute("data-yes");
                  get(API + "/?" + q({ action: yes ? "approve" : "decline", token: tok, ticket: x.getAttribute(yes ? "data-yes" : "data-no") })).then(function (r) { alert(r.ok ? (yes ? "In. " + (r.on_credit ? r.on_credit + " on their credit line — they can pay it by card now on the event page, or by ACH later; you receive " + r.you_receive + " when it clears." : "") : "Declined.") : (r.error || "did not go through")); b.click(); });
                });
              });
            });
          });
        });
      }
      myEvents();
      var fe = pane.querySelector("#gp-event"), emsg = fe.querySelector(".msg"), eon = fe.querySelector("#gp-e-online"), eplace = fe.querySelector(".eplace");
      eon.addEventListener("change", function () { eplace.style.display = eon.checked ? "none" : ""; });
      fe.addEventListener("submit", function (e) {
        e.preventDefault();
        var cc = (fe.querySelector("#gp-e-city").value || "").split(","), pic = fe.querySelector("#gp-e-pic");
        get(API + "/?" + q({ action: "event", token: tok, site: SITE, title: fe.querySelector("#gp-e-title").value, kind: fe.querySelector("#gp-e-kind").value, blurb: fe.querySelector("#gp-e-blurb").value, starts: fe.querySelector("#gp-e-starts").value, price: fe.querySelector("#gp-e-price").value,
            online: eon.checked ? 1 : 0, venue: fe.querySelector("#gp-e-venue").value, city: (cc[0] || "").trim(), country: (cc[1] || "").trim(), seats: fe.querySelector("#gp-e-seats").value }))
          .then(function (r) {
            if (!r.ok) { emsg.innerHTML = '<div class="warn"><b>Not yet:</b> ' + esc((r.missing || [r.error]).join(" · ")) + '</div>'; return; }
            var up = (pic.files && pic.files[0]) ? fetch(API + "/?action=event_photo&token=" + encodeURIComponent(tok) + "&event=" + r.id, { method: "POST", body: pic.files[0] }).then(function (x) { return x.json(); }) : Promise.resolve({ ok: true });
            up.then(function () { emsg.innerHTML = '<div class="done"><b>On.</b> ' + esc(r.price) + ' a seat; you keep ' + esc(r.you_keep_per_ticket) + ' of each. ' + esc(r.note) + '</div>'; mine(tok); });
          }).catch(function () { emsg.innerHTML = '<div class="warn">Could not reach the market.</div>'; });
      });
      var f = pane.querySelector("#gp-offer"), msg = f.querySelector(".msg");
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        get(API + "/?" + q({ action: "offer", token: tok, site: SITE, title: f.querySelector("#gp-o-title").value, blurb: f.querySelector("#gp-o-blurb").value, price: f.querySelector("#gp-o-price").value,
            where: f.querySelector("#gp-o-where").value, delivery: f.querySelector("#gp-o-delivery").value, days: f.querySelector("#gp-o-days").value, advice: f.querySelector("#gp-o-advice").checked ? 1 : 0 }))
          .then(function (r) { if (r.ok) { try { localStorage.removeItem("gigapoo.first_offer"); } catch (x) {} } msg.innerHTML = r.ok ? '<div class="done"><b>Up.</b> ' + esc(r.price) + ' — you keep ' + esc(r.you_keep) + '; a buyer pays ' + esc(r.buyer_pays) + '. ' + esc(r.note) + '</div>' : '<div class="warn">' + esc(r.error) + '</div>'; })
          .catch(function () { msg.innerHTML = '<div class="warn">Could not reach the market.</div>'; });
      });
      var ci = pane.querySelector("#gp-checkin");
      if (ci) ci.addEventListener("click", function () {
        if (!navigator.geolocation) { alert("This browser cannot share a location."); return; }
        navigator.geolocation.getCurrentPosition(function (p) {
          var city = prompt("Where are you now? City, Country", (you.location.city || "") + ", " + (you.location.country || ""));
          if (!city) return; var cc = city.split(",");
          get(API + "/?" + q({ action: "where", token: tok, lat: p.coords.latitude, lng: p.coords.longitude, city: (cc[0] || "").trim(), country: (cc[1] || "").trim() })).then(function (r) { alert(r.ok ? "Checked in: " + r.where : (r.error || "did not check in")); mine(tok); });
        }, function () { alert("Location was not shared; a nomad's check-in needs it."); });
      });
      (function () {
        var wf = pane.querySelector("#gp-why"); if (!wf) return;
        var sel = wf.querySelector("#gp-w-whykind"), ta = wf.querySelector("#gp-w-why"); if (you.why_kind) sel.value = you.why_kind; if (you.why) ta.value = you.why;
        wf.addEventListener("submit", function (e) {
          e.preventDefault(); var m = wf.querySelector(".msg");
          get(API + "/?" + q({ action: "why", token: tok, why_kind: sel.value, why: ta.value })).then(function (r) { m.innerHTML = r.ok ? '<div class="done">Saved. ' + esc(r.note) + '</div>' : '<div class="warn">' + esc(r.error) + '</div>'; });
        });
      })();      pane.querySelector("#gp-signout").addEventListener("click", function () { setToken(""); sellForm(); });
      pane.querySelector("#gp-achpay").addEventListener("click", function (e) { e.preventDefault(); var a = prompt("Your achplug.com address — Gigapoo pays you there, and nowhere else:"); if (!a) return; get(API + "/?" + q({ action: "bank", token: tok, achpay: a })).then(function (r) { alert(r.ok ? r.note : (r.error || "did not save")); mine(tok); }); });
    }).catch(function () { pane.innerHTML = '<div class="warn">Could not reach the market.</div>'; });
  }

  /* ---- the friendly page after a payment (1j) ----------------------------
     Stripe sends the buyer back to the site with ?paid=<session> (or
     ?cancelled=1). The page is the market itself, so the message goes at the
     top of the embed: what was bought, what happens next, and the receipt. It
     asks the desk; it grants nothing. */
  (function () {
    var qs = new URLSearchParams(location.search), sid = qs.get("paid"), box = root.querySelector("#gp-thanks");
    if (!box) return;
    var site = SI.name || "the market";
    if (qs.get("cancelled")) { box.hidden = false; box.innerHTML = '<div class="face" style="background:var(--gp-sky2)">&#8617;</div><div><b>Nothing was charged.</b> The card page was closed before paying. Whatever you were after is still here.</div>'; return; }
    if (!sid || !/^cs_(live|test)_/.test(sid)) return;
    box.hidden = false; box.innerHTML = '<div class="face">&#10003;</div><div><b>Thank you.</b> Checking your payment&hellip;</div>';
    root.scrollIntoView({ block: "start" });
    var tries = 0;
    var WHAT = {
      gig:    "<b>Paid. Thank you.</b> The seller has been told and the money is <b>held</b> until the work is delivered; two days after that it is paid out. Watch the email you paid with &mdash; the work arrives there.",
      ticket: "<b>Paid. Thank you &mdash; you are in.</b> The host has your name and picture; the place, the map and directions are on the event. Your telephone is on file so the host can reach you.",
      store:  "<b>Paid. Thank you.</b> Your order is with the vendor and ships to the address you gave Stripe. The vendor marks it shipped and you are emailed.",
      bill:   "<b>Paid. Thank you.</b> Your site&rsquo;s bill is settled and its market is on."
    };
    (function ask() {
      get(PAY + "/?paid=" + encodeURIComponent(sid)).then(function (d) {
        if (d && d.paid) {
          var kinds = (d.skus || []).map(function (s) { return WHAT[s] || ("<b>Paid. Thank you.</b> " + esc(s)); });
          box.innerHTML = '<div class="face" style="background:var(--gp-green,#2e9e6b);color:#fff">&#10003;</div><div>' + (kinds[0] || "<b>Paid. Thank you.</b>")
            + (d.cents ? ' <span class="hint">$' + (d.cents / 100).toFixed(2) + ' &middot; a receipt from Stripe is on its way' + (d.email ? ' to ' + esc(d.email) : '') + '.</span>' : '')
            + '<br><span class="hint">Seven-day money back on ' + esc(site) + ': ask within seven days and it is returned. <a href="' + PAY + '/refunds" target="_blank" rel="noopener">The policy</a>. Questions: 702-544-2002, a person answers.</span></div>';
        } else if (tries++ < 8) setTimeout(ask, 1500);
        else box.innerHTML = '<div class="face">&#8987;</div><div><b>The card page came back, but Stripe has not confirmed yet.</b> It usually does within a minute; if your card was charged, you are covered and the confirmation comes by email. Nothing more to do here.</div>';
      }).catch(function () { if (tries++ < 8) setTimeout(ask, 1500); });
    })();
  })();

  var first = location.hash.slice(1);
  if (DOORS.indexOf(first) > -1 && first !== "offered") { pick(first); show(first); } else offered();
  } /* frame */
  } /* boot */
})();
