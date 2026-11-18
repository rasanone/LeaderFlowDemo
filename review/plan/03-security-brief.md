# 03 — Security Brief: LeaderFlow website rebuild

**From:** Cybersecurity Developer · **Date:** 2026-11-12 · **For:** Project Manager
**Scope source:** Appendix B of `review/prompt.md`

This is a small static site, so the security work is mostly about **accounts and secrets**, plus a few config files. Do the steps in order. Effort is Rahsaan's time; "LF" means LeaderFlow staff click it, usually on a screen-share.

---

## Repo facts this brief relies on

- No inline `<script>` or `on*=` handlers; one deferred `assets/js/site.js`; no npm deps. **A strict CSP works today.**
- About 70 inline `style="…"` attributes (mostly logo widths in `index.html` and `become-a-sponsor/`). A CSP without `unsafe-inline` blocks them, so move them to classes.
- Third parties: Google Fonts; Vimeo iframe (loaded on click); **the promo MP4 is hot-linked from the hacked server** (`leaderflow.org/wp-content/uploads/2022/10/leaderflow-promotional-video.mp4`). It breaks at cutover and shouldn't load from that host anyway. Givebutter and Mailchimp are plain links (no CSP entries needed).
- No `.gitignore`. The repo is on Rahsaan's personal GitHub (`rasanbenladeen/LeaderFlowDemo`), and `review/` (the hack audit) is tracked. No secrets found in git history.
- The old site is almost certainly WordPress (`/wp-content/`, Elementor), not Wix.

---

## MUST: before the December launch (in order)

### A. Rahsaan's own setup: do this before deploying anything (≈4–6 h)

These close the gaps behind the AWS compromise: owner/root account used for daily work, long-lived keys on the laptop, weak MFA, no audit trail.

1. **Supported OS.** This PC runs Windows 10 (build 19045), which no longer gets security updates. Upgrade to Windows 11 or use a supported device for all LeaderFlow work. Turn on BitLocker, Defender and auto-updates, and use a non-admin daily user. If the AWS root cause was this machine, or was never found, do a clean install.
2. **Password manager** (Bitwarden or 1Password) with a unique generated password for every account. LeaderFlow never sends him a password.
3. **Two FIDO2 security keys** (primary and backup, about $50–110 total) registered on the password manager, GitHub, Cloudflare and Google; TOTP where keys aren't supported (GoDaddy, Mailchimp). **No SMS.** Print the recovery codes and store them offline.
4. **Separate browser profile "LeaderFlow"** with only the password-manager extension. Use it only for LeaderFlow admin consoles.
5. **GitHub cleanup:** delete classic PATs, unused SSH keys and unknown OAuth/GitHub Apps; skim the Security log. Never put a token in a git remote URL.
6. **Purge old secrets** from the laptop (`.aws\`, `.env`, `*.pem`, service-account JSON, `.wrangler`). Confirm the old AWS keys were deleted.
7. **Git hygiene:** add a `.gitignore` (`.env*`, `.dev.vars*`, `*.pem`, `*.key`, `*service-account*.json`, `.wrangler/`, `node_modules/`). Install **gitleaks** and run it as a pre-commit hook. Rule: **any secret that touches git gets rotated.**
8. **Rules:** production secrets exist **only** in Cloudflare's encrypted secrets, never in files or on the laptop. Never use the Cloudflare Global API Key. Local development uses Turnstile test keys (site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`) and a test Sheet.
9. **If a credential leaks:** (1) revoke or rotate it immediately; (2) check the Cloudflare Audit Log, GitHub audit log, GoDaddy activity and Google admin logs for new users, tokens, DNS changes or deploys; (3) roll back the site or DNS if anything changed; (4) tell LF within 24 h; (5) write a 5-line incident note.

### B. LeaderFlow's accounts: impact-page call and kickoff week (≈5 h + LF ≈2 h)

All accounts are owned by LeaderFlow (ideally two LF owners, with a role address like `web@leaderflow.org` for recovery). Rahsaan is an invited user with the lowest role that works.

