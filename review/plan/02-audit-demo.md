# Audit 2: The demo (this repository)

**Prepared by:** Project Manager
**Date:** Thursday 12 November 2026
**Compared against:** (1) the live site, see `01-audit-live-site.md`; (2) every deliverable promised in Appendix B of `review/prompt.md`.
**Repo state audited:** `main` @ `b60abb6`. No site files were changed.

**Status key:** **Done** = meets the promise as-is · **Partial** = started, but more work is needed · **Missing** = not in the demo · **Needs work** = present, but wrong or inconsistent

---

## 1. Summary

The demo is a strong **design and content** base. All 11 real content pages exist at the same paths as the live site, copy is carried over word for word, and the basics are good: one H1 per page, alt text on every image, labelled fields, `lang`, meta descriptions, lazy-loading and click-to-play videos. It is roughly **8× lighter** than the live homepage.

It is **not yet a working website.** Every Phase 1 *function* is still missing: no form submits anywhere, there is no application form at all, no spam protection, no analytics, no hosting setup, no redirects, no 404 page, no sitemap/robots, and no impact page. Several content promises ("dates, FAQ and donate links all match", "clear Apply button") are not met yet.

**Biggest risks found:**

1. **The repo is public and its GitHub Pages site is live, including `/review/`** (the hack audit with spam screenshots). The client email, pricing and security plan in `review/prompt.md`, `review/plan/` and `review/ux-research-notes.md` are untracked and not git-ignored, so a single `git add .` would publish them. (Confirmed by the coordinator: `github.com/rasanone/LeaderFlowDemo`.)
2. The **application form page has no form.** It shows only the "applications closed" notice. Rebuilding the application is the largest Phase 1 item, and it needs a PDF résumé upload (see the live audit, section 4).
3. The **promo video is hot-linked** from the hacked WordPress server (194 MB). It will break when the old host goes away.
4. The **demo's header Donate button uses the *other* Givebutter link** from the live site (details in section 4).

---

## 2. Appendix B deliverables vs the demo

### Phase 1

