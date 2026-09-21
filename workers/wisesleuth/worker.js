/* BUILT 2026-09-21 · wisesleuth 1a
   ============================================================================
   WISESLEUTH.COM — the research club's own site. His call, 21 Sep: "make a
   site for it that links to gigapoo.com." The page itself lives in the
   gigapoo repo (wisesleuth.html) so it deploys with the engine; this worker
   serves it AT wisesleuth.com — no redirect, the club has its own address —
   and passes anything else (gigs.js, the demo) straight through to
   gigapoo.com. Route: *wisesleuth.com/* → wisesleuth. Deploy with
   .\tools\cf.ps1 deploy wisesleuth.
   ============================================================================ */
const HOME = "https://gigapoo.com";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    let path = url.pathname;
    if (path === "/" || path === "/index.html" || path === "/wisesleuth" || path === "/wisesleuth.html") path = "/wisesleuth.html";
    const upstream = await fetch(HOME + path + url.search, { headers: { "User-Agent": "wisesleuth.com/1a", "Accept": request.headers.get("Accept") || "*/*" }, cf: { cacheTtl: 300 } });
    const h = new Headers(upstream.headers);
    h.set("Cache-Control", "public, max-age=300");
    h.set("X-Served-For", "wisesleuth.com");
    h.delete("Content-Security-Policy");
    return new Response(upstream.body, { status: upstream.status, headers: h });
  }
};