10. **GoDaddy (LF):** 2-step verification on (not SMS); auto-renew on; **Domain Lock on**; check for unknown delegates, API keys and domain forwarding. Invite Rahsaan via **Account Settings → Delegate Access** at the lowest level that allows DNS edits (no purchasing).
11. **Back up DNS before touching it:** export the GoDaddy zone file and screenshot the records. Save them in LF's Drive. Note where **MX/SPF/DKIM/DMARC** point. If MX points at the old web host, email lives there, so flag it before anything is cancelled. Ask LF about any record nobody recognises.
12. **Cloudflare (LF creates, Free plan, LF email, 2FA):** invite Rahsaan as **Administrator** (not Super Administrator), or a narrower role set if the dashboard offers one. **No payment method**: on Free, Functions stop at the limit instead of billing. No API tokens are needed.
13. **Impact page (`impact.leaderflow.org`)** goes in **LF's** Cloudflare account, never Rahsaan's personal one. Add the custom domain in Pages first, then add a CNAME `impact → <project>.pages.dev` at GoDaddy. If LF's account isn't ready by Nov 13, use the Google Drive link fallback from the proposal.
14. **Move DNS hosting to Cloudflare** (the domain stays registered at GoDaddy) at least a week before launch. Import the records, **compare them line by line with the export**, and keep old-host and email records **DNS only**. If DNSSEC is on at GoDaddy, turn it off first. Change the nameservers, then test email in and out. From then on, make every DNS change in Cloudflare and log it (date, record, old value, new value).
15. **GitHub org owned by LF:** require 2FA for members. Rahsaan gets **Maintain** on one private repo, not Owner. Run gitleaks, then transfer `LeaderFlowDemo` into the org. Add a ruleset on `main` that blocks force-push and deletion. Make the old personal repo and any GitHub Pages demo private or turn them off.
16. **Revoke everything the hacked WordPress site knew:** Mailchimp API keys (**Account → Extras → API keys**: revoke any key LF can't name), SMTP/app passwords, plugin keys, hosting/FTP/DB passwords. Turn on 2FA at the host.
17. **Mailchimp (LF):** 2FA for all users; in the audience's form settings turn on **double opt-in** and **reCAPTCHA**; remove unknown users and integrations. Keep the hosted sign-up form as a plain link (no API key on our side).
18. **Givebutter (LF):** check team members and **verify the payout bank details haven't changed**. Rahsaan needs no access.
19. **Google (LF):** if on Workspace, enforce 2-Step Verification, review admins and third-party apps, and check key mailboxes for forwarding rules nobody set up. Verify a **Search Console** Domain property and remove unknown owners **and their verification tokens**, plus unknown sitemaps.
20. **LF confirms every external link** copied from the hacked site (both Givebutter links, `eepurl.com/ivZ0H6`, social links) actually belongs to LeaderFlow.

### C. The site (Phase 3 build, ≈6 h)

21. **Deploy only the site.** Put public files in `site/` (Pages build output directory `site`, no build command); `functions/` stays at the repo root; `review/` and `README.md` are never published. Use the Pages **GitHub integration**, installed on the LF org for **this repo only**.
22. **Add `site/404.html`.** Without it, Pages serves the homepage with **200** for every unknown URL, including the old spam URLs.
23. **Remove inline `style=` attributes** (move them to classes), **self-host the fonts** (woff2 in `site/assets/fonts/`), and **move the MP4** to LF's Vimeo (or into `site/` if it's under 25 MiB).
24. **`site/_headers`** (test it first as `Content-Security-Policy-Report-Only` on preview, check the browser console on every page, then enforce before launch day):
    ```text
    /*
      Content-Security-Policy: default-src 'none'; script-src 'self' https://challenges.cloudflare.com https://static.cloudflareinsights.com; style-src 'self'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'self' https://cloudflareinsights.com; frame-src https://player.vimeo.com https://challenges.cloudflare.com; form-action 'self'; base-uri 'none'; frame-ancestors 'none'; upgrade-insecure-requests
      Strict-Transport-Security: max-age=86400
      X-Content-Type-Options: nosniff
      Referrer-Policy: strict-origin-when-cross-origin
      Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()
      X-Frame-Options: DENY

    https://:project.pages.dev/*
      X-Robots-Tag: noindex
    https://:version.:project.pages.dev/*
      X-Robots-Tag: noindex
    ```
    - The allowed origins are Turnstile, Cloudflare Web Analytics and Vimeo. `data:` is needed for the CSS's SVG icons.
    - If inline styles and Google Fonts aren't removed by launch, temporarily use `style-src 'self' https://fonts.googleapis.com; style-src-attr 'unsafe-inline'; font-src https://fonts.gstatic.com`.
    - Don't restrict `fullscreen`/`autoplay` in Permissions-Policy, or the Vimeo player breaks.
    - Test that the impact PDF opens. If a browser's viewer breaks, add a `/*.pdf` rule with `! Content-Security-Policy`.
    - SRI: none needed after self-hosting. Cloudflare's scripts must not be pinned. Any future CDN file needs exact version + `integrity` + `crossorigin`.
