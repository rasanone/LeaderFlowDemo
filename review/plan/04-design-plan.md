# 04 — UI/UX and Efficiency Design Plan

**Author:** Senior Web Dev Expert
**Date:** 2026-11-12
**Target launch:** ~Tue Dec 1, 2026 (at least one week before applications open)
**Inputs:** `review/prompt.md` (Appendix A = Janiece's email, Appendix B = proposal, source of truth for scope), the demo in this repo, `review/index.html` (earlier design review)
**Read with:** the Cybersecurity Developer's brief. Every point that touches security is marked **→ for Security brief** so the PM can reconcile the two documents.

---

## 0. Summary (one screen)

| Question | Verdict |
|---|---|
| Homepage carousel | **No carousel in Phase 1.** Keep the single static hero. In Phase 2, show testimonials as a **static grid** (default). Only if there are more than 3 quotes, use a user-controlled scroll-snap row with no autoplay (spec in §1.4, about 1 KB of JS). |
| HTML/CSS/JS vs React | **Stay with plain HTML/CSS/JS.** Every integration (forms, monday.com, Sheets, email) has to run on the server anyway, because API keys can't go to the browser. React adds 45–60 KB gzipped of runtime, a build chain and an npm supply chain, and fixes nothing this site has. If a CMS comes later (Phase 3), use a static site generator (Eleventy or Astro) that ships no client-side framework. |
| Cloudflare Pages + Pages Functions | **Good fit, recommended.** Static requests and bandwidth are free and unlimited. Functions handle the contact and Flowcilitator forms within the free daily request allowance. Preview deployments behind Cloudflare Access give Janiece her private preview, Web Analytics is cookieless, and Turnstile is free. Use **Git integration** with a repo LeaderFlow owns. |
| Application form | **Use a hosted form builder (Tally recommended)** so the team can edit questions without the developer, as the proposal promises, and so resume upload works without Google sign-in. Contact and Flowcilitator forms stay **custom HTML + one Pages Function + Turnstile → Google Sheet + formatted email**. Confirm this split with Janiece on the Friday call (§3.7). |
| Biggest efficiency win | **Fonts.** Google Fonts currently delivers about **318 KB** of WOFF2 (Fraunces roman 149 KB + italic 121 KB + Inter 48 KB). That is about 80% of the homepage's first-view weight. Self-hosted, trimmed fonts get it to about **110–130 KB**. |
| Biggest hidden risk found | The "LeaderFlow Experience" video is a **194 MB MP4 still hosted on the old, compromised WordPress server**. It will break when the old hosting is cancelled. It is also too large for Pages (25 MiB per-file limit). It has to move to Vimeo before launch. |

Must-do hours for the December launch total about **44 h** (§6).

---

## 1. Homepage carousel

### 1.1 What exists

- **Live site:** a Revolution Slider rotating hero (one slide is a duplicate) plus four Owl carousels. Both are jQuery plugins that load their own JS/CSS on every page view whether or not anyone interacts. The PM's live-site audit has the exact byte counts; I did not run the live site's scripts, because those pages are treated as hostile.
- **Demo:** 0 carousels. One static hero (`index.html`): headline, lede, one CTA, an arch-cropped photo (`hero-accelerate.webp`, 1010×627, 55 KB, `fetchpriority="high"`). Sponsor logos are a static tiered grid. Graduates use accessible tabs (`role="tablist"`, arrow keys), not a carousel.

### 1.2 Final recommendation: no rotating element in Phase 1

Reasons, in priority order:

1. **Conversion.** The homepage's main job from December is "Apply" (Appendix B, Phase 1). A rotating hero splits that message across slides people mostly don't see. Click-through on slides after the first is consistently very low, and a single clear CTA does better. One static hero with "Apply" is the right Phase 1 design.
2. **Performance.** A slider usually makes the LCP element a JS-controlled image, or one of several competing images, which delays LCP. The static hero lets the browser find the LCP image in the HTML and fetch it at high priority, which the demo already does.
3. **Accessibility.** Auto-rotation triggers WCAG 2.2.2 (Pause, Stop, Hide), moves focus targets around, and is a known problem for screen-reader and low-vision users. Having no rotation means no compliance risk.
4. **Security and maintenance.** Fewer scripts mean less attack surface and nothing to update (→ for Security brief: no third-party slider JS, so a tighter `script-src`).

Owl carousel replacements, already done in the demo: sponsor logos → static tiered grid; people → static grid; graduates → tabs.

### 1.3 Phase 2: "Impact numbers and testimonials where people make decisions"

Appendix B Phase 2 includes testimonials. Decision rule:

- **≤ 3 testimonials (default):** a static 1–3 column grid of `<figure><blockquote>…</blockquote><figcaption>…</figcaption></figure>`. It needs no JS and is fully accessible. This is the recommendation.
- **> 3 testimonials:** a user-controlled scroll-snap row, specified below. Never autoplay.

### 1.4 Spec if a rotating element is kept (Phase 2, only if > 3 quotes)

**HTML (works with no JS: it is just a horizontally scrollable list)**

```html
<section class="quotes" aria-labelledby="quotes-title">
  <h2 id="quotes-title">What graduates say</h2>
  <div class="quotes__rail" role="region" aria-label="Testimonials, scrollable" tabindex="0">
    <ul class="quotes__list">
      <li class="quotes__item"><figure>…<blockquote>…</blockquote><figcaption>…</figcaption></figure></li>
      …
    </ul>
  </div>
  <div class="quotes__controls" hidden>  <!-- un-hidden by JS -->
    <button type="button" class="quotes__btn" data-dir="-1" aria-controls="…">Previous testimonial</button>
    <button type="button" class="quotes__btn" data-dir="1"  aria-controls="…">Next testimonial</button>
  </div>
</section>
```

**CSS**

```css
.quotes__list { display: grid; grid-auto-flow: column; grid-auto-columns: min(85%, 380px);
  gap: 24px; list-style: none; margin: 0; padding: 0; }
.quotes__rail { overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: var(--gutter);
  overscroll-behavior-x: contain; }
.quotes__item { scroll-snap-align: start; }
.quotes__rail:focus-visible { outline: 3px solid var(--sky-300); outline-offset: 4px; }
@media (prefers-reduced-motion: no-preference) { .quotes__rail { scroll-behavior: smooth; } }
@media (min-width: 1100px) { /* if everything fits, there is nothing to scroll */ }
```

**JS (~1 KB, added to `site.js`)**

- Show the controls only when the list overflows (`scrollWidth > clientWidth`). Re-check on `resize` with a `ResizeObserver`.
- Prev/Next call `rail.scrollBy({ left: dir * item.offsetWidth, behavior: reduced ? 'auto' : 'smooth' })`, where `reduced = matchMedia('(prefers-reduced-motion: reduce)').matches`.
- An `IntersectionObserver` (root = rail, threshold 0.95) on the first and last items sets `aria-disabled="true"` (and a disabled style) on Prev/Next at the ends. Keep the buttons focusable so focus is never lost.
- No dots and no slide counter. With plain list semantics, screen readers already announce "list, 5 items".

**Accessibility checklist**

| Requirement | How it is met |
|---|---|
| WCAG 2.2.2 Pause, Stop, Hide | Nothing moves on its own, so 2.2.2 doesn't apply. **No autoplay, ever.** If someone later asks for autoplay, it needs a visible Pause button, has to stop on hover/focus, and has to respect reduced motion. Recommend against it. |
| 2.1.1 Keyboard | The rail is focusable (`tabindex="0"`) and arrow keys scroll it natively. Buttons are real `<button>`s. All links inside quotes are reachable by Tab. |
| 2.4.7 / 2.4.11 Focus visible / not obscured | Visible focus ring. `scroll-padding` keeps focused cards clear of the edge. The sticky header already has `scroll-padding-top`. |
| 2.5.8 Target size | Buttons are at least 44×44 px (2.5.8 asks for 24×24). |
| 2.3.3 / reduced motion | `behavior: 'auto'` and no smooth scrolling under `prefers-reduced-motion: reduce`. The existing global reduce rule also applies. |
| 1.3.1 Info and relationships | `<ul>`/`<li>` + `<figure>`/`<blockquote>`/`<figcaption>`. The region has a label. No `aria-live` (nothing changes by itself). |
| Touch | Native swipe via overflow scrolling, with no JS gesture handling. |

Cost: about 1 KB JS and 0.5 KB CSS, no library, no layout shift (fixed column widths).

---

## 2. HTML/CSS/JS vs React

### 2.1 Recommendation: stay static (plain HTML/CSS/JS)

| Factor | Static (current) | React (SPA or Next.js) |
|---|---|---|
| Client JS today | 7.0 KB raw / **2.4 KB gzip** | Runtime alone is about 45–60 KB gzip before any app code |
| Rendering | HTML arrives complete and paints immediately | Client-side render or SSR + hydration. Hydration adds main-thread work (INP risk on low-end phones) |
| Build chain | None. What's in the repo is what's deployed | Node, a bundler, hundreds of transitive npm packages |
| Security (priority #1) | No dependencies, nothing to patch, small CSP | npm supply chain, framework CVEs, a build server running third-party code (→ for Security brief) |
| Maintainability by others / $35/h updates | Anyone can edit an HTML file | Needs a React developer and a working toolchain years later |
| Integrations (monday.com, Sheets, email) | Server-side Function. Same either way | Server-side either way. React gives no integration advantage |

**The key point:** monday.com, Google Sheets and email APIs all need secret tokens, so they **must** run server-side. The browser only ever needs to POST a form to `/api/...`, and that is the same in plain HTML and in React. React solves interactive-UI problems (dashboards, complex client state). This site has 11 content pages, two forms, tabs and a menu.

**If the team later wants self-editing (the "simple editing tool" in Appendix B / Phase 3):** move to a static site generator such as **Eleventy** (closest to the current files, zero client JS by default) or **Astro** (zero JS by default, "islands" if one widget ever needs interactivity), paired with a Git-based or headless CMS that gives each editor their own login with 2FA. Pages builds either one. This is **optional / out of scope** for Phases 1–2.

### 2.2 Integration architecture (now and later)

```
Browser (static HTML form, works without JS)
   │  POST /api/contact   (fetch() if JS runs; normal form POST + 303 redirect if not)
   ▼
Cloudflare Pages Function  functions/api/contact.js   (runs only on /api/*)
   1. Accept POST only; check Content-Type and body size (→ Security brief)
   2. Verify Turnstile token with siteverify (→ Security brief)
   3. Validate and normalise fields (length limits, email format, strip control chars)
   4. Fan out (in parallel; non-critical branches via context.waitUntil):
        a) Google Apps Script web app (owned by LeaderFlow's Google account)
             → appends a row to the team's Google Sheet
             → sends a formatted notification email from LeaderFlow's own account
        b) LATER: monday.com GraphQL API (api.monday.com/v2, `create_item` mutation)
             using an API token stored as an encrypted Pages secret
        c) LATER: anything else (Slack, Mailchimp tag) through the same pattern
   5. Respond 200 JSON (fetch) or 303 → /thanks/ (no-JS)
```

- **Adding monday.com later is a few hours of Function code**, not a re-platform: add branch (b), store `MONDAY_TOKEN` as a secret, map fields to board columns. Alternatives that need no code: monday's own **WorkForms** (a form builder that writes straight to a board, which would also give the team editable questions), or Tally → monday through Zapier/Make.
- **Why Apps Script for the Sheet and email:** it runs inside LeaderFlow's Google account, so there are no Google service-account keys to store, no third-party email provider, and notification emails come from their own domain/account. The Function calls it with a long random shared secret in a header. (→ for Security brief: deploy the Apps Script as "Execute as: me / Anyone can access", check the shared secret on every request, store the secret in Pages encrypted variables, rotate it at handover.)
- **Alternative for email:** a transactional provider (e.g. Resend or Postmark). That adds an account and DNS records (SPF/DKIM). Use it only if Apps Script quotas or deliverability turn out to be a problem. Cloudflare Email Routing's send-email binding can only send to verified addresses and needs Cloudflare MX records on the domain, which would conflict with LeaderFlow's Google email, so **don't use it** on the apex domain.

---

## 3. Cloudflare Pages + Pages Functions: evaluation

### 3.1 Fit

| Need (from Appendix B) | Cloudflare feature | Fit |
|---|---|---|
| "More secure hosting so the hacking can't return" | Static files on Pages; no server, CMS or login | Excellent |
| "Loads quickly on phones" | Global edge network, HTTP/3, automatic Brotli, Early Hints | Excellent |
| Forms with spam protection | Pages Functions + Turnstile | Good |
| "Keeps all current page links working" | `_redirects` (and Bulk Redirects once the zone is on Cloudflare) | Good |
| "Visitor statistics without tracking anyone" | Cloudflare Web Analytics (cookieless) | Good |
| Private preview link | Preview deployments + Cloudflare Access | Good |
| "Hosting is free for a site this size" | Pages Free + Workers Free | Yes |
| Old site as instant fallback | DNS switch back + Pages one-click rollback | Good |

**Product-direction note (honest caveat):** since 2025 Cloudflare has recommended **Workers with Static Assets** for *new* projects and has been bringing Pages features to Workers. Pages is still fully supported, and for a static site with a couple of Functions it remains the simplest option: dashboard Git integration, preview URLs and the Access toggle are all built in. **Recommendation: use Pages now.** The files (`_headers`, `_redirects`, `functions/`) carry over to Workers if that is ever needed. I'm not aware of a Pages end-of-life date; re-check at kickoff.

### 3.2 Free-tier limits (verify current figures on Cloudflare's docs at kickoff)

| Item | Free limit (to my knowledge, mid-2026) | This site's use |
|---|---|---|
| Static requests / bandwidth | Unlimited | — |
| Builds | 500 per month, 1 concurrent | A few per week |
| Files per deployment | 20,000 | ~260 |
| Max single file size | 25 MiB | **The 194 MB promo MP4 cannot be hosted here** (§5.9) |
| Custom domains per project | 100 | 2 (apex + www); impact is a separate project |
| Pages Functions | Billed as Workers: **100,000 requests/day** (resets 00:00 UTC), **10 ms CPU** per invocation | Tens per day. Network wait (fetch to Apps Script) doesn't count as CPU |
| `_headers` | 100 rules | ~10 |
| `_redirects` | 2,000 static + 100 dynamic | Depends on the PM's URL audit; well under |
| Turnstile | Free, unlimited verifications; a cap on widgets per account (I believe 20, verify) | 2–3 widgets |
| Web Analytics | Free | — |
| Cloudflare Access (Zero Trust Free) | Up to 50 users | 2–5 people |

**Make sure Functions only run on `/api/*`.** If all functions live under `functions/api/`, Pages generates a `_routes.json` that only includes `/api/*`, so page and image requests never invoke (or count against) Functions. Keep it that way. Don't add a root `_middleware.js`.

### 3.3 Deploy flow: Git integration (recommended) vs Direct Upload

| | Git integration | Direct Upload (Wrangler or drag-and-drop) |
|---|---|---|
| How | Connect a GitHub repo in an account/org **LeaderFlow owns**. Push to `main` = production, any other branch = preview URL | `wrangler pages deploy public` from the developer's machine |
| Credentials | None on the developer's machine. The Cloudflare GitHub App is scoped to the one repo | Needs a Cloudflare API token locally (→ for Security brief) |
| History / rollback | Every commit is a deployment, with one-click "Rollback" in the dashboard | Rollback works, but there is no source history unless kept separately |
| Handover ("you will receive all website files") | The repo *is* the handover | Separate step |
| Switching later | A Direct Upload project can't be converted to Git integration; you'd create a new project | — |

**Choose Git integration.** Settings: framework preset **None**, build command **empty**, output directory **`public`**, root `/`.

**Required repo restructure (Must):** today the deployable root is the repo root, which would publish `review/` (screenshots of the spam pages, internal review), `README.md`, and any untracked notes such as `review/prompt.md` (client name, payment terms) if they were ever committed. Proposed layout:

```
public/            ← the site (index.html, page folders, assets/, _headers, _redirects, 404.html, robots.txt, sitemap.xml)
functions/api/     ← contact.js, flowcilitator.js (Pages Functions; NOT inside public/)
tools/             ← optional dependency-free scripts (images, cache-bust, budget)
review/            ← internal only, never deployed
README.md
```

Delete `.nojekyll` (it only matters for GitHub Pages). → for Security brief: confirm nothing internal sits under `public/`, and add `review/prompt.md` and other notes to `.gitignore`, or keep them out of the client-owned repo.

### 3.4 `_headers` (performance part; security headers come from the Security brief)

```
# public/_headers
/*
  # → for Security brief: CSP, HSTS, X-Content-Type-Options, Referrer-Policy,
  #   Permissions-Policy, frame-ancestors etc. go here.

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/assets/img/*
  Cache-Control: public, max-age=31536000, immutable
  # Rule: never overwrite an image in place. A changed image gets a new filename.

/assets/css/*
  Cache-Control: public, max-age=31536000, immutable
/assets/js/*
  Cache-Control: public, max-age=31536000, immutable
  # Only safe with the ?v=<hash> cache-buster in §5.5. Without it, use:
  # Cache-Control: public, max-age=3600, must-revalidate

/*.pdf
  Cache-Control: public, max-age=86400

# Keep pages.dev hostnames out of search results
https://:project.pages.dev/*
  X-Robots-Tag: noindex
https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex
```

- HTML keeps Pages' default (`max-age=0, must-revalidate` with ETag), so content changes appear right away and repeat visits get cheap 304s from the edge.
- `_headers` **doesn't apply to Function responses**. Functions set their own headers in code (→ for Security brief).

### 3.5 `_redirects`

- One line per old URL from the PM's live-site audit, e.g. `/old-path/  /new-path/  301`. The page folders already mirror the live URLs, so most need no rule.
- Pages already redirects `/about-us` → `/about-us/` for folder pages.
- Old WordPress artefacts: `/wp-content/uploads/<file>` links that people shared (PDFs, the promo video) → 301 to their new homes. Leave `/wp-admin`, `/wp-login.php`, `/xmlrpc.php` and `?p=` URLs on the 404 page. Don't redirect them to the homepage, because that hides scanner noise and confuses search engines. (→ for Security brief: optionally block these paths with a WAF custom rule once the zone is on Cloudflare.)
- **Add `public/404.html`. This is a Must.** Without a top-level 404.html, Pages treats the project as a single-page app and returns the homepage with **200** for every unknown URL: spam URLs from the hack would "resolve", soft-404s would hurt SEO, and the redirect audit would be impossible to verify. The 404 page should have a search-free list of the main pages + "Apply" + Contact.

### 3.6 Preview deployments and the private preview

- Every non-`main` branch gets `https://<branch>.<project>.pages.dev`, and every deployment also gets a unique hash URL. Use a branch named `preview` for Janiece's link. It stays stable across her 2–3 rounds of changes.
- **Access control:** in the Pages project, **Settings → General → "Enable access policy"** creates a Cloudflare Access application covering the *preview* deployments. Add a policy that allows Janiece's (and named teammates') email addresses, using the **One-time PIN** login method, so nobody needs a Cloudflare account. (→ for Security brief)
- **Gap to close:** that toggle protects previews, not the production `<project>.pages.dev` hostname. Until launch, either don't merge to `main`, or add a second Access application covering `<project>.pages.dev` (remove it at launch, or keep it and rely on `X-Robots-Tag: noindex`). (→ for Security brief)
- Test forms on the preview with Turnstile **test keys** and a separate "TEST" Sheet tab, so test submissions never reach the real reviewers by mistake.

### 3.7 Forms: where the data goes and who can edit the questions

Appendix B promises: *"Applications go into a spreadsheet LeaderFlow owns or arrive as a neatly formatted email, and your team can edit the questions without me."* Options, compared honestly:

| Option | Team edits questions? | Data lands in | Resume upload | Spam protection | Performance | Security surface |
|---|---|---|---|---|---|---|
| **A. Google Form** (link or embed) | Yes | Google Sheet they own; built-in email alerts | **Respondents must sign in to Google** to upload a file. A real problem for applicants | Weak (no CAPTCHA option) | Embed is a heavy iframe; a link costs nothing | Google-hosted; nothing on our side |
| **B. Tally** (link, popup or embed) | Yes, in a friendly editor | Tally + free Google Sheets integration + email notifications (free tier, verify) | Yes, no sign-in (free tier has a per-file size cap, I believe 10 MB, verify) | Built-in spam protection / CAPTCHA option | Iframe/JS only on the page that uses it, or a facade that loads on click | Data held by a third party (EU-hosted). DPA/privacy review (→ for Security brief) |
| **C. monday WorkForms** | Yes | A monday board directly | Yes | Basic | Iframe | Only sensible if they already use monday |
| **D. Custom HTML form + Pages Function** | **No** (the developer edits the HTML) | Sheet via Apps Script + formatted email | Needs R2 storage + virus/size handling = more attack surface | Turnstile + server validation | Best (no iframe) | Our code; must be built carefully (→ for Security brief) |

**Recommendation (decide on the Friday call):**

- **Application form → Tally (Option B).** This is the only form whose questions change from year to year. It needs a resume upload and probably conditional questions. The team edits it themselves and responses flow into a Sheet they own. On the site, `application-form/` stays a page in our design (dates, eligibility checklist, "what you'll need", time estimate) with a primary **"Start your application"** button that opens the Tally form (link or popup). Then Tally's script only loads when someone wants to apply. Fallback if they prefer Google: Google Form **plus** "email your resume to…" or a Drive upload. Weaker, but zero new vendors.
- **Contact + Flowcilitator forms → keep the existing custom HTML forms (Option D)** with one Function, Turnstile and Apps Script → Sheet + email. These forms are short and rarely change, already match the design, add no iframe weight to the homepage, and are best protected by our own Turnstile check. Tell Janiece plainly: changing *these* fields is a small update ($35/h), or they can be moved to Tally too if she wants full self-service. That keeps the promise honest.
- Every form gets a written **"what happens next"** message and a **test submission** to the real recipients before launch (Appendix B "sending test applications to your team").

**Front-end changes for the custom forms (Must):**

- Bug: the forms have `novalidate`, and `site.js` never calls `checkValidity()`, so empty or invalid required fields are submitted. Fix: on submit, call `form.reportValidity()`, or run custom inline validation with `aria-invalid` + `aria-describedby` error text.
- Add `action="/api/contact"` (or `/api/flowcilitator`) so forms work without JS (Function returns a 303 to `/thanks/`).
- Disable the submit button while sending (no double submits). Move focus to the status message on success or error. Keep entered values on error.
- Add a hidden honeypot field (cheap, alongside Turnstile).
- Update the README section that suggests Formspree.

### 3.8 Turnstile

- Use **Managed** mode (usually invisible; shows a checkbox only when needed). Restrict the widget's hostnames to `leaderflow.org`, `www.leaderflow.org`, and the preview hostname (→ for Security brief).
- **Load lazily:** the homepage has a contact form near the bottom. Load `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` only when the user first focuses a field in a form (or the form scrolls into view), then call `turnstile.render()`. This keeps Turnstile's script off the critical path for the ~99% of visitors who never use the form.
- The server **must** verify every token with `siteverify` (secret key in encrypted Pages variables; tokens are single-use and expire after 300 s) (→ for Security brief).
- Mailchimp: the "Subscribe" button links to Mailchimp's hosted form (`eepurl.com/...`), so Mailchimp's own double opt-in and reCAPTCHA settings apply there. Those settings are turned on in Mailchimp, not on our site.

### 3.9 Web Analytics

- Enable in the Pages project (**Metrics → Web Analytics**). Cloudflare injects a small beacon (`static.cloudflareinsights.com/beacon.min.js`, a few KB, async) on the next deployment. It uses **no cookies or local storage and no fingerprinting**, which matches "visitor statistics without tracking anyone personally".
- It also reports **Core Web Vitals from real visitors** (LCP/INP/CLS by page), which becomes our field-data monitor (§5.11).
- Caveats to tell the client: ad blockers can block the beacon, so counts are a floor, not exact. Data may be sampled. Retention is limited (I believe about 6 months, verify). Once the zone is on Cloudflare, zone-level HTTP traffic analytics also show server-side request counts with no JS at all.
- (→ for Security brief: the CSP must allow `script-src https://static.cloudflareinsights.com` and `connect-src https://cloudflareinsights.com`.)

### 3.10 Domains and DNS (coordinate with the PM and Security brief)

- **impact.leaderflow.org (needed first, before the main launch):** add a **CNAME** at GoDaddy, `impact` → `<impact-project>.pages.dev`, then add the custom domain in the Pages project. A subdomain doesn't require moving nameservers, so this fits the 15-minute GoDaddy call in Appendix B.
- **leaderflow.org apex:** Pages custom domains on an apex require the zone to be on Cloudflare, so the nameservers change from GoDaddy to Cloudflare (the domain *registration* stays at GoDaddy, as promised). Before the switch, every existing record (MX, SPF, DKIM, DMARC, Google verification, Mailchimp/Givebutter records) must be copied exactly. (→ for Security brief: DNSSEC, CAA records, who has Cloudflare account access, 2FA.)
- When the zone moves, recreate the `impact` CNAME as a proxied record in Cloudflare DNS.

---

## 4. UI/UX refinements, page by page

Legend: **P1** = Appendix B Phase 1 (launch). **P2** = Appendix B Phase 2. **Opt** = optional / out of scope (beyond the proposal; only with client approval). Content changes need Janiece's copy or approval, and any new wording goes to her as a draft (Appendix B).

### 4.1 Site-wide

| # | Change | Scope | Notes |
|---|---|---|---|
| G1 | **One donate link everywhere.** Today header/most pages use `givebutter.com/LFGivingTuesday2024` (11 places), while the homepage donate panel and the Sponsor page use `givebutter.com/ocXKYA` (3 places) | P1 | Appendix B "donate links all match". Janiece to confirm which is current. The 2024 GivingTuesday campaign name suggests `ocXKYA` is the general link, but don't guess |
| G2 | Footer "© 2023" → "© 2026" on all 11 pages | P1 | Static text; update at each content refresh (put it in the how-to guide) |
| G3 | Application dates identical everywhere (FAQ says Jan 4, 2026; hidden Application Process text says Jan 9, 2026; callouts say "2026 … now closed") | P1 | Single source: the PM's content sheet |
| G4 | **State-aware application messaging.** Two states, switched by editing one line per page: *Open* (gold "Apply now" + close date) / *Closed* (the existing callout + "Subscribe for updates") | P1 | Keep it static; no JS date logic, which can show stale or wrong states if the client's dates move |
| G5 | Fix the "reveal" flicker: content already in the viewport on load paints, gets hidden when JS removes `no-js`, then fades back in. In `site.js`, mark elements already in the viewport `is-visible` *before* removing `no-js`, and never put `.reveal` on the first section of a page | P1 | Small; improves perceived speed. Also remove the nested `.reveal` inside `.reveal` on the homepage callout |
| G6 | `404.html`, `robots.txt`, `sitemap.xml`, `<link rel="canonical">` on every page | P1 | Supports "keeps all your current page links working" and clean indexing after the hack |
| G7 | Favicon: add a 180×180 `apple-touch-icon.png` and a `favicon.ico` fallback (only SVG exists today) | P1 | 15 min |
| G8 | Header CTA switches to **"Apply"** during the application window (Donate stays in the nav and footer) | Opt (small) | Beyond "Apply button on the homepage". Ask Janiece |
| G9 | Open Graph / LinkedIn share previews (`og:title`, `og:description`, `og:image` 1200×630, `twitter:card`) | P2 | Appendix B Phase 2 "Better previews when shared". **Exception:** the impact page gets them in P1, because it is the page being shared in the announcement (§4.4) |
| G10 | Privacy page (what analytics and forms collect, where data goes) | Opt | Recommended once forms collect personal data (→ for Security brief) |

### 4.2 Homepage (`index.html`)

| # | Change | Scope |
|---|---|---|
| H1 | **Hero CTA: primary gold "Apply now"** (→ `application-form/` when open; when closed → "How to apply" → `application-process/`). "About us" becomes a secondary ghost button | P1 (Appendix B: "clear Apply button on the homepage") |
| H2 | **Move the application status out of the video row.** It sits beside the video in the second section, where it reads as decoration. Put a one-line status strip in the hero under the buttons ("Applications for the 2027 cohort open Dec X–Jan Y" / "Applications are closed. Get updates →") | P1 |
| H3 | Hero LCP fix: no opacity animation on the hero image or headline (§5.6) | P1 |
| H4 | Donate panel uses the single confirmed link (G1) | P1 |
| H5 | **Sponsor wall:** 31 logos in 6 tiers, ~2 screen-heights on mobile. Proposal: show Foundational + National + Platinum on the homepage, then a "See all sponsors and partners →" link to `become-a-sponsor/`, where the full tiered wall already exists | **Needs client decision**, because sponsors may have been promised homepage placement. Effort is small. If they decline, at least tighten mobile spacing (2-column logos at ≤560px are already in CSS) |
| H6 | Typos left verbatim on purpose ("Acquire practice skills") get fixed with client approval | P1 (content) |
| H7 | Four starting points: apply / lead a session / become a sponsor / donate. Extend the existing two-panel `support-grid` to four cards; with H1 the hero keeps the single primary action | P2 |
| H8 | Impact numbers strip (3–4 numbers from the report, `<dl>`) + testimonials (§1.3) | P2 |
| H9 | "Get notified" sign-up when applications are closed (Mailchimp hosted form link, or an embedded Mailchimp form with double opt-in) | P2 |

### 4.3 Interior pages

| Page | Change | Scope |
|---|---|---|
| All interior heroes | The decorative header photo (`hdr-*.webp`, 1600×417, 33–46 KB, `fetchpriority="high"`) is `display:none` below 760 px, but **phones still download it at high priority** (an `<img>` inside a `display:none` container is still fetched). Wrap it in `<picture>` with `<source media="(min-width: 760px)" srcset="…">` and a tiny transparent `src` fallback, and drop `fetchpriority` (the H1 is the LCP on interior pages) | P1 (perf) |
| `leaderflow-development-program/` | Add the "Apply" CTA next to "Connect with Us" in "Your First Step Starts Here." Application status callout near the top | P1 |
| `application-process/` | Fix hidden/contradictory dates (G3). Add a 3–4 step timeline (apply → interview → notification → kickoff) **only from client-supplied facts**. Keep the eligibility cards | P1 (content from client) |
| `application-form/` | Becomes the launch page for applicants: dates, "what you'll need" (resume, questionnaire, time estimate), eligibility summary, primary "Start your application" → Tally (§3.7). Closed state = current callout + Subscribe | P1 |
| `participantfaqs/` | Fix the truncated last answer ("…long-term career vis"). Dates match G3. The FAQ section nav is hidden below 960 px; show it on mobile as a horizontally scrollable row of chips (no JS). Optional: `FAQPage` structured data | P1 (fixes) / Should (mobile nav) / Opt (schema) |
| `leaderflow-graduates/` | Responsive, correctly cropped headshots (§5.3). Make the "Field:"/"Industry:" labels consistent. Make the first row of the default tab eager-loaded (no `loading="lazy"` on the first ~4) | P1 (perf) / P1 (content fix with approval) |
| `flowcilitators/become-a-flowcilitator/` | Live form (§3.7). Required-field validation fix | P1 |
| `flowcilitators/meet-the-flowcilitators/` | Fine as is | — |
| Flowcilitators | Short summary + FAQ for prospective Flowcilitators | P2 |
| `become-a-sponsor/` | Donate links → single link (G1) | P1 |
| `connect-with-us/` | Live form; the "what happens next" message | P1 |
| `about-us/` | No structural change | — |

### 4.4 Impact report page (impact.leaderflow.org → later `/impact/`)

**Scope (Appendix B):** a short intro, 3–4 headline numbers, a clear "Download the report" button, a donate link. Free. Separate from the current site.

**Structure (single page):**

1. Slim header: LeaderFlow logo (links to leaderflow.org), Donate button.
2. Hero: H1 ("2025 Impact Report" or Janiece's title), a 2–3 sentence intro, primary **"Download the report (PDF, X MB)"**, secondary "Donate".
3. Headline numbers: `<dl class="facts">` with 3–4 items (big number in Fraunces, label in Inter). **No count-up animation**: it delays the content, adds JS, and screen readers can read in-between values. Static numbers are faster and more honest.
4. Optional: one photo (lazy) or a pull quote **only if it is in the report**.
5. Donate band (single confirmed Givebutter link) + "Learn about the program →" leaderflow.org.
6. Footer: © 2026, the Community Partners 501(c)(3) line.

**Performance approach:**

- Separate Pages project (e.g. `leaderflow-impact`, Git repo or folder owned by LeaderFlow). It doesn't depend on the old site or the main-site launch date.
- One HTML file with **all CSS inlined** (the page needs ~3–4 KB of the site's tokens and components). **No JS** except the Web Analytics beacon. Same self-hosted font subset as §5.1, but preload only the roman face.
- Budget: **≤ 60 KB total before the PDF** (HTML+CSS ~8 KB br, fonts ~70–90 KB if both faces are used; with Fraunces numbers only it can be ~50 KB). Target LCP < 1.5 s on mobile 4G.
- **PDF:** compress before publishing (e.g. Ghostscript `-dPDFSETTINGS=/ebook`, or the designer re-exports for screen). Report PDFs are often 10–30 MB, and a screen export is usually 2–5 MB. Must be < 25 MiB for Pages. Give it a stable, descriptive filename (`/LeaderFlow-2025-Impact-Report.pdf`), show the size on the button, and serve it from the same project. Link with a plain `<a href>` (the `download` attribute is optional; many people prefer to open it in the browser).
- **OG tags in P1 for this page** (title, description, 1200×630 image from the report cover), because the link is shared on LinkedIn and email right away.
- **Fallback (Appendix B):** if the PDF is late, Janiece shares a Google Drive link and the page follows.
- **Migration to `/impact/` at or after main launch:** copy the page into `public/impact/` on the main site and move the PDF to `public/impact/`. Then replace the impact project's content with a `_redirects` file: `/  https://leaderflow.org/impact/  301` and `/LeaderFlow-2025-Impact-Report.pdf  https://leaderflow.org/impact/LeaderFlow-2025-Impact-Report.pdf  301`. Every link shared in the announcement keeps working. Keep the impact project and its CNAME for at least 12 months.

---

## 5. Efficiency plan

### 5.1 Current state (measured in this repo, 2026-11-12)

| Asset | Raw | Compressed | Notes |
|---|---|---|---|
| `site.css` | 53.8 KB | 12.2 KB gzip / **10.5 KB Brotli** | One file, 864 lines |
| `site.js` | 7.1 KB | **2.4 KB gzip** | No dependencies |
| Google Fonts (Latin subset only) | — | **Fraunces roman 149 KB + Fraunces italic 121 KB + Inter 48 KB = 318 KB** | Fraunces requested with `ital,opsz,wght,SOFT`, the most expensive combination. All three are used on the homepage (italic in the hero `<em>`) |
| Fonts, other configs measured | — | Fraunces `opsz,wght 300–600` = 67 KB; `wght 300–600` = 37 KB; italic `wght 400` only = 23 KB; static 400 = 18 KB | Measured from the Google Fonts API with a Chrome UA |
| Promo video (`leaderflow.org/wp-content/.../leaderflow-promotional-video.mp4`) | **194 MB** | — | On the old, compromised host. Loads only on click (facade), but must move |

**Per page (HTML compressed; images = sum of unique images if the page is scrolled fully):**

| Page | HTML raw / gzip | `<img>` count | Image weight |
|---|---|---|---|
| Home | 21.8 / 5.7 KB | 39 | 492 KB |
| About | 14.1 / 4.2 KB | 11 | 330 KB |
| Sponsor | 15.1 / 3.8 KB | 31 | 297 KB |
| Program | 16.6 / 5.0 KB | 8 | 157 KB |
| Meet the Flowcilitators | 14.4 / 3.5 KB | 18 | 263 KB |
| Become a Flowcilitator | 13.6 / 4.2 KB | 5 | 86 KB |
| **Graduates** | **93.1 / 10.4 KB** | **175** | **3,029 KB** (2025 tab alone: 70 images ≈ 1.24 MB; other tabs are `hidden`, so their lazy images don't load until opened) |
| Connect / App form / App process / FAQ | 8–17 / 2.4–4.9 KB | 3 each | 40 KB |

**Homepage first view (before scrolling), estimated:** HTML 5.7 + CSS 10.5 + JS 2.4 + fonts 318 + hero 55 + logo 8.6 ≈ **400 KB**, ~10 requests over **3 origins** (site, fonts.googleapis.com, fonts.gstatic.com). **Fonts are ~80% of it.**

What is already good (keep): WebP everywhere, `width`/`height` on every `<img>` (175/175 on graduates), `loading="lazy"` on everything below the fold, `fetchpriority="high"` on the hero, video facades with `dnt=1` on Vimeo, no frameworks, reduced-motion support, `defer` JS.

**Image details found:**

- 61 of the 172 graduate headshots are **landscape** (560×385/388) but displayed in a **4:5 portrait** crop (`.person__photo { aspect-ratio: 4/5; object-fit: cover }`), so roughly 45% of every landscape file's pixels are thrown away. The HTML says `width="560" height="560"` for all of them, which is wrong for most. CSS `aspect-ratio` prevents CLS, so this is a correctness issue, not a CLS issue. Sizes range from 2.5 KB to 81 KB (median 14.5 KB). Outliers: `2024-houston-andres-araiza.webp` 81 KB and `2025-chicago-mariella-ochoa.webp` 77 KB.
- Graduate cells render at ~190–230 CSS px wide, so 560 px sources are ~2.5× too large for 1× screens.
- The homepage hero is WebP **with alpha** (transparent angled corners hidden with `transform: scale(1.1)`). A clean, opaque crop at the arch's 5:4 ratio would be smaller and removes the scale hack.
- Interior header photos (1600×417) are shown in a ~460×300 box with `object-fit: cover`. A 920×600 crop would be sharper at 2× for similar bytes.

### 5.2 Fonts: self-host, trim, preload (biggest win)

**Technique (proven):** download the variable Fraunces and Inter TTFs (both SIL OFL), cut them down locally with **fonttools** (Python, run on the developer's machine only, nothing deployed), self-host as WOFF2, and preload.

```sh
pip install fonttools brotli
# Fraunces roman: keep opsz + wght range actually used; pin SOFT/WONK (removes two axes)
fonttools varLib.instancer "Fraunces[SOFT,WONK,opsz,wght].ttf" SOFT=100 WONK=0 wght=300:600 -o fr-roman.ttf
# Fraunces italic: only weights 300-400 are used (hero <em>, feature quote)
fonttools varLib.instancer "Fraunces-Italic[SOFT,WONK,opsz,wght].ttf" SOFT=100 WONK=0 wght=300:400 -o fr-italic.ttf
# Subset to Latin + punctuation used by the site; WOFF2
for f in fr-roman fr-italic; do
  pyftsubset $f.ttf --flavor=woff2 --layout-features="kern,liga,calt" \
    --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2013-2014,U+2018-201E,U+2022,U+2026,U+20AC,U+2122,U+2190-2193,U+FEFF" \
    --output-file=public/assets/fonts/$f.woff2
done
pyftsubset "Inter[opsz,wght].ttf" --flavor=woff2 --layout-features="kern,liga,calt,tnum" \
  --unicodes="(same list)" --output-file=public/assets/fonts/inter.woff2
```

- Design impact: `SOFT` is currently 50 on base headings and 100 elsewhere. Pinning to 100 makes base headings very slightly softer. If the designer objects, keep `SOFT=50:100` (costs some KB). Remove the `font-variation-settings: "SOFT" …` declarations that no longer do anything. **Check the result side by side** before committing.
- Put the version in the file name (`fraunces-roman-v38-2026a.woff2`) so it can be cached as `immutable`.
- `@font-face` with `font-display: swap` and `unicode-range` matching the subset.
- **Preload only what the first paint needs:** `<link rel="preload" href="/assets/fonts/fraunces-roman-….woff2" as="font" type="font/woff2" crossorigin>` and the same for Inter. Don't preload the italic (it's one word in the hero; let it swap in). Cloudflare Pages turns preload links into **Early Hints (103)** automatically (verify it is on in project settings), so fonts start downloading before the HTML is even parsed.
- **Fallback metric overrides** to stop layout shift when the font swaps (the hero H1 is up to 6 rem, so a swap there is visible). Define `@font-face { font-family: "Fraunces Fallback"; src: local("Georgia"); size-adjust: …; ascent-override: …; descent-override: …; }` and the same for Inter → Arial. Compute the values once with a metrics tool (e.g. the Capsize or Fontaine method) and put the fallback family second in `--font-serif` / `--font-sans`.
- Delete the two `preconnect` tags and the Google Fonts stylesheet link (→ for Security brief: no third-party font origins in the CSP; also removes the privacy concern of Google seeing visitor IPs).

**Estimated result:** Fraunces roman ~55–70 KB + italic ~20–25 KB + Inter ~30–35 KB ≈ **110–130 KB** (from 318 KB, **−60 to −65%**), on the site's own origin (no extra DNS/TLS handshakes; typically 100–300 ms saved on mobile networks). These are estimates. Measure the actual files after subsetting.

### 5.3 Responsive images (no build step: a tiny optional script)

**Technique:** pre-generate 2–3 widths per image and commit them. Serve with `srcset` + `sizes`. No image CDN and no runtime build.

**Tool:** `cwebp`/`dwebp` (libwebp's official CLI) is already installed on the dev machine (`/c/msys64/ucrt64/bin`). A ~30-line `tools/images.sh` (or a Node script calling the same binaries, no npm dependencies):

```sh
# For each source image: decode → crop/resize → encode at q≈75–80
dwebp in.webp -o tmp.png
cwebp -q 78 -m 6 -resize 400 0 tmp.png -o out-400.webp
cwebp -q 78 -m 6 -resize 800 0 tmp.png -o out-800.webp
```

- **Best source is the original JPG/PNG** (from the old site's uploads or LeaderFlow's photo library). Re-encoding WebP→WebP loses a little quality each time. Use the current WebPs only when no original exists.
- Generated files are committed under `public/assets/img/...`, and their names include the width (`name-400.webp`). The script runs only when images are added (e.g. new graduating class), and the steps go in the how-to guide.

**Where it matters, in order:**

| Image set | Today | Plan | Est. gain |
|---|---|---|---|
| Graduates (172) | 560 px wide, most landscape, 4:5 crop in CSS, avg 17.8 KB | **Pre-crop to 4:5** (face-aware by hand for the 61 landscape files; `object-position: center 22%` is today's rule), 2 widths: **240w and 480w**, q≈75. `sizes="(max-width: 700px) 46vw, 220px"` | ~3.0 MB → **~1.1–1.4 MB** for all cohorts; 2025 tab 1.24 MB → ~0.5 MB on phones (estimate) |
| Homepage hero | 1010×627 with alpha, 55 KB | Opaque 5:4 crop; **640w + 1200w**; `sizes="(min-width: 900px) 600px, calc(100vw - 44px)"`. Remove `transform: scale(1.1)` | Mobile ~55 → ~25–30 KB; faster LCP |
| Interior header photos | 1600×417, hidden on mobile but downloaded | `<picture>` with media source (§4.3); 920×600 crop | Mobile: −33–46 KB per interior page at high priority |
| People / Flowcilitators (16) | 5–23 KB | 2 widths if source > 2× display | Small |
| Sponsor logos (31) | 2–19 KB, displayed 108–267 px | Fine. Optional: SVG logos when sponsors provide them | Small |
| Large photos (`culture-compass` 115 KB at 1200×1202, `team-bw` 61 KB, `conf-room` 71 KB) | Single size | 2 widths each | ~30–50% on phones |

- Keep `width`/`height` on every `<img>`, set to the **real intrinsic ratio** of the file served (fixes the 560×560 mismatch).
- Keep `loading="lazy"` + `decoding="async"` below the fold. **Don't** lazy-load the LCP image or the first visible row on the graduates page.
- AVIF: not worth it here. WebP is already used and the encoder isn't installed. Gains are ~20% for this kind of photo, with more tooling. (Opt)

### 5.4 CSS/JS minification without fragile tooling

- Cloudflare's **Auto Minify was retired (2024)**, so minification has to happen before deploy if we want it.
- **Gain is small after Brotli:** CSS 10.5 KB br → ~8.5–9 KB br minified; JS 2.4 KB gz → ~1.8 KB. About 2–3 KB per first visit, and nothing on repeat visits once caching (§5.5) is in place.
- **Recommendation: Should, not Must.** If done, use **esbuild** as a single standalone binary (no `node_modules` tree), run from `tools/build-assets.sh`: `esbuild public/assets/css/site.css --minify --outfile=public/assets/css/site.min.css` (same for JS), and commit the outputs. The readable source stays in the repo for the next developer. Lightning CSS is an equally good choice. Don't introduce PostCSS/Webpack/Vite.
- **Prune unused CSS by hand** where obvious (e.g. selectors for components no page uses). Don't use automated purging; it is fragile with JS-toggled classes.

### 5.5 Caching vs no build step: the trade-off and the fix

- **Without fingerprinted names**, the safe header for CSS/JS is short-lived or revalidate-always, so returning visitors pay a revalidation round trip per file (304s, cheap but not free).
- **Fix without a real build:** a dependency-free `tools/cache-bust.mjs` (~40 lines of Node built-ins: `fs`, `crypto`). It hashes `site.css`/`site.js` (first 8 hex chars of SHA-256) and rewrites `href="/assets/css/site.css?v=xxxx"` in all HTML files. Run it before each commit that changes CSS/JS (or as a git pre-commit hook). Then `/assets/css/*` and `/assets/js/*` can be `immutable` for a year (§3.4).
- Images and fonts: immutable, with a **"rename on change"** rule (already natural: graduates are named by year-city-name).
- HTML: Pages default (`max-age=0, must-revalidate` + ETag).
- **Critical CSS inlining: not worth it.** The whole stylesheet is 10.5 KB Brotli on the same origin, discovered in the `<head>`, and Early Hints can push it early. Inlining would save at most one round trip on the very first view, at the cost of duplicating CSS into 11 pages and breaking caching. The real render-blocking chain today is the **third-party Google Fonts CSS → gstatic** hop, which §5.2 removes. Exception: the **impact page** inlines its CSS because it is a single page (§4.4).

### 5.6 LCP (hero)

Findings in `site.css` (Motion section):

- `.hero__media { animation: rise 1.1s .2s … both; }` starts the hero image at **opacity 0**, and the H1 spans animate from opacity 0 too. Chrome only records LCP once the element is actually painted visibly, so the entrance animation **delays LCP** and puts the most important paint behind animation timing.
- On mobile the hero image stacks below the text, so the **H1 is likely the LCP element**. It depends on the Fraunces download: with `display=swap` it paints in Georgia first, then may re-paint larger when the font arrives.

Fixes:

1. Remove the opacity animation from `.hero__media` and from `.hero h1 > *`. If any motion is kept, use **transform only** (e.g. `translateY(12px)` → 0), which doesn't delay LCP. Keep the lede/button fade if desired.
2. Self-host + preload the roman Fraunces and add fallback metric overrides (§5.2), so the H1 paints in its final font or with near-zero shift.
3. Hero image: keep `fetchpriority="high"`, no `loading` attribute, add `srcset`/`sizes` (§5.3), and make it an opaque crop.
4. Interior pages: stop the hidden header photo competing on mobile (§4.3). The H1 is the LCP.

### 5.7 CLS

- Already strong: dimensions on every image, `aspect-ratio` boxes, video facades with fixed-ratio posters.
- Remaining risks: (a) the font swap on large serif headings → fallback metrics (§5.2); (b) the Turnstile widget appearing inside a form → reserve its height (`min-height: 65px` on its container) only once it is rendered, below the submit button area; (c) the Tally popup/embed → use a link or popup, not an inline embed that resizes.

### 5.8 Other proven, low-cost wins

| Technique | Where | Gain | Scope |
|---|---|---|---|
| `content-visibility: auto; contain-intrinsic-size: auto 320px;` on `.person` cards and sponsor tiers | Graduates, Sponsor, Home | Less rendering work on long pages; better INP on low-end phones | Should |
| **Speculation Rules** prefetch on hover/touch (`<script type="speculationrules">{"prefetch":[{"where":{"href_matches":"/*"},"eagerness":"moderate"}]}</script>`) | All pages | Near-instant page-to-page navigation in Chromium; ignored elsewhere | Should (→ for Security brief: inline script needs a CSP hash, or ship it as a `Speculation-Rules` header pointing to a JSON file) |
| Load Turnstile on form focus (§3.8) | Home, Connect, Flowcilitator | Keeps third-party JS off every page view | Must (part of forms) |
| Graduates hover effect: grayscale filter + `mix-blend-mode: screen` overlay on up to 70 cards | Graduates | Paint cost on hover-capable devices only; acceptable. Re-test after the image change | — |
| Header `backdrop-filter: blur(14px)` | All | Fine on modern devices; check it on a low-end Android in testing | — |

### 5.9 Video

- **Move the 194 MB promo MP4 to Vimeo** (LeaderFlow already hosts the impact video there). Use the existing facade with `data-video="vimeo"`. Reasons: (1) the old host will be cancelled; (2) the file is on the compromised server (→ for Security brief: no runtime dependency on the old origin); (3) it exceeds Pages' 25 MiB file limit; (4) Vimeo streams adaptively, whereas a raw 194 MB progressive MP4 is a terrible experience on a phone. Cloudflare Stream is paid (Opt, not needed).
- Keep `dnt=1`. Consider `loading="lazy"` on the created iframe (harmless).

### 5.10 Targets and budget

**Core Web Vitals targets (mobile, p75 field data; lab on "Mobile, 4G / Moto G Power" profile):**

| Metric | Google "good" | **Our target** |
|---|---|---|
| LCP | ≤ 2.5 s | **≤ 1.8 s** (home), ≤ 1.5 s (interior, impact) |
| INP | ≤ 200 ms | **≤ 100 ms** |
| CLS | ≤ 0.1 | **≤ 0.05** |
| TTFB | — | ≤ 200 ms from the edge |
| Lighthouse (mobile) | — | Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100 |

**Page-weight budget (transferred, compressed, first view before scrolling):**

| Page | Today (est.) | **Budget** |
|---|---|---|
| Home | ~400 KB, 10 requests, 3 origins | **≤ 170 KB**, ≤ 9 requests, 1 origin (+ analytics beacon) |
| Interior pages | ~360 KB (fonts + hidden header photo on mobile) | **≤ 150 KB** |
| Impact page (excl. PDF) | n/a | **≤ 100 KB** |
| Graduates, fully scrolled, one tab | ~1.3 MB (2025 tab) + fonts | **≤ 700 KB** |
| Any page, JS total (first-party + third-party) | 2.4 KB | **≤ 15 KB** without forms; ≤ 60 KB only after a form is focused (Turnstile) |
| CSS | 10.5 KB br | ≤ 12 KB br |

### 5.11 How to measure

1. **Before changes (baseline)** and **after each Must item**, on the preview URL:
   - **PageSpeed Insights** (lab + CrUX field data. CrUX will probably have no data for a site this small, which is why we use Cloudflare Web Analytics for field data).
   - **WebPageTest** (free): "Mobile 4G" profile, Moto G-class device, 3 runs, first + repeat view. Save the filmstrip and waterfall for home, graduates and impact. The waterfall checks the request count and origin count.
   - **Chrome DevTools**: Performance panel live metrics (LCP element, INP), Network panel with "Fast 4G" throttling and the cache disabled.
2. **Budget check script** `tools/budget.sh` (optional, ~20 lines): for each page, sum the bytes of HTML (Brotli), CSS, JS, preloaded fonts and non-lazy images. Fail if it is over budget. Run it before every merge to `main`.
3. **After launch:** Cloudflare Web Analytics → Core Web Vitals per page (real visitors). Re-run PSI/WPT after every content update that adds images (e.g. a new graduating class).
4. Accessibility: Lighthouse + axe DevTools + a manual pass with NVDA (Windows) and VoiceOver (iOS) on the forms, menu, tabs and accordions (Appendix B: "works with screen readers").

---

## 6. Prioritised task list

Estimates are developer hours for this plan's items only. The PM's audit and the Security brief add their own tasks (forms security, DNS, account setup). Items needing client input are marked **[client]**.

### Must (for the ~Dec 1 launch)

| # | Task | Hours | Depends on |
|---|---|---|---|
| M1 | Restructure repo (`public/`, `functions/`, `tools/`; `review/` not deployed; remove `.nojekyll`; `.gitignore`). Update README | 1.0 | — |
| M2 | Cloudflare Pages project with Git integration (LeaderFlow-owned repo), `preview` branch + **Access policy** for previews and the production `pages.dev` host, `noindex` on `pages.dev` | 2.0 | Accounts from kickoff [client] |
| M3 | **Impact page** (standalone project): build, inline CSS, OG tags, compressed PDF, CNAME `impact` at GoDaddy, Web Analytics | 5.0 | PDF + numbers [client, ~Nov 13–15]; GoDaddy call |
| M4 | **Self-hosted, trimmed fonts** + preload + fallback metric overrides; remove Google Fonts; visual check | 3.0 | — |
| M5 | **Hero LCP fix** (no opacity animation on hero image/H1); hero opaque crop + `srcset`; interior header `<picture>` so phones don't download it | 2.0 | — |
| M6 | **Graduates images**: pre-crop to 4:5, 240w/480w, correct `width`/`height`, `srcset`/`sizes`, eager first row; `tools/images.sh` | 4.0 | Originals if available |
| M7 | **Homepage "Apply" CTA** + status strip in hero; state-aware application messaging on Home, Program, Application Form, Application Process pages | 3.0 | Dates [client] |
| M8 | Content consistency: **single donate link**, © 2026, dates everywhere, FAQ truncation, approved typo fixes, Field/Industry labels | 1.5 | Donate link + dates [client] |
| M9 | **Move promo video to Vimeo** and switch the facade | 0.5 | Client uploads to their Vimeo [client] |
| M10 | **Contact + Flowcilitator forms**: progressive enhancement (`action`, 303), validation fix, disable-while-sending, honeypot, lazy Turnstile, Pages Function(s), Apps Script → Sheet + email, test keys on preview | 7.0 | Security brief rules; recipient emails [client] |
| M11 | **Application form in Tally** (build questions from last year, resume upload, Sheet integration, notifications, test); application page in site design linking to it | 4.0 | Questions + reviewers [client]; decision on Friday call |
| M12 | `_headers` (caching part), `_redirects` from the PM's URL audit, **`404.html`**, `robots.txt`, `sitemap.xml`, canonical tags, apple-touch-icon | 3.0 | PM audit URL list |
| M13 | Enable **Web Analytics** on the main project; note caveats in the how-to guide | 0.5 | — |
| M14 | Reveal-flicker fix (G5) | 0.5 | — |
| M15 | **Performance verification**: baseline + after runs (PSI, WebPageTest, DevTools), budget check, fix regressions | 3.0 | All above |
| M16 | Accessibility pass on forms/menu/tabs/accordions (axe + NVDA + VoiceOver) | 3.0 | M10, M11 |
| | **Must total** | **≈ 43–44 h** | |

### Should (launch if time allows, else first week of December support)

| # | Task | Hours |
|---|---|---|
| S1 | `tools/cache-bust.mjs` + `immutable` caching for CSS/JS | 1.5 |
| S2 | Homepage sponsor wall condensed + "See all sponsors" (**only with client approval**) | 1.5 |
| S3 | FAQ section nav visible on mobile (chip row) | 1.0 |
| S4 | Speculation Rules prefetch (with CSP coordination) | 0.5 |
| S5 | `content-visibility` on long grids | 0.5 |
| S6 | esbuild minification (standalone binary) | 1.0 |
| S7 | Responsive sizes for remaining large photos (`culture-compass`, `team-bw`, `conf-room`, people) | 1.5 |
| S8 | Switch to root-relative URLs + a tiny "sync header/footer" script (header/footer are copied in 11 files, which is how the donate links drifted apart) | 3.0 |
| S9 | `tools/budget.sh` | 0.5 |
| | **Should total** | **≈ 11 h** |

### Phase 2 (Appendix B, after applications are underway; $400 phase)

| # | Task | Hours |
|---|---|---|
| P2-1 | Four starting points on the homepage (apply, lead a session, sponsor, donate) | 3.0 |
| P2-2 | Flowcilitator summary + FAQ (drafts to Janiece first) | 3.0 |
| P2-3 | Impact numbers + testimonials: static grid by default; scroll-snap row (§1.4) only if > 3 quotes | 3.0–4.0 |
| P2-4 | "Get notified" sign-up (Mailchimp double opt-in; hosted form or embed) | 2.0 |
| P2-5 | OG/LinkedIn share previews for all pages + 1200×630 share image | 2.0 |
| P2-6 | Move impact page to `/impact/` and set the 301s on the impact project (can also happen right after launch) | 1.5 |
| | **Phase 2 total** | **≈ 15 h** |

### Later / optional (out of scope; quote separately at $35/h or as Phase 3)

| Task | Hours (est.) |
|---|---|
| monday.com integration (Function fan-out to `create_item`, or WorkForms) | 4–6 |
| Header "Apply" CTA during the window (G8) | 0.5 |
| Privacy page (G10) | 1–2 (content from client) |
| FAQ structured data | 0.5 |
| AVIF variants | 2 |
| Phase 3 self-editing: Eleventy/Astro + Git-based CMS with per-user logins and 2FA | 15–25 |
| Lighthouse CI on pull requests | 2 |

---

## 7. Items for the Security brief (index)

1. No third-party slider/carousel scripts. CSP stays small (§1.2).
2. Function hardening: POST-only, size limits, validation, Turnstile `siteverify`, secrets in encrypted Pages variables, response headers set in code (§2.2, §3.4, §3.8).
3. Apps Script webhook: shared-secret header, deployment settings, rotation at handover (§2.2).
4. Third-party form data (Tally): data location, DPA, who has the Tally login, 2FA (§3.7).
5. Git integration vs API tokens on the developer's machine; repo owned by LeaderFlow; GitHub App scoped to one repo (§3.3).
6. Don't deploy `review/` or internal notes; `.gitignore` (§3.3).
7. Access policies for preview and production `pages.dev`; One-time PIN; `noindex` (§3.6).
8. CSP allow-list: `static.cloudflareinsights.com` / `cloudflareinsights.com` (analytics), `challenges.cloudflare.com` (Turnstile script + frame), `player.vimeo.com` (frame), `tally.so` (if popup/embed); no Google Fonts (§3.9, §5.2).
9. DNS move: copy all email records, DNSSEC, CAA, account access and 2FA (§3.10).
10. WordPress scanner paths return 404, optionally blocked by a WAF rule (§3.5).
11. No runtime dependency on the old compromised host (promo video) (§5.9).
12. Speculation Rules inline script → CSP hash or header (§5.8).
13. Privacy page for analytics and form data (G10).
