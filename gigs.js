/* BUILT 2026-09-20 · gigapoo gigs.js 1b (1b: #sell/#need/#wanted in the URL and gigapoo.open() open a door)
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

  /* ---- the frame ---------------------------------------------------------- */
  root.innerHTML = ''
    + '<div class="trust"><div class="shield"><svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg></div>'
    + '<div><b>Real people, real names.</b><span>Every seller here has a name, a telephone and a location on file, and was verified by a telephone call before the first listing. Buyers of in-place work are verified the same way. Nobody is anonymous.</span></div></div>'
    + '<div class="doors">'
    + '<button class="door on" data-door="offered"><b>Offered</b><span>what people here can do</span></button>'
    + '<button class="door" data-door="wanted"><b>Wanted</b><span>what people need done</span></button>'
    + '<button class="door" data-door="need"><b>I need someone</b><span>post it, get bids</span></button>'
    + '<button class="door" data-door="sell"><b>Sell here</b><span>say what you can do</span></button>'
    + '</div>'
    + '<div class="pane"></div>'
    + '<p class="foot">Run by <a href="https://gigapoo.com" target="_blank" rel="noopener">Gigapoo</a> — the same rules on every site that carries it. Opinions, not advice, unless the seller holds a licence on file.</p>';
  var pane = root.querySelector(".pane");
  root.querySelectorAll(".door").forEach(function (b) {
    b.addEventListener("click", function () {
      root.querySelectorAll(".door").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on"); show(b.getAttribute("data-door"));
    });
  });

  function show(door, extra) {
    if (door === "offered") return offered();
    if (door === "wanted")  return wanted();
    if (door === "need")    return needForm(extra || {});
    if (door === "sell")    return sellForm();
  }
  /* a host page's own links can open a door: <a href="#sell">, or
     gigapoo.open("need"). gigapoo.com's header uses both. */
  var DOORS = ["offered", "wanted", "need", "sell"];
  function openDoor(door) { if (DOORS.indexOf(door) < 0) return; pick(door); show(door); root.scrollIntoView({ block: "start", behavior: "smooth" }); }
  window.gigapoo = window.gigapoo || {}; window.gigapoo.open = openDoor;
  window.addEventListener("hashchange", function () { openDoor(location.hash.slice(1)); });

  /* ---- offered ------------------------------------------------------------ */
  function sellerHead(by) {
    var loc = by.location || {};
    return '<div class="face">' + (by.photo ? '<img src="' + esc(by.photo) + '" alt="">' : esc(initials(by.name))) + '</div>'
      + '<div><div class="who"><b>' + esc(by.name) + '</b><span class="loc">' + esc(by.city || loc.city) + ', ' + esc(by.country || loc.country) + '</span>'
      + '<span class="ok' + (loc.stale ? ' stale' : '') + '">' + (loc.stale ? 'location not confirmed' : (loc.nomad ? 'on the move · location on' : 'verified')) + '</span>'
      + (by.credential ? '<span class="pill">' + esc(by.credential) + '</span>' : '') + '</div>' + stars(by);
  }
  function offered() {
    pane.innerHTML = '<div class="empty">Loading what people here can do…</div>';
    get(API + "/?offers=1&site=" + encodeURIComponent(SITE)).then(function (d) {
      var list = (d && d.offers) || [];
      if (!list.length) { pane.innerHTML = '<div class="empty"><b>Nobody has posted an offer here yet.</b><br>Be the first — <a href="#" data-go="sell">say what you can do</a>, or <a href="#" data-go="need">post what you need</a> and let people bid.</div>'; wireGo(); return; }
      pane.innerHTML = '<div class="list">' + list.map(function (o) {
        return '<div class="card">' + sellerHead(o.by)
          + '<div class="title">' + esc(o.title) + '</div>' + (o.blurb ? '<p class="blurb">' + esc(o.blurb) + '</p>' : '') + '</div>'
          + '<div class="row"><div class="meta"><span class="pill' + (o.where === "in_place" ? ' place' : '') + '">' + (o.where === "in_place" ? 'in person' : 'remote') + '</span>'
          + '<span>' + esc(o.delivery === "text" ? "written" : o.delivery === "voice" ? "written + voice" : o.delivery === "own" ? "written + own voice" : o.delivery === "file" ? "a file" : "in person") + '</span>'
          + (o.days ? '<span>about ' + o.days + ' day' + (o.days === 1 ? '' : 's') + '</span>' : '') + (o.advice ? '<span class="pill">advice · licensed</span>' : '<span>opinion, not advice</span>') + '</div>'
          + '<div class="meta"><span class="price">' + esc(o.buyer_pays) + ' <small>' + esc(o.price) + ' to the seller + our flat fee</small></span>'
          + '<button class="btn" data-ask="' + esc(o.id) + '" data-ask-title="' + esc(o.title) + '" data-ask-where="' + esc(o.where) + '">Ask for this</button></div></div></div>';
      }).join("") + '</div>';
      pane.querySelectorAll("[data-ask]").forEach(function (b) {
        b.addEventListener("click", function () { pick("need"); needForm({ subject: b.getAttribute("data-ask-title"), where: b.getAttribute("data-ask-where"), offer: b.getAttribute("data-ask") }); });
      });
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
          + '<div class="meta"><span class="pill' + (r.where === "in_place" ? ' place' : '') + '">' + (r.where === "in_place" ? 'in person' + (r.near ? ' · ' + esc(r.near) : '') : 'remote') + '</span>'
          + '<span>asked by ' + esc(r.by) + (r.buyer_verified ? ' · verified' : '') + '</span>' + (r.budget ? '<span>budget ' + esc(r.budget) + '</span>' : '') + '<span>' + r.bids + ' bid' + (r.bids === 1 ? '' : 's') + '</span></div></div>'
          + '<div class="row"><span class="hint">' + esc(String(r.made).slice(0, 10)) + '</span>'
          + (tok ? '<button class="btn quiet" data-bid="' + esc(r.id) + '" data-bid-subject="' + esc(r.subject) + '">Bid on this</button>' : '<span class="hint">Verified sellers bid here — <a href="#" data-go="sell">enrol</a> or paste your token under Sell here.</span>') + '</div></div>';
      }).join("") + '</div>';
      wireGo();
      pane.querySelectorAll("[data-bid]").forEach(function (b) { b.addEventListener("click", function () { bidForm(b.getAttribute("data-bid"), b.getAttribute("data-bid-subject")); }); });
    }).catch(function () { pane.innerHTML = '<div class="warn">The market is not answering just now.</div>'; });
  }
  function bidForm(rid, subject) {
    pane.innerHTML = '<form><div class="rule"><b>Your bid on:</b> ' + esc(subject) + '</div>'
      + '<div class="f2"><div><label for="gp-bid-price">Your price, in dollars</label><input id="gp-bid-price" type="number" min="1" step="1" placeholder="150"></div>'
      + '<div><label for="gp-bid-delivery">Delivered as</label><select id="gp-bid-delivery"><option value="text">written</option><option value="voice">written + a machine voice</option><option value="own">written + my own voice</option><option value="file">a file</option><option value="in_person">in person</option></select></div></div>'
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

  /* ---- I need someone ----------------------------------------------------- */
  function needForm(pre) {
    var inPlace = pre.where === "in_place";
    pane.innerHTML = '<form>'
      + '<div class="rule"><b>Nobody is anonymous — buyers included.</b> Your name and email always; for work done at an address, a telephone too: a person calls you before any seller sees where the work is, and your money is held until you say it is done.</div>'
      + '<div><label for="gp-need-subject">What you need, in a sentence</label><input id="gp-need-subject" value="' + esc(pre.subject || "") + '" placeholder="Read the last three 10-Qs and tell me what changed"></div>'
      + '<div><label for="gp-need-note">Anything else the seller should know</label><textarea id="gp-need-note" rows="2"></textarea></div>'
      + '<div class="f2"><div><label for="gp-need-name">Your full name</label><input id="gp-need-name" autocomplete="name"></div><div><label for="gp-need-email">Email</label><input id="gp-need-email" type="email" autocomplete="email"></div></div>'
      + '<div class="f2"><div><label for="gp-need-where">Where the work happens</label><select id="gp-need-where"><option value="remote"' + (inPlace ? '' : ' selected') + '>remote — over the wire</option><option value="in_place"' + (inPlace ? ' selected' : '') + '>in person — at an address</option></select></div>'
      + '<div><label for="gp-need-budget">Budget, in dollars (optional)</label><input id="gp-need-budget" type="number" min="1" step="1"></div></div>'
      + '<div class="place f2" style="' + (inPlace ? '' : 'display:none') + '"><div><label for="gp-need-phone">Telephone</label><input id="gp-need-phone" type="tel" autocomplete="tel"></div><div><label for="gp-need-city">City and country</label><input id="gp-need-city" placeholder="Clifton, USA"></div></div>'
      + '<div class="row"><span class="hint">Nothing is owed. Bids come to your email; you pick one or none.</span><button class="btn" type="submit">Post it</button></div><div class="msg"></div></form>';
    var f = pane.querySelector("form"), msg = f.querySelector(".msg"), wsel = f.querySelector("#gp-need-where"), place = f.querySelector(".place");
    wsel.addEventListener("change", function () { place.style.display = wsel.value === "in_place" ? "" : "none"; });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var cc = (f.querySelector("#gp-need-city").value || "").split(","), city = (cc[0] || "").trim(), country = (cc[1] || "").trim();
      get(API + "/?" + q({ action: "want", site: SITE, subject: f.querySelector("#gp-need-subject").value, note: f.querySelector("#gp-need-note").value,
          name: f.querySelector("#gp-need-name").value, email: f.querySelector("#gp-need-email").value, where: wsel.value, budget: f.querySelector("#gp-need-budget").value,
          phone: f.querySelector("#gp-need-phone").value, city: city, country: country }))
        .then(function (d) { msg.innerHTML = d.ok ? '<div class="done"><b>Posted.</b> ' + esc(d.note) + '</div>' : '<div class="warn"><b>Not yet:</b> ' + esc((d.missing || [d.error]).join(" · ")) + '</div>'; })
        .catch(function () { msg.innerHTML = '<div class="warn">Could not reach the market.</div>'; });
    });
  }

  /* ---- sell here ---------------------------------------------------------- */
  function sellForm() {
    var tok = token();
    if (tok) return mine(tok);
    pane.innerHTML = '<form>'
      + '<div class="rule"><b>The rule, before the form.</b> Nobody sells here anonymously: a real name, a telephone, and where you are. A person telephones you before your first listing shows. No fixed address? Fine — keep location sharing on, and check in every month.</div>'
      + '<div class="f2"><div><label for="gp-s-name">Full name, first and last</label><input id="gp-s-name" autocomplete="name"></div><div><label for="gp-s-email">Email</label><input id="gp-s-email" type="email" autocomplete="email"></div></div>'
      + '<div class="f2"><div><label for="gp-s-phone">Telephone — we call it</label><input id="gp-s-phone" type="tel" autocomplete="tel"></div><div><label for="gp-s-cred">Licence or credential, if any</label><input id="gp-s-cred" placeholder="CRD, bar number, press card…"><p class="hint">Only a seller with one on file may mark work as advice.</p></div></div>'
      + '<div class="f2"><div><label for="gp-s-city">City</label><input id="gp-s-city" autocomplete="address-level2"></div><div><label for="gp-s-country">Country</label><input id="gp-s-country" autocomplete="country-name" placeholder="USA"></div></div>'
      + '<div class="check"><input id="gp-s-nomad" type="checkbox"><label for="gp-s-nomad" style="text-transform:none;letter-spacing:0;font:14px var(--gp-sans);color:var(--gp-ink2)"><b>I move around — no fixed address.</b> I will keep my location on and check in monthly.</label></div>'
      + '<div class="row"><button class="btn quiet" type="button" id="gp-s-locate">Use my location</button><span class="hint" id="gp-s-locmsg">Optional for a fixed address; required if you move around. The exact point is never published — only your city and country.</span></div>'
      + '<div><label for="gp-s-about">About you, in a few lines</label><textarea id="gp-s-about" rows="2" placeholder="what you do, how long you have done it"></textarea></div>'
      + '<div class="rule" style="background:var(--gp-sky2);border-color:var(--gp-line);color:var(--gp-ink2)"><b>What you can do</b> — your first offer, in your own words. You can add more once you are verified.</div>'
      + '<div><label for="gp-s-title">The task</label><input id="gp-s-title" placeholder="I will read your company&rsquo;s warrant agreement and tell you what it permits"></div>'
      + '<div class="f2"><div><label for="gp-s-price">Your price, in dollars</label><input id="gp-s-price" type="number" min="1" step="1" placeholder="150"></div><div><label for="gp-s-where">Where</label><select id="gp-s-where"><option value="remote">remote — over the wire</option><option value="in_place">in person — at the buyer&rsquo;s address</option></select></div></div>'
      + '<div class="f2"><div><label for="gp-s-delivery">Delivered as</label><select id="gp-s-delivery"><option value="text">written</option><option value="voice">written + a machine voice</option><option value="own">written + my own voice</option><option value="file">a file</option><option value="in_person">in person</option></select></div><div><label for="gp-s-days">Turnaround, days</label><input id="gp-s-days" type="number" min="0" step="1" placeholder="2"></div></div>'
      + '<div class="row"><span class="hint">A flat fee comes off each sale — never a percentage. Already verified? <a href="#" id="gp-s-havetoken">Paste your token</a>.</span><button class="btn" type="submit">Apply to sell</button></div><div class="msg"></div></form>';
    var f = pane.querySelector("form"), msg = f.querySelector(".msg"), pos = { lat: null, lng: null };
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
        nomad: nomad ? 1 : 0, location_on: (nomad || pos.lat != null) ? 1 : 0, lat: pos.lat, lng: pos.lng, about: f.querySelector("#gp-s-about").value };
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
        + '<div class="row"><span class="hint">Sales released: ' + (d.sales ? d.sales.released : 0) + ' · earned ' + esc(d.sales ? d.sales.earned : "$0") + '</span><button class="btn quiet" id="gp-signout" style="padding:6px 10px;font-size:13px">Forget this token</button></div></div>'
        + '<form id="gp-offer"><div class="rule"><b>Add what you can do.</b> Your words, your price. It shows with your name and city.</div>'
        + '<div><label for="gp-o-title">The task</label><input id="gp-o-title" value="' + esc(first ? first.title : "") + '"></div>'
        + '<div><label for="gp-o-blurb">A line or two more (optional)</label><input id="gp-o-blurb"></div>'
        + '<div class="f2"><div><label for="gp-o-price">Price, dollars</label><input id="gp-o-price" type="number" min="1" step="1" value="' + esc(first ? first.price : "") + '"></div><div><label for="gp-o-where">Where</label><select id="gp-o-where"><option value="remote"' + (first && first.where === "in_place" ? '' : ' selected') + '>remote</option><option value="in_place"' + (first && first.where === "in_place" ? ' selected' : '') + '>in person</option></select></div></div>'
        + '<div class="f2"><div><label for="gp-o-delivery">Delivered as</label><select id="gp-o-delivery"><option value="text">written</option><option value="voice">written + machine voice</option><option value="own">written + my own voice</option><option value="file">a file</option><option value="in_person">in person</option></select></div><div><label for="gp-o-days">Turnaround, days</label><input id="gp-o-days" type="number" min="0" step="1" value="' + esc(first ? first.days : "") + '"></div></div>'
        + '<div class="check"><input id="gp-o-advice" type="checkbox"' + (you.credential ? '' : ' disabled') + '><label for="gp-o-advice" style="text-transform:none;letter-spacing:0;font:14px var(--gp-sans);color:var(--gp-ink2)">Mark as <b>advice</b>' + (you.credential ? ' — under my credential on file' : ' — needs a licence on file; everything else is an opinion') + '</label></div>'
        + '<div class="row"><span class="hint"></span><button class="btn" type="submit">Put it up</button></div><div class="msg"></div></form>'
        + (d.offers && d.offers.length ? '<div class="rule" style="background:var(--gp-paper)"><b>Your offers:</b> ' + d.offers.map(function (o) { return esc(o.title) + ' (' + esc(o.price) + ')'; }).join(' · ') + '</div>' : '')
        + '</div>';
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
      pane.querySelector("#gp-signout").addEventListener("click", function () { setToken(""); sellForm(); });
    }).catch(function () { pane.innerHTML = '<div class="warn">Could not reach the market.</div>'; });
  }

  var first = location.hash.slice(1);
  if (DOORS.indexOf(first) > -1 && first !== "offered") { pick(first); show(first); } else offered();
  } /* boot */
})();