25. **`site/_redirects`:** old path → new **internal** path or a fixed, checked URL only. No splats into hostnames and no `?url=` style redirects (that keeps it free of open redirects). Spam URLs get a real 404 (Google drops 4xx URLs). A 410 would need a small Function; it's optional.
26. **Cloudflare zone settings:** SSL/TLS **Full (strict)**; **Always Use HTTPS** on; **Minimum TLS 1.2**; TLS 1.3 on; **Rocket Loader off**. **Bot Fight Mode** on (turn it off if it breaks the forms). WAF custom rule to block `/wp-login.php`, `/xmlrpc.php` and `/wp-admin*`. One **rate-limiting rule** on `/api/*` (Free plan: about 5 requests per 10 s per IP → block). Web Analytics on (cookieless, so no Google Analytics).
27. **Preview deployments:** turn on the Pages **Access policy for previews** (Cloudflare Access, free) for Rahsaan's and LF reviewers' emails. That's the private preview link. Previews use test secrets.

### D. Forms and Functions (≈6–8 h)

28. **Where the data goes:**
    - **Application form:** simplest and safest is a **Google Form owned by LF** (no secrets, team can edit the questions, which the proposal promises).
    - **Contact and Flowcilitator forms (or a custom application form):** Pages Function → **Apps Script web app bound to an LF-owned Sheet** (`/** @OnlyCurrentDoc */`), which appends the row and sends a formatted email with `MailApp`.
    - **Avoid** a Google service-account JSON key (a long-lived cloud key, the AWS mistake again).
    - The Apps Script must be **deployed by an LF-owned account** ("Execute as: Me", access "Anyone"), not Rahsaan's.