| # | Promise (Appendix B) | Status | Evidence / file paths | What is needed |
|---|---|---|---|---|
| 1 | Clean, fast new site | **Partial** | Design done on all 11 pages. Homepage ≈0.5 MB vs ≈3.6 MB live (`review/index.html`). But ~318 KB of Google Fonts is ~80% of first view; graduate photos are oversized; hero fades in (delays LCP). `assets/css/site.css`, `index.html` | Design plan M4–M6, M14–M15 |
| 2 | Built-in spam protection | **Missing** | No Turnstile, honeypot or server check in any form (`index.html:163`, `connect-with-us/index.html:75`, `flowcilitators/become-a-flowcilitator/index.html:119`). The live Contact/Flowcilitator forms already have Turnstile | Turnstile + honeypot + server validation (security brief D) |
| 3 | More secure hosting so the hacking can't return | **Missing** | Repo is deployed via GitHub Pages (`.nojekyll`, README). No `_headers` (CSP etc.), no Cloudflare project, deploy root is the repo root (publishes `review/`) | Cloudflare Pages in LF's account; deploy folder; `_headers` (security brief C) |
| 4 | Loads quickly on phones | **Partial** | Lazy images, WebP, `fetchpriority` on hero. Interior header photo is hidden on mobile but still downloaded at high priority (`page-hero__media`, all interior pages) | Design plan M5, M6 |
| 5 | Works with screen readers | **Partial** | Good basics (skip link, 1×H1, alt text 0 missing, all fields labelled, keyboard menu and tabs, reduced motion). **Bug:** forms use `novalidate` and `assets/js/site.js` (lines 121–139) never validates, so required fields are not enforced and no errors are announced. No screen-reader test done yet | Form validation fix; NVDA/VoiceOver pass (design plan M16) |
| 6 | Keeps all current page links working | **Partial** | The 11 content pages mirror live URLs. **Missing:** `/flowcilitators/` (live, linked from breadcrumbs), `/blog/`, `/newsletter-archive/`, 3 `/2023/…` posts, `/category/newsletter/`, `/author/brian/`, 3 donation pages, 7 header/footer template pages, `/feed/`, `wp-sitemap*.xml`. No `_redirects`, no `404.html`, no `robots.txt`, no `sitemap.xml`, no canonical tags, no `favicon.ico` | `_redirects` from the URL inventory (live audit, section 3); `404.html`; robots; sitemap |
| 7 | New **application** form | **Missing** | `leaderflow-development-program/application-form/index.html` contains only the "applications closed" callout. No form, no fields, no link to an external form. The live form (Ninja Form 16) has ~30 fields + PDF résumé upload | Choose a form tool (see project plan); rebuild questions; open/closed states |
| 8 | New **contact** form | **Partial** | Fields match live (Name\*, Email\*, Phone, Message\*) on `index.html` and `connect-with-us/index.html`. `data-endpoint=""`, so submit shows "Demo site: form submissions are not connected yet." No `action` (no-JS fallback), no spam protection | Pages Function + Turnstile + Sheet/email |
| 9 | New **Flowcilitator** form | **Partial** | All 8 live fields + 7 session options present (`flowcilitators/become-a-flowcilitator/index.html`). Same `data-endpoint=""` problem | As above |
| 10 | Applications go to a **LeaderFlow-owned spreadsheet or formatted email** | **Missing** | No backend. README suggests Formspree/Basin/Getform (third parties, not LF-owned). That advice is superseded | LF-owned Google Sheet + formatted email (security brief 28) |
| 11 | **Team can edit the questions** without the developer | **Missing** | Questions are hard-coded HTML | Hosted form builder for the application (see plan); state honestly that Contact/Flowcilitator edits are a small paid update |
| 12 | **Application dates** match everywhere | **Needs work** | FAQ still says "open beginning on November 19, 2025 … close January 4, 2026" (`leaderflow-development-program/participantfaqs/index.html:81`), while other pages say only "2026 … now closed". The next cycle's dates are unknown | Dates from Janiece; one source of truth |
| 13 | **FAQ** up to date | **Needs work** | FAQ last answer is truncated ("…career vis", kept verbatim on purpose). Dates as above | Janiece's corrected text |
| 14 | **Donate links** all match | **Needs work** | Two links in use: `givebutter.com/LFGivingTuesday2024` = header Donate on all 11 pages; `givebutter.com/ocXKYA` = homepage "Click to Donate" (`index.html:142`) and Sponsor page ×2 (`become-a-sponsor/index.html`). The live site also has a hidden Network for Good / Community Partners donate button the demo dropped | Janiece confirms the one current link; update all 14 places (11 headers + 3) |
| 15 | Clear **"Apply" button on the homepage** | **Missing** | Hero CTA is **"About Us"** (`index.html:56`). The word "Apply" appears on no page except the FAQ | Gold "Apply now" (open) / "How to apply" (closed) in the hero (design plan H1) |
| 16 | **Mailchimp's built-in protections** turned on | **Missing** (account task) | Not a site change. The demo links to `http://eepurl.com/ivZ0H6` (plain http) | LF turns on double opt-in + reCAPTCHA in Mailchimp; use the https link |
| 17 | **Visitor statistics** without tracking anyone personally | **Missing** | No analytics on any page | Cloudflare Web Analytics (cookieless) |
| 18 | Old site saved as a backup / switch back within minutes | **Missing** (process) | Nothing in the repo. Security brief: the hacked WordPress site must **not** be the rollback target | Cloudflare Pages rollback; offline WP archive; reword the promise in the scope document |
| 19 | Testing on devices/networks; test applications to the team | **Missing** | Not started | Test plan before launch |
| 20 | Early January: all website files + short how-to guide | **Missing** | `README.md` is developer-facing and refers to GitHub Pages/Formspree | Handover guide; repo transferred to LF |
| 21 | Promo video works after the old host is gone | **Needs work** | `index.html:128` streams `https://leaderflow.org/wp-content/uploads/2022/10/leaderflow-promotional-video.mp4` (194 MB) from the hacked server | Move to LF's Vimeo (design plan M9) |

### Impact report page (free, agreed)

| Promise | Status | Notes |
|---|---|---|
| Standalone page at `impact.leaderflow.org` | **Missing** | No page in the repo; the subdomain does not exist in DNS yet |
| Short intro, 3–4 headline numbers, "Download the report" button, donate link | **Missing** | Needs the PDF + numbers from Janiece (expected Fri 13 Nov or the weekend) |
| Becomes the site's Impact page later; the shared link keeps working | **Missing** | Plan: `/impact/` on the main site + 301s from the impact project |

### Phase 2

| Promise | Status | Notes |
|---|---|---|
| Four starting points on the homepage (apply, lead a session, sponsor, donate) | **Partial** | Two panels exist (Donate, Become a Sponsor) in `index.html` `.support-grid` |
| Short summary + FAQ for prospective Flowcilitators | **Missing** | The page has the long-form text only |
| Impact numbers + testimonials where people decide | **Partial** | A Flowcilitator pull quote exists. No impact numbers |
| "Get notified" sign-up when applications reopen | **Partial** | Footer "Subscribe" link to Mailchimp on every page; no context-specific prompt |
| Better previews when shared (LinkedIn etc.) | **Missing** | No `og:`/`twitter:` tags on any page |

