# 05: LeaderFlow website rebuild, project plan

**Prepared by:** Project Manager · **Date:** Thursday 12 November 2026
**For:** Rahsaan (to review and approve; **Phase 3 does not start until you approve**)
**Built from:** `01-audit-live-site.md`, `02-audit-demo.md`, `03-security-brief.md`, `04-design-plan.md`, and `review/prompt.md` (Appendix A = Janiece's email, Appendix B = the proposal as sent, which is the source of truth for scope, timeline and payment).

**Owners:** **R** = Rahsaan · **J** = Janiece / LeaderFlow staff · **R+J** = together on a call or screen-share
**Priority:** **Must** = needed for launch · **Should** = by handover (early January) if time allows · **P2** = Phase 2

---

## 0. Do today (before anything else)

| # | Item | Owner | Why |
|---|---|---|---|
| 0.1 | **The demo repo is public** at `github.com/rasanone/LeaderFlowDemo` (the local origin `rasanbenladeen/LeaderFlowDemo` redirects there). Its **GitHub Pages site is live, including `/review/`** (the hack audit and spam screenshots). `review/prompt.md` (Janiece's email, pricing), `review/plan/` (this plan and the security brief) and `review/ux-research-notes.md` are **untracked and not git-ignored**, so a `git add .` would publish them. **Decide:** (a) make the repo private and turn off GitHub Pages, **or** (b) at minimum add a `.gitignore` for `review/prompt.md`, `review/plan/`, `review/ux-research-notes.md` before any commit. Recommended: **(a)**, because Janiece already has the demo link and a private Cloudflare preview replaces it next week. If she still needs the old link in the meantime, keep Pages on but remove `/review/` from the published branch. | R | Client data and the security plan must not become public. The hack audit is visible to anyone today |
| 0.2 | Do not commit anything until 0.1 is done. | R | |

---

## 1. What this project is (one paragraph)

Replace leaderflow.org, a **hacked WordPress 7.1.4 site on GoDaddy Managed WordPress** (not a Wix-style builder; see audit 1 §2), with the static HTML/CSS/JS demo in this repo, hosted on **Cloudflare Pages in LeaderFlow's own account**. Phase 1 adds working forms with spam protection (applications into a LeaderFlow-owned sheet or email), consistent dates and donate links, an Apply button, cookieless visitor statistics, redirects for every old URL, and a free impact report page at `impact.leaderflow.org`. Phase 2 adds growth features. Security comes first, then speed.

---

## 2. Decisions

### 2a. Settled in this plan

| # | Topic | Decision | Reason |
|---|---|---|---|
| D1 | **Stack** | Stay with plain **HTML/CSS/JS**. No React. | Integrations (monday.com, Sheets, email) must run server-side either way; React adds ~50 KB, a build chain and an npm supply chain (design plan §2) |
| D2 | **Hosting** | **Cloudflare Pages** (Git integration, Free plan, no payment method) + **Pages Functions** for the Contact and Flowcilitator forms | Free, fast, preview links behind Cloudflare Access, cookieless analytics, Turnstile (design plan §3, security brief B12) |
| D3 | **Deploy folder name** | **`site/`** (the design plan's `public/` is the same idea). Pages output directory = `site`; `functions/` at repo root; `review/`, `README.md`, `tools/` never deployed. | One name everywhere. `site/` says what it is, avoids confusion with "public repo", and the security brief's `_headers`, `_routes.json` and 404 steps are already written against it. Update the design plan's paths from `public/` to `site/` when implementing |
| D4 | **Homepage carousel** | **None** in Phase 1 (one static hero with Apply). Phase 2 testimonials as a static grid; a scroll-snap row only if there are more than 3 quotes, never autoplay | Conversion, LCP, WCAG 2.2.2 (design plan §1) |
| D5 | **Rollback** | Rollback = **Cloudflare Pages "Rollback" to the previous deployment** (seconds), practised once before launch. **The hacked WordPress site is not a rollback target**; it is archived offline only | Security brief E34 |
| D6 | **Promo video** | Move the 194 MB MP4 to LeaderFlow's Vimeo; nothing loads from the old server | Too big for Pages (25 MiB), and it sits on the compromised host |
| D7 | **Contact + Flowcilitator forms** | Keep the demo's custom HTML forms → Pages Function (Turnstile, honeypot, validation) → **Apps Script web app in an LF-owned Google account** → LF-owned Sheet + formatted email | Short forms that rarely change; no iframe; best spam control (both inputs agree) |

### 2b. Application form: options and recommendation (Rahsaan to confirm with Janiece on Friday)

The live application has ~30 fields, including demographics and a **PDF résumé upload** (audit 1 §4). Appendix B promises *"a spreadsheet LeaderFlow owns or … a neatly formatted email, and your team can edit the questions without me."*

| Option | Team edits questions | Résumé upload | Spam protection | Data stored at | Security surface | Effort |
|---|---|---|---|---|---|---|
| **A. Google Form** (LF-owned), linked from our application page | Yes | **Only if the applicant signs in to Google.** A real barrier for applicants | Weak (no CAPTCHA) | LF's Google Sheet | Lowest: no secrets, no new vendor | ~3 h |
| **B. Tally** (LF-owned account, 2FA), linked from our application page | Yes, easy editor | Yes, no sign-in (free-tier file-size cap; verify) | Built-in spam protection / CAPTCHA option | Tally (third party, EU) + sync to LF's Google Sheet + email alerts | Low–medium: new vendor holds personal data; needs an LF-owned login with 2FA and a privacy check | ~4 h |
| **C. Custom form + Pages Function → Apps Script → Sheet** | **No** (developer edits HTML) | Needs file storage (R2) + type/size/malware handling | Turnstile + server validation | LF's Google Sheet | Highest: our own upload code; breaks the "edit without me" promise | ~10 h+ |
| D. monday WorkForms | Yes | Yes | Basic | monday board | Only sensible if they already use monday | — |

**Recommendation: Option B (Tally), opened by a plain link** ("Start your application") from our own application page, which holds dates, eligibility and "what you'll need". Reasons: it is the only option that keeps **both** promises (team edits questions, and applicants can upload a résumé without a Google account), and as a link it adds no script or CSP change to our site.
Conditions: the Tally account is **created and owned by LeaderFlow** (role email, 2FA), Rahsaan is invited as a collaborator, and responses sync to an **LF-owned, restricted** Google Sheet.
**Fallback if Janiece prefers no new vendor:** Option A (Google Form) plus "email your résumé to …", or a résumé link field. It is weaker, but adds no new vendor.
Also ask: is all the demographic data still needed (security brief D32: collect the minimum)?

### 2c. Open decisions (not ours to make)

| # | Decision | Who | When |
|---|---|---|---|
| O1 | **When do applications open (and close) this year?** This sets the launch date (launch must be at least one week before opening). ⚠ Last cycle opened **19 Nov 2025**. If this year is similar, the December timeline cannot meet "a week before"; this must be settled on the Friday call | J | Fri 13 Nov |
| O2 | **Who receives applications** (and Contact / Flowcilitator messages)? | J | Fri 13 Nov |
| O3 | **Which donate link is current?** The live site uses three: `givebutter.com/ocXKYA`, `givebutter.com/LFGivingTuesday2024`, and Network for Good / Community Partners. The demo uses the first two inconsistently | J | Fri 13 Nov |
| O4 | Application form tool (§2b) | R recommends, J confirms | Fri 13 Nov |
| O5 | Repo exposure fix (§0) | R | Today |
| O6 | **Effort vs price.** Consolidated Must work is ≈ 74–76 h (section 6) against a $800 Phase 1 fee. Rahsaan to decide whether to trim Should items, accept the hours, or discuss scope. Not raised with the client unless Rahsaan chooses to | R | Before sending the scope-of-work doc |
| O7 | **"Also add the the…"**: the unfinished line in the proposal's Phase 1 timeline. **It is not in Appendix B in `review/prompt.md` or in `review/ux-research-notes.md`** (searched all files and git history). Check the copy actually sent to Janiece and fill it in, or delete it, in the scope-of-work document. Not guessed | R | Before sending the scope-of-work doc |
| O8 | 501(c)(3) wording: About says "LeaderFlow, Inc. was created as a 501(c)(3)", the footer says "a project of Community Partners" | J | Preview round |
| O9 | Sponsor wall on the homepage: show all 31 logos or the top tiers + "see all" (sponsors may have been promised placement) | J | Preview round |
| O10 | Copy fixes left verbatim so far (FAQ truncation, "practice skills", Field/Industry, session months) | J | Preview round |

---

## 3. Action items from Janiece's email (Appendix A)

| Item | Owner | Date | Notes |
|---|---|---|---|
| **Friday afternoon call** (she proposed it) | R+J | **Fri 13 Nov, afternoon** | Confirm the time today. Agenda in section 4 |
| **Impact report PDF + headline numbers** | J → R | **Fri 13 Nov or the weekend** (she will confirm) | Appendix B asked for both by Fri 13 Nov. Fallback: she shares a Google Drive link in the announcement and the page follows |
| **Simple proposal / scope-of-work document** for their accounting records: scope, timeline, payment terms | R | **Draft Fri 13 Nov** (before or right after the call); **final by Mon 16 Nov** | Use **Appendix B** figures (not the older draft): Phase 1 $800 ($400 kickoff / $400 launch), Phase 2 $400 ($200 start / $200 published), impact page included, $1,200 total, $35/h after the project. **Wording changes needed:** (1) rollback: replace "switch back [to the old site] within minutes" with "*the previous version of the new site can be restored within minutes*"; (2) resolve the "Also add the the…" line (O7); (3) add the confirmed application tool and the launch-date rule ("at least one week before applications open") |
| She accepted the proposal, including the free impact page | — | — | Recorded |

---

## 4. Friday 13 Nov call: agenda (≈30 min)

1. Confirm scope and payment terms (scope-of-work doc coming).
2. **Applications:** opening and closing dates (O1), who receives them (O2), are the questions the same as last year, is the demographic data needed.
3. **Application form tool** (O4): recommend Tally, fallback Google Form.
4. **Donate link** (O3).
5. **Impact page:** PDF and numbers status; who manages GoDaddy, and book the 15-min call to add `impact` DNS.
6. **Rollback wording** (D5): explain why the hacked site is not a fallback; the old site is archived instead.
7. **Kickoff (week of 16 Nov):** who will create LeaderFlow's accounts (Cloudflare, GitHub org, Tally) with a LeaderFlow email; who can export the old WordPress data (form entries, Redirection rules) and who holds Google Search Console.
8. Mailchimp: turn on double opt-in + reCAPTCHA (J does it, R guides).

---

## 5. Schedule (Phase 1)

**Working assumption: launch Tuesday 1 December 2026**, confirmed only once O1 is answered and it is at least one week before applications open. If applications open earlier than ~8 Dec, compress the preview/feedback window and move launch up.

| Dates | Work | Owner | Priority |
|---|---|---|---|
| **Thu 12 Nov** | §0 repo exposure fix. Confirm Friday call time. Start the scope-of-work draft | R | Must |
| **Fri 13 Nov** | Call with Janiece (§4). Receive impact PDF + numbers (or the weekend). Send the scope-of-work draft | R+J | Must |
| **Fri 13 – Sun 15 Nov** | **Pre-kickoff own setup (security brief A, ≈4–6 h):** move LeaderFlow work off **Windows 10 (out of support)** to Windows 11 or a supported device (BitLocker, Defender, auto-updates, non-admin user); password manager; two FIDO2 keys; LeaderFlow browser profile; GitHub token/key cleanup; purge old secrets; `.gitignore` + gitleaks pre-commit | R | **Must before kickoff** |
| Sat 14 – Mon 16 Nov | Build the **impact page** (standalone project; inline CSS, no JS, OG tags, compressed PDF). Ready to connect as soon as LF's Cloudflare account exists | R | Must |
| **Mon 16 Nov** | Send final scope-of-work doc | R | Must |
| **Mon 16 – Wed 18 Nov** | **Kickoff call (30 min) + account setup** (security brief B): GoDaddy 2FA, Domain Lock, delegate access; **export the DNS zone**; LF creates Cloudflare (Free, no card), GitHub org, Tally (if chosen); Google/Mailchimp/Givebutter checks; LF confirms every external link. **15-min GoDaddy call:** `impact` CNAME → impact page **live**. Invoice **$400** | R+J | Must |
| Mon 16 – Fri 20 Nov | **Build** (Phase 3 work once this plan is approved): repo → `site/` layout, transfer the repo to the LF org, Pages project + preview Access policy; 404, `_headers` (CSP Report-Only first), `_redirects` from audit 1 §3, robots, sitemap, canonical; fonts self-hosted; hero LCP fix; graduate images; Apply CTA + open/closed states; single donate link; © 2026; Contact + Flowcilitator Functions + Apps Script; application form in the chosen tool; Web Analytics; video to Vimeo | R | Must |
| Thu 19 – Fri 20 Nov | **Old-site data:** LF exports Ninja Forms entries, Redirection rules, a full backup (kept offline and restricted; never restored); Search Console export of indexed + spam URLs | J (R guides) | Must |
| **By Mon 23 Nov** | **Move DNS hosting to Cloudflare** (domain stays at GoDaddy). Compare records line by line with the export (MX, SPF include, DMARC, Mailchimp DKIM `k2`/`k3`, verification TXTs; audit 1 §7). Test email in and out | R+J | Must (≥1 week before launch) |
| **Mon 23 Nov** | **Private preview link** to Janiece (about one week after kickoff) | R | Must |
| Mon 23 – Fri 27 Nov | **2–3 rounds of changes.** ⚠ Thanksgiving Thu 26 Nov: plan for feedback on Mon/Tue and Fri | R+J | Must |
| Fri 27 – Mon 30 Nov | **Testing:** every page and form on phones/desktops and slow networks; screen readers (NVDA, VoiceOver); PageSpeed/WebPageTest against budgets; **test applications sent to LF's reviewers**; spam tests (no Turnstile → rejected; honeypot → nothing stored; `=1+1` not evaluated); random URL → 404; `/review/` → 404; practise a Pages rollback; enforce the CSP | R (+J receives test entries) | Must |
| **Tue 1 Dec (tentative)** | **Launch, early morning:** point `leaderflow.org` + `www` at Pages; **do not touch MX/SPF/DKIM/DMARC**; check HTTPS, redirects, email, one form; Search Console: submit the sitemap, request re-indexing of `/about-us/` and `/participantfaqs/`, remove spam URLs. Invoice **$400** | R | Must |
| Tue 1 – Fri 4 Dec | After-launch checks: site, email, Mailchimp, forms, old links, Google results | R | Must |
| Through **Thu 31 Dec** | Final testing and fixes; the old host stays untouched but **not** used as a fallback | R | Must |
| **Early January** | Handover: repo in LF's org + full copy, short how-to guide (updates, adding graduates, dates), "where everything lives" page; **offboard Rahsaan and rotate secrets**; HSTS raised, DNSSEC on; LF cancels old hosting **after** confirming nothing else depends on it (30 days stable) | R+J | Must (guide) / Should (rest) |

### Phase 2 (about 3–4 weeks, built on a private preview; starts once applications are underway; dates set later)

Week 1 gather testimonials, impact numbers, Flowcilitator details · Week 2 draft wording for approval · Week 3 two rounds of changes · Week 4 test, publish, 30 days of support. Invoice $200 at start, $200 when published.

---

## 6. Work list with hours

Hours are Rahsaan's estimated time, merged from the design plan (§6) and the security brief, with overlaps removed.

### Must (Phase 1 launch)

| # | Work item | Source | Hours |
|---|---|---|---|
| M0 | Repo exposure fix (§0) | Coordinator check | 0.5 |
| M1 | Own setup: supported OS, password manager, FIDO2 keys, GitHub cleanup, secrets purge, gitleaks | Security A | 4–6 |
| M2 | LF accounts + DNS export + DNS move to Cloudflare + email check | Security B | 5 |
| M3 | Impact page (build, PDF, OG tags, CNAME, analytics) | Design M3, Security B13 | 5 |
| M4 | Repo restructure to `site/`, transfer to LF org, Pages Git integration, preview Access, noindex on pages.dev | Design M1–M2, Security C21/C27 | 3 |
| M5 | Hardening files: `404.html`, `_headers` (CSP + caching), `_redirects` (audit 1 §3), robots, sitemap, canonical, favicon/apple-touch icon, remove inline styles, WAF/zone settings | Design M12, Security C22–C26 | 5 |
| M6 | Performance: self-hosted trimmed fonts, hero LCP fix, interior header `<picture>`, graduate images, reveal-flicker fix | Design M4–M6, M14 | 9.5 |
| M7 | Promo video to Vimeo | Design M9 | 0.5 |
| M8 | Content: hero Apply CTA + open/closed states on Home/Program/Process/Form, single donate link, dates, © 2026, approved fixes | Design M7–M8 | 4.5 |
| M9 | Contact + Flowcilitator forms: validation fix, no-JS fallback, honeypot, lazy Turnstile, Function checks, Apps Script (plain-text cells, escaped email), secrets | Design M10, Security D | 8 |
| M10 | Application form in the chosen tool + application page in our design | Design M11 | 4 |
| M11 | Cloudflare Web Analytics | Design M13 | 0.5 |
| M12 | Old-site archive + data exports (guide LF) | Security E, audit 1 §9 | 2 |
| M13 | Testing: performance, accessibility, forms, devices, test applications, rollback drill | Design M15–M16, Security F35 | 7 |
| M14 | Launch + after-launch checks + Search Console | Security F36–37 | 3 |
| M15 | PM/client: scope-of-work doc, Friday call, kickoff, preview rounds (2–3) | Appendix A/B | 9 |
| M16 | Handover guide (early January) | Appendix B | 3 |
| | **Must total** | | **≈ 74–76 h** |

### Should (by handover, if time allows)

Cache-busting + immutable CSS/JS (1.5) · FAQ chips on mobile (1) · Speculation Rules (0.5) · `content-visibility` (0.5) · minify with esbuild (1) · responsive sizes for remaining photos (1.5) · shared header/footer sync script, which prevents link drift (3) · budget script (0.5) · offboarding + secret rotation (1) · HSTS 1 year, DNSSEC, DMARC reports (1) · privacy notice for forms (1–2) · condensed sponsor wall if approved (1.5). **≈ 14–15 h**

### Phase 2 ($400)

Four starting points (3) · Flowcilitator summary + FAQ (3) · impact numbers + testimonials (3–4) · "get notified" sign-up (2) · share previews / OG tags site-wide (2) · move impact page to `/impact/` with 301s (1.5). **≈ 15 h**

### Later (out of scope; quote separately at $35/h)

monday.com integration (4–6) · self-editing tool / CMS with per-user 2FA logins (15–25) · header Apply during the window (0.5) · FAQ schema (0.5) · quarterly access review (security brief "Later").

---

## 7. Launch checklist (one page)

- [ ] Launch date confirmed ≥ 1 week before applications open
- [ ] Every URL in audit 1 §3 resolves or 301s; random URL → 404; `/review/` → 404
- [ ] Spam doorway URLs (`?Slot=`, `?Game=`, `?app=`, `?krslotID=`) listed for Search Console removal
- [ ] Forms: test entries reached LF's Sheet/email; spam tests pass; reviewers confirmed receipt
- [ ] One donate link everywhere; dates identical on Home, Program, Process, Form, FAQ; © 2026; Apply on the homepage
- [ ] Promo video plays from Vimeo; nothing loads from the old server
- [ ] Headers present (CSP enforced, no console errors); analytics recording
- [ ] DNS export current; MX/SPF/DKIM/DMARC untouched; email tested after the switch
- [ ] Rollback target noted and the drill done
- [ ] Old WordPress backup + form entries archived offline (restricted)

---

## 8. Key risks

| Risk | Mitigation |
|---|---|
| Applications open before the new site can launch (last year: 19 Nov) | Settle O1 on Friday; compress the schedule or launch the application form first |
| Late access (accounts, GoDaddy, Search Console) | Book the kickoff on Friday; the impact page can use the Drive fallback |
| Email breaks during the DNS move | Line-by-line comparison with the export; move DNS a week before launch; test email right after |
| Old WordPress still compromised (spam not reproducible today, but a backdoor is likely) | Don't clean or reuse it; archive offline; no runtime dependency on it |
| Personal data in forms (demographics, résumés) | LF-owned, restricted Sheet; minimum fields; no PII in logs; privacy notice (Should) |
| Hours exceed the fee (O6) | Rahsaan decides; Should items can slip into December support |