29. **Each Function (`/api/<form>`, POST only), checks in this order:**
    1. `Origin` is `https://leaderflow.org` or `https://www.leaderflow.org`.
    2. Body ≤ 32 KB (64 KB for applications).
    3. **Turnstile verified server-side** via `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` (`secret`, `response`, `remoteip` = `CF-Connecting-IP`); require `success`, the expected `action` and `hostname`.
    4. **Honeypot** field (hidden with a CSS class): if it's filled, return a fake 200 and store nothing.
    5. **Allow-list fields** with max lengths (name 100, email 254, phone 30, textareas 3,000–5,000; select values must match the option list); strip control characters. No file uploads.
    6. Forward JSON to Apps Script with a shared secret in the body.
    7. Return generic JSON errors with `Cache-Control: no-store` and `X-Content-Type-Options: nosniff` (`_headers` doesn't apply to Functions).
30. **Secrets:** Pages → **Settings → Variables and Secrets**, type **Secret**, separate Production and Preview values: `TURNSTILE_SECRET`, `SHEET_WEBHOOK_URL`, `SHEET_WEBHOOK_SECRET`. Nothing secret in HTML, JS or git. Turnstile widget hostnames: `leaderflow.org`, `www.leaderflow.org`.
31. **Apps Script safety:** compare the secret on every request; write cells as **plain text** (prefix values starting with `= + - @` with `'`) to stop formula injection; **HTML-escape** fields in the email; strip CR/LF from the subject and reply-to.
32. **CORS / logs / PII:** send **no** `Access-Control-Allow-Origin` header (same-origin only). Add `site/_routes.json` `{"version":1,"include":["/api/*"],"exclude":[]}`. Log only `{form, status, error code}`, never names, emails or bodies. The Sheet is **Restricted** to named LF staff. Rahsaan tests with fake data and has no access to the production Sheet after launch testing. Collect the minimum: no DOB, SSN or demographics unless LF needs them.

### E. Old site (≈2 h + LF)

33. **Archive, don't keep it live.** LF downloads a full backup (files + DB) and stores it in a **restricted** LF Drive folder. It contains malware and likely old applicant data, so never unzip or run it on the dev machine. Flag to LF that old form entries may have been exposed; they may want advice on whether they need to notify anyone (not legal advice).
34. **Rollback = Cloudflare Pages "Rollback" to the previous deployment** (seconds). Practise it once before launch. **The hacked WordPress site is not a rollback target.** Update the SOW wording: *"the previous version can be restored within minutes"* (the proposal says "switch back to the old site"), and explain why on the Friday call.

### F. Launch day

35. Before the switch:
    - `review/` returns 404 on production.
    - Headers are present (`curl -sI`; securityheaders.com grade A).
    - Each form has been tested on production: the row arrives, `=1+1` isn't evaluated, `<b>` is escaped, a submission without Turnstile is rejected, and a filled honeypot stores nothing.
    - A random URL returns 404.
    - The rollback target is noted and the DNS export is current.
36. Switch: add `leaderflow.org` and `www` as Pages custom domains and replace the old-host records. **Don't touch MX/SPF/DKIM/DMARC.** Log the change.
37. After the switch:
    - HTTPS and the www↔apex redirect work.
    - Email in and out works.
    - No CSP errors in the console on the real domain.
    - Re-test one form.
    - Search Console: submit the sitemap, request indexing of `/about-us/` and `/participantfaqs/`, and file **Removals** for the spam URL prefixes.

---

## SHOULD: by handover (early January)

- **Offboard Rahsaan at handover (LF clicks, ≈1 h):** remove or downgrade him in Cloudflare, the GitHub org, GoDaddy delegates, Mailchimp, and Sheet/Script sharing. **Rotate every secret he handled** (Turnstile, webhook secret). Hand over a "where everything lives" page (accounts, owners, secret *names*, the DNS log, incident steps).
- **HSTS:** raise to `max-age=31536000` after 2 stable weeks. Add `includeSubDomains` only after confirming every subdomain serves HTTPS. No `preload`.
- **DNSSEC:** enable it in Cloudflare (DNS → Settings) at least 3 days after the nameserver move, then add the DS record at GoDaddy (≈20 min).
- **DMARC:** if it's missing, add `v=DMARC1; p=none; rua=…` (Cloudflare's free DMARC Management works for the reports) and move to `quarantine` after clean reports. Coordinate with LF's email admin.
- **After 30 days stable:** delete the DNS records pointing at the old host (to avoid dangling records). LF cancels hosting only after confirming email doesn't live there.
- **Short privacy notice** linked from the forms: what's collected, who sees it, how long it's kept, and that analytics is cookieless.
- Optional: interim containment of the spam before launch (proxy the old site and add WAF block rules for the spam paths). Signed commits.

## LATER: Phase 2 and ongoing

- **monday.com:** server-side Function only. Use a dedicated monday user limited to one board (personal tokens carry that user's full rights) or an OAuth app with minimal scopes. Store the token as a Cloudflare secret, use GraphQL **variables** (no string building), and run the same Turnstile/validation pipeline first.
- **Stay dependency-free:** no `package.json` in the repo. If Wrangler is used locally, pin it (`npx wrangler@<exact version>`). If CI is ever added: `permissions: contents: read`, actions pinned to commit SHAs, and an account-owned Cloudflare token with `Pages: Edit` only and an expiry.
- **Quarterly (30 min):** access review on every account, a skim of the Cloudflare Audit Log, Search Console security issues and users, Mailchimp API keys list, domain auto-renew and lock.
- **Yearly, and whenever someone leaves:** rotate the Function secrets and check the headers still score A.
- **Any new embed or third party** (Givebutter widget, chat, form tool) needs a CSP update and Report-Only testing first.

---

## To verify in the live dashboards (not guessed)

- Exact Cloudflare role names.
- Whether the preview Access toggle also covers the production `*.pages.dev` host.
- GoDaddy delegate-access level names.
- Mailchimp setting labels.
- Givebutter 2FA support.
- Whether `LeaderFlowDemo` is public right now.
- The old host's identity, and whether it also handles email.