---

## 3. Page-by-page: demo vs live

| Live URL | Demo file | Status | Differences / work needed |
|---|---|---|---|
| `/` | `index.html` | **Partial** | Single static hero (live has 3 rotating slides; the other two became sections). CTA "About Us" → needs "Apply". Two Givebutter links. Contact form not connected. Promo MP4 hot-linked. Footer © 2023. "Acquire practice skills" kept verbatim |
| `/about-us/` | `about-us/index.html` | **Done** (content) | Copy recovered from the Archive (16 Apr 2026). Live page currently shows the same real text. Re-check the copy against Janiece's version. Footer © 2023 |
| `/leaderflow-development-program/` | `leaderflow-development-program/index.html` | **Partial** | Content complete. Live has hidden "Apply Now" blocks with stale text; the demo correctly drops them. Needs an Apply CTA when open. "March through November" vs September session dates: ask |
| `/…/application-process/` | `…/application-process/index.html` | **Needs work** | Eligibility + commitment carried over. All dated "apply" blocks removed (live has conflicting 2024/2026 ones). Needs current dates + Apply link |
| `/…/application-form/` | `…/application-form/index.html` | **Missing** (function) | **Closed notice only, no form.** Live has the full 2026 form. See section 2 row 7 |
| `/…/leaderflow-graduates/` | `…/leaderflow-graduates/index.html` | **Done** (perf work Should/Must) | 172 graduates in cohort tabs (live shows ~170 labelled entries; spot-check names). "Field:"/"Industry:" mix kept. Images need responsive sizes |
| `/…/participantfaqs/` | `…/participantfaqs/index.html` | **Needs work** | Copy from the Archive (13 Jan 2026). Old dates (Nov 19, 2025 to Jan 4, 2026). Truncated last answer |
| `/flowcilitators/become-a-flowcilitator/` | `flowcilitators/become-a-flowcilitator/index.html` | **Partial** | Content + all form fields. Form not connected |
| `/flowcilitators/meet-the-flowcilitators/` | `flowcilitators/meet-the-flowcilitators/index.html` | **Done** | 16 people in one even grid |
| `/become-a-sponsor/` | `become-a-sponsor/index.html` | **Needs work** | Tiers and pledges ($50k 3-yr, $30k, $20k, $10k, $5k) carried over. Donate links mixed. Network for Good button dropped (confirm with Janiece) |
| `/connect-with-us/` | `connect-with-us/index.html` | **Partial** | `janiece@leaderflow.org` + form. Form not connected |
| `/flowcilitators/` | none | **Missing** | Redirect → `/flowcilitators/become-a-flowcilitator/` |
| `/blog/`, `/newsletter-archive/`, `/2023/…`, `/category/newsletter/`, `/author/brian/`, donation pages, header/footer templates | none | **Missing** (by design) | Redirect per live audit section 3b; do not rebuild |
| (new) `impact.leaderflow.org` → `/impact/` | none | **Missing** | Build first (needed this week) |
| (new) `404.html`, `robots.txt`, `sitemap.xml` | none | **Missing** | Must |

---

## 4. Known issues: verified

| Issue | Verified? | Detail |
|---|---|---|
| Two Givebutter donate links | **Yes** | `LFGivingTuesday2024`: header Donate button on all 11 pages (11 uses). `ocXKYA`: `index.html:142` "Click to Donate" + 2 on `become-a-sponsor/index.html` (3 uses). **Note:** on the live site the *primary* header button and mobile menu use `ocXKYA`, and `LFGivingTuesday2024` is only on the second (sticky) header button. So the demo moved the 2024 campaign link into the main header. The live site also has a third destination, `donatenow.networkforgood.org/communitypartners/`, on the Sponsor page (mobile only). Janiece must name the one current link |
| Footer "© 2023" | **Yes** | Every page footer: "© 2023 LeaderFlow. All rights reserved." (same as live) |
| Hero CTA is "About Us", not "Apply" | **Yes** | `index.html:56` `<a class="btn btn--gold btn--arrow" href="about-us/">About Us</a>` |
| Forms have empty `data-endpoint` | **Yes** | `index.html:163`, `connect-with-us/index.html:75`, `flowcilitators/become-a-flowcilitator/index.html:119`. With an empty endpoint, `assets/js/site.js:125–128` cancels the submit and shows "Demo site: form submissions are not connected yet." Nothing is sent anywhere. With an endpoint set, it would POST `FormData` via `fetch` with **no validation** (forms are `novalidate`) and no spam check |
| Application form page: what it actually does | **Verified** | **Nothing interactive.** `leaderflow-development-program/application-form/index.html` = header, page title "Application Form", one callout ("The application period for the 2026 LeaderFlow Development Program is now closed…"), footer. No `<form>`, no fields, no link to an external application. It mirrors the live page's *closed* state but drops the live form entirely. Building the application is new work |

### Other issues found

| Issue | Where | Severity |
|---|---|---|
| Repo public + GitHub Pages live, including `/review/` (hack audit, spam screenshots) | Repo / GitHub | **High**: decide today (see plan, item 0) |
| No `.gitignore`; `review/prompt.md`, `review/plan/`, `review/ux-research-notes.md` untracked and would be committed by `git add .` | Repo root | **High** |
| Deploy root = repo root, so `review/` and `README.md` would be published on any host | Structure | High (fix with a deploy folder) |
| Promo MP4 hot-linked from the hacked server (194 MB; over the 25 MiB Pages limit) | `index.html:128` | High |
| No 404 page: Cloudflare Pages would serve the homepage with 200 for every unknown URL, including spam URLs | Root | High |
| Google Fonts from a third-party origin (~318 KB, privacy, CSP) | `<head>` of every page | Medium |
| ~70 inline `style=""` attributes (logo widths) block a strict CSP | `index.html`, `become-a-sponsor/index.html` | Medium |
| Header and footer copied into 11 files, which is how the donate links drifted apart | All pages | Medium |
| Subscribe link uses `http://` | Footer, all pages | Low |
| README describes GitHub Pages + Formspree (both superseded) | `README.md` | Low |
| `.nojekyll` only matters for GitHub Pages | Root | Low |
| Relative links (`../../`) everywhere. Works, but root-relative would be simpler for `_redirects`/404 | All pages | Low |

---

## 5. Proposal drafts: discrepancies (for the record)

`review/ux-research-notes.md` is an **older draft**. **Appendix B is authoritative.** The differences matter for the scope-of-work document:

| Item | Older draft (`ux-research-notes.md`) | Appendix B (sent, authoritative) |
|---|---|---|
| Phase 1 / Phase 2 price | $1,000 / $200 | **$800 / $400** |
| Payment split | $500 + $500; $100 + $100 | **$400 at kickoff + $400 at launch; $200 at start + $200 when published** |
| Hourly rate after project | $40/hour | **$35/hour** (nonprofit rate) |
| Launch date | Fixed: Tue 1 Dec, with a day-by-day schedule | **No fixed date:** "live at least a week before applications open"; date locked once the opening date is known |
| Preview | Fri 20 Nov | "About one week after kickoff" |
| Impact report page | Not mentioned | **Included free** at impact.leaderflow.org |
| Visitor statistics | Not mentioned | **Promised** |
| Better share previews | Not mentioned | **Phase 2** |
| Hosting named | "Cloudflare" | Not named ("more secure hosting", "free for a site this size") |
| Rollback wording | "switch back to the old site within minutes" | Same ("switch back within minutes"). **Must change:** the security brief rules out the hacked site as a rollback target |
| Info needed | By Wed 18 Nov | Impact PDF + numbers by **Fri 13 Nov**; opening date, recipients and current donate link asked in "Next steps" |
| Clearing fake Mailchimp contacts | Promised | Not promised (only the confirmation email + human check) |

---

## 6. The unfinished line "Also add the the…"

- `review/prompt.md` (Phase 1 → "the project plan" section, line 64) asks the plan to flag an unfinished line **"Also add the the…"** in the proposal's Phase 1 timeline.
- **That line does not appear anywhere in the repo.** Appendix B's Phase 1 timeline (`review/prompt.md` lines 155–163) has seven complete bullets, from "Week of Nov 16 (or earlier)" to "Early January", with no "Also add" text. `review/ux-research-notes.md` has no such line either. A search for "also add" and "the the" across every `.md`/`.html` file, and through git history, finds only the instruction itself on line 64.
- **Conclusion:** the line probably exists in the version actually sent to Janiece (e.g. in the email client), or it was removed when Appendix B was pasted in. **Rahsaan needs to check the sent email.** If the sent copy contains it, the scope-of-work document should replace it with the intended text. I have not guessed what it was meant to say.
