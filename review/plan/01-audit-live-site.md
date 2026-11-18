# Audit 1: Live site (leaderflow.org)

**Prepared by:** Project Manager
**Date:** Thursday 12 November 2026
**Method:** Fetched as text only (curl to file, WebFetch-style). No browser, no scripts run, no redirects followed blindly. Each page was fetched three ways: with a desktop browser user agent, a Googlebot user agent, and with cloaking triggers (Google referrer, Korean `Accept-Language`, iPhone user agent, empty user agent). Public DNS was queried against 8.8.8.8. The Internet Archive (web.archive.org) CDX index was used to list every URL it has ever captured.

---

## 1. Summary

| Topic | Finding |
|---|---|
| **Platform** | **WordPress 7.1.4 on GoDaddy Managed WordPress**, not a Wix-style builder. Elementor 4.4.0 + Elementor Pro, Slider Revolution 6.7.1, "Gainlove" charity theme with a "leaderflow" child theme. Evidence in section 2. |
| **Hosting / DNS** | Domain on GoDaddy DNS (`ns31/ns32.domaincontrol.com`). A record `160.153.0.109` (GoDaddy). Traffic goes through GoDaddy's Cloudflare-based edge (`Server: cloudflare`, `x-gateway-*` headers). |
| **Email** | Google Workspace (MX = `aspmx.l.google.com`). SPF via GoDaddy-managed include. DMARC `p=none`. Mailchimp DKIM CNAMEs present. **All of these must be kept at launch** (section 7). |
| **Pages** | 17 published pages + 3 posts + WordPress archive/template URLs. 11 are real content pages. The rest are placeholders, plugin leftovers or WordPress internals (section 3). |
| **Hijacked pages** | `/about-us/` and `/leaderflow-development-program/participantfaqs/` served gambling spam in October 2026 (documented in `review/index.html`). **Today they serve normal LeaderFlow content from my location, under every cloaking test.** This does not prove the site is clean (section 5). |
| **Spam URLs** | The Internet Archive captured 25 spam doorway URLs on 11 May 2026, all on `/flowcilitators/become-a-flowcilitator/?Slot=…`, `?Game=…`, `?app=…`, `?krslotID=…`. This is a typical Korean casino SEO-spam campaign (section 5). |
| **Forms** | 3 Ninja Forms (Contact, Become a Flowcilitator, 2026 Application) + 1 Mailchimp embedded sign-up on every page. The application form has **no Turnstile/CAPTCHA**, two **mis-typed fields** (Email is a "phone" field, Phone is an "address" field), and a **resume upload that no longer renders** (section 4). |
| **Donate links** | The live site itself uses **three** donate destinations: `givebutter.com/ocXKYA` (main header button, mobile menu, Sponsor page), `givebutter.com/LFGivingTuesday2024` (second/sticky header button on every page), and a hidden `donatenow.networkforgood.org/communitypartners/` button on the Sponsor page. |
| **Dates** | Stale and conflicting: FAQ says applications closed **4 Jan 2026**; Application Process and the application form say **9 Jan 2026**; hidden blocks still say "NOW OPEN through **17 Sept 2024**" and "check back for **2024** program dates"; the menu says "**2025** Application Form"; the footer says "**© 2023**". |
| **Big media file** | The promo video `/wp-content/uploads/2022/10/leaderflow-promotional-video.mp4` is **194 MB**. Cloudflare Pages caps a single file at 25 MiB, so this must be compressed or hosted elsewhere (e.g. Vimeo, like the impact video). |
| **impact.leaderflow.org** | Does not exist yet (DNS: non-existent domain). |

---

## 2. Platform verdict: WordPress, not Wix

The spec says "Wix-style builder". The evidence says WordPress, hosted on GoDaddy. `review/index.html` is correct.

| Evidence | What was observed |
|---|---|
| Generator meta tags (homepage) | `WordPress 7.1.4`; `Elementor 4.4.0`; `Powered by Slider Revolution 6.7.1` |
| HTTP headers | `Link: <https://leaderflow.org/wp-json/>; rel="https://api.w.org/"`; `x-redirect-by: WordPress` on the www→apex and sitemap redirects |
| WordPress endpoints | `/wp-json/` returns 200 (site name "LeaderFlow", tagline "Leadership for AEC professionals"); `/wp-login.php` returns 200 (public login page); `/wp-admin/` redirects to login; `/xmlrpc.php` returns 403 (blocked); `/wp-sitemap.xml` is WordPress's own sitemap |
| Asset paths | `/wp-content/themes/gainlove/`, `/wp-content/themes/leaderflow/`, `/wp-content/plugins/…`, `/wp-content/uploads/…` |
| GoDaddy | REST namespace `wpaas/v1` (GoDaddy "WordPress as a Service"); archived `wp-content/mu-plugins/gd-system-plugin/` (GoDaddy system plugin) and `mu-plugins/vendor/wpsec/wp-2fa-plugin` (GoDaddy security); `x-gateway-cache-*` headers; SOA contact `dns.jomax.net` (GoDaddy) |

### Installed plugins (from REST namespaces and asset URLs)

For the security side. Versions are shown where the page exposed them.

| Plugin / component | Evidence | Note |
|---|---|---|
| Elementor 4.4.0 + Elementor Pro | generator, `elementor-pro/v1` | Page builder |
| Elementor AI, `elementor-mcp-composer/v1.0.20`, a generic `mcp` namespace | REST namespaces | `/wp-json/mcp` answers publicly (200). An AI/agent ("MCP") endpoint on a site that has been hacked deserves a look by the security developer |
| Slider Revolution 6.7.1 | generator, `sliderrevolution` | This plugin has a long history of serious vulnerabilities |
| Ninja Forms 3.16.1 (+ Conditionals, Style, Uploads add-ons) | asset URLs, `ninja-forms-submissions` | All site forms. Submissions are stored inside WordPress |
| Mailchimp for WordPress (MC4WP) | `mc4wp/v1` | Plus a hand-pasted Mailchimp embed form |
| Popup Maker | `popup-maker/v2`, `pum/v1` | Subscribe pop-up |
| Wordfence + Wordfence Login Security, `two-factor` | REST namespaces | Security plugins are installed, yet the site was still compromised |
| Redirection | `redirection/v1` | **There may already be redirects configured in WordPress.** Export them from WP Admin before shutdown (they are not visible from outside) |
| WP Mail SMTP | `wp-mail-smtp/…` | How form notification emails are sent today |
| Duplicate Post, CoBlocks (GoDaddy), Object Cache, WP Site Designer | REST namespaces | |
| GiveWP (leftover) | `[give_receipt]` shortcode on `/donation-confirmation-4/`, pages `donor-dashboard-3`, `donation-failed-4` | Old donation plugin, appears to be removed but its pages remain |
| TrustedSite badge | `cdn.trustedsite.com/js/1.js` on every page | Third-party script; the floating badge noted in the design review |

### Other security-relevant observations (for the Cybersecurity Developer)

- A WordPress username is public: `/author/brian/` returns 200 and is linked from the Newsletter category page.
- The user list via REST is blocked (401), which is good.
- `/wp-login.php` is publicly reachable.
- `/.env` and `/wp-config.php.bak` return 403 (blocked by the host).
- A Google Search Console verification TXT record exists, so someone at LeaderFlow (or a previous developer) has Search Console access. That account is the only reliable way to see which URLs Google has indexed, including any spam URLs (see section 5).

---

## 3. Complete URL inventory

Every URL below must be handled on the new site: either kept at the same path, or 301-redirected to the closest page. Sources: `wp-sitemap.xml` (and its sub-sitemaps), the WordPress REST API page list, links found on every page, and every URL the Internet Archive has captured.

### 3a. Content pages (keep at the same path)

| URL | Live status | Last modified | Content | In demo? |
|---|---|---|---|---|
| `/` | 200 | 2026-04-07 | Home: 3-slide Revolution Slider hero, impact video (Vimeo 941699892, autoplay with sound), "applications closed" notice, program cards, promo MP4, donate/sponsor panels, contact form, award, sponsor logos | Yes |
| `/about-us/` | 200 (**was hijacked**) | 2026-01-09 | Why LeaderFlow, what makes us different, values, mission/vision, founders | Yes |
| `/leaderflow-development-program/` | 200 | 2026-01-09 | Program overview, 7 sessions with objectives, program details, facilitators | Yes |
| `/leaderflow-development-program/application-process/` | 200 | 2026-01-09 | Eligibility, commitment, apply blocks (several with stale dates) | Yes |
| `/leaderflow-development-program/application-form/` | 200 | 2026-01-09 | "Applications closed" notice + the 2026 application form (Ninja Form 16) | Yes (notice only, no form) |
| `/leaderflow-development-program/leaderflow-graduates/` | 200 | 2025-10-31 | ~170 graduates by cohort/city (≈13.5 MB of images per the design review) | Yes |
| `/leaderflow-development-program/participantfaqs/` | 200 (**was hijacked**) | 2025-11-19 | FAQ; last answer is cut off mid-word ("…career vis") | Yes |
| `/flowcilitators/become-a-flowcilitator/` | 200 | 2025-03-22 | Flowcilitator info + inquiry form (Ninja Form 4). Target of spam doorway URLs | Yes |
| `/flowcilitators/meet-the-flowcilitators/` | 200 | 2025-04-17 | Facilitator profiles | Yes |
| `/become-a-sponsor/` | 200 | 2026-04-07 | Sponsor tiers with pledge amounts, logos, donate buttons | Yes |
| `/connect-with-us/` | 200 | 2022-10-26 | Email `janiece@leaderflow.org` + contact form (Ninja Form 3) | Yes |

### 3b. Placeholder / empty / leftover pages (redirect, do not rebuild)

| URL | Live status | What it is | Suggested redirect |
|---|---|---|---|
| `/flowcilitators/` | 200 | Empty parent page (only footer). Linked from breadcrumbs | → `/flowcilitators/become-a-flowcilitator/` |
| `/blog/` | 200 | Empty page | → `/` |
| `/newsletter-archive/` | 200 | Lists 3 "Lorem ipsum" example posts | → `/` (or `/connect-with-us/`) |
| `/2023/08/newsletter-example-1/` | 200 | Lorem ipsum post | → `/` |
| `/2023/08/newsletter-example-2/` | 200 | Lorem ipsum post | → `/` |
| `/2023/09/newsletter-example-3/` | 200 | Lorem ipsum post | → `/` |
| `/2023/08/05/`, `/2023/08/30/`, `/2023/09/05/` | 200 | Date archives | → `/` |
| `/category/newsletter/` | 200 | Category archive | → `/` |
| `/author/brian/` | 200 | Author archive (exposes a username) | → `/` |
| `/donation-confirmation-4/` | 200 | GiveWP leftover, shows raw `[give_receipt]` | → `/` |
| `/donation-failed-4/` | 200 | GiveWP leftover | → `/` |
| `/donor-dashboard-3/` | 200 | GiveWP leftover, empty | → `/` |
| `/header/header-white/`, `/header/header-landing/`, `/header/header-black/`, `/header/header-black-white/` | 200 | Theme header templates exposed as public pages | → `/` (or 410 Gone) |
| `/footer/footer-01/`, `/footer/footer-02/`, `/footer/footer-landing/` | 200 | Theme footer templates exposed as public pages | → `/` (or 410 Gone) |
| `/?p=9020` | 301 → `/about-us/` | WordPress short link (other `?p=` IDs work the same way) | Optional: handle `?p=` IDs for the 11 content pages (IDs in section 3e) |

### 3c. WordPress system URLs (handle at launch)

| URL | Today | On the new site |
|---|---|---|
| `http://leaderflow.org/` | 301 → https | Keep forcing HTTPS |
| `https://www.leaderflow.org/` | 301 → `https://leaderflow.org/` | Keep (www is a CNAME to the apex) |
| `/robots.txt` | 200, disallows `/wp-admin/`, points to `wp-sitemap.xml` | Replace with a new robots.txt pointing to `/sitemap.xml` |
| `/sitemap.xml` | 301 → `/wp-sitemap.xml` | Serve a real `sitemap.xml` |
| `/wp-sitemap.xml` + `/wp-sitemap-posts-page-1.xml`, `-post-1`, `-header-1`, `-footer-1`, `/wp-sitemap-taxonomies-category-1.xml`, `/wp-sitemap-users-1.xml` (archived) | 200 (users: now 404) | 301 → `/sitemap.xml` |
| `/feed/`, `/comments/feed/` | 200 RSS | 410 Gone or redirect → `/` |
| `/wp-login.php`, `/wp-admin/*`, `/xmlrpc.php`, `/wp-json/*` | Login page / API | Return 404/410. Do not redirect these to real pages |
| `/favicon.ico` | 302 (archived) | Provide `/favicon.ico` (the demo only has an SVG) |

### 3d. Uploaded files that other sites or emails may link to

- `/wp-content/uploads/2022/10/leaderflow-promotional-video.mp4`: **194 MB**, last modified 26 Oct 2022. The demo still streams it from the old server. It must move before the old host is cancelled, and it is too large for Cloudflare Pages (25 MiB per file). Options for the design plan: compress it, or upload it to Vimeo/YouTube like the impact video. Keep a redirect from the old path.
- Media library: **377 items** (287 JPEG, 63 PNG, 9 WebP, 1 AVIF, 1 MP4). **No PDFs.** The demo already has optimised WebP copies of the images it uses. Old image URLs under `/wp-content/uploads/…` will 404 after launch. That is acceptable for images, but a catch-all redirect `/wp-content/uploads/*` → `/` is worth considering.
- The **impact report PDF** is not on the site yet (it will arrive from Janiece).

### 3e. WordPress page IDs (for optional `?p=` redirects)

1197 Home · 9020 About · 9044 Program · 9432 Application Process · 9895 Application Form · 9434 Graduates · 10778 FAQ · 9465 Flowcilitators · 9504 Become a Flowcilitator · 9451 Meet the Flowcilitators · 9083 Sponsor · 9060 Connect · 1234 Blog · 9849 Newsletter Archive · 9366/9367/9368 donation leftovers. Posts: 9757, 9839, 9841.

### 3f. Search-engine index

- My web search tool does not index leaderflow.org (a `site:` search returned nothing from the domain), so I could not list Google's indexed URLs.
- **Action:** at the kickoff call, ask who controls the Google Search Console property (the verification TXT record proves one exists). Export the "Pages" (indexed) report and the spam URLs before launch, and add every indexed real URL to the redirect list. This is also where spam URLs can be removed from Google after launch.
- Archived 404s like `/leaderflow-developmentprogram/` (missing hyphen) show that at least one mistyped link exists somewhere. It's worth a redirect to `/leaderflow-development-program/`.

---

## 4. Forms

| Form | Where | Fields (as built in Ninja Forms) | Spam protection | Submits to |
|---|---|---|---|---|
| **Contact Us** (Ninja Form 3) | Home, `/connect-with-us/` | Name\*, Email\*, Phone, Message\* | Cloudflare Turnstile + Ninja honeypot | WordPress (admin-ajax), stored in WP + email notification via WP Mail SMTP |
| **Become Flowcilitator request** (Ninja Form 4) | `/flowcilitators/become-a-flowcilitator/` | Applicant Name\*, Email\*, Phone Number\*, Firm Name\*, Sessions of Interest (dropdown: 7 sessions), Education/Background, Why do you want to become a Flowcilitator?, Message/other comments | Turnstile + honeypot | Same as above |
| **2026 LeaderFlow Application** (Ninja Form 16) | `/leaderflow-development-program/application-form/` | See below | **Honeypot only. No Turnstile.** | Same as above |
| **Mailchimp sign-up** (embedded) | Every page (pop-up/footer) | Email\*, First Name, Last Name, Organization, interests: Program Applicants / Graduates / General Information / Sponsorship | Mailchimp's hidden honeypot field only | `leaderflow.us17.list-manage.com/subscribe/post?u=b499831579caca202a426782a&id=109e09415f&f_id=006460e0f0` |
| **Subscribe link** | Footer of every page | n/a | n/a | `http://eepurl.com/ivZ0H6` (Mailchimp hosted form, plain http) |

The Mailchimp embed has no CAPTCHA, and the pop-up makes it easy for bots to find. Both likely contribute to the fake sign-ups Janiece mentioned.

### 2026 application form: full field list (needed to rebuild it)

1. Intro text block: Program Overview + Program Curriculum
2. **Full Name**\* (built as a "first name" field)
3. **City**\* (Houston / Los Angeles / Seattle / New York / Chicago), with a per-city info block: eligibility, session dates (Houston: Kickoff Mar 5; Sessions Mar 6, Apr 10, May 8, Jun 5, Jul 17, Aug 14; Wrap Sep 24; Session 7 Sep 25), "Application Deadline: January 9, 2026 6:00PM PST"
4. Gender (optional): Man / Woman / Non-binary
5. Preferred Pronouns (optional): He/Him / She/Her / They/Them / Any
6. Ethnicity (optional): 6 options
7. **Email Address**\*: ⚠ built as a **phone** field
8. **Phone #**\*: ⚠ built as an **address** field
9. **Address**\*, **City**\*, **US State**\*, **Zip**\*
10. **Current Firm / Organization**\*, **Current Role / Title**\*
11. **Approximate Firm Size**\*: 1–50 / 51–100 / 101–200 / 200+
12. **Years of Relevant Experience in the AEC Industry**\*
13. LinkedIn Profile or Professional Website (optional)
14. Questionnaire, all required:
    - What leadership capacity do you most hope to strengthen through this program, and how do you envision applying it in your work or community? (250 words max)
    - Why are you applying to LeaderFlow at this stage of your career? What motivates you to grow as a leader now? (250–300 words max)
    - How will you ensure you can meet this commitment while managing the time, energy, and accountability required by the program (including balancing work, travel, assignments, and cohort interactions)? (200 max)
    - How do you approach vulnerability and mutual support in group settings? (200 max)
    - What unique perspective, experience, or resource do you hope to bring to your cohort peers? (150 max)
    - Dream a little: if you were equipped with essential leadership tools, a supportive network, and the ability to recognize and act on emerging opportunities, what impact would you hope to make in your career and community? (250 max)
15. **Resume / CV (PDF only)**: ⚠ the field type comes through as `unknown`, which means the Ninja Forms Uploads add-on is no longer rendering it. **Applicants may not be able to attach a resume right now.**
16. **Acknowledgements**\* (6 checkboxes): commit to all in-person sessions; full engagement; permission to use anonymised reflections; confidentiality; photo/video release if accepted; information is accurate.

**Implications for the rebuild:**

- The new application needs a **file upload (PDF résumé)**. That rules out a simple "email only" form backend, and it matters for the spreadsheet option and for security (file type and size checks).
- The form holds **personal and demographic data**. The receiving spreadsheet or inbox must be in a LeaderFlow-owned account.
- **Past submissions live in the WordPress database (Ninja Forms).** Export them before the old site is turned off.

---

## 5. Compromised pages and spam indicators

**Handle as hostile.** Everything below was fetched as text only. Nothing was rendered or executed.

### What was reported (October 2026, `review/index.html`)
- `/about-us/` and `/leaderflow-development-program/participantfaqs/` returned Korean casino / USDT-exchange spam with HTTP 200, while search crawlers saw normal content.

### What I see today (12 Nov 2026)
- Both pages return **normal LeaderFlow content** (About: 224,603 bytes; FAQ: 200,547 bytes). The responses are byte-for-byte identical under a desktop browser, Googlebot, a Google referrer, a Korean `Accept-Language`, an iPhone user agent and an empty user agent.
- No Korean text or gambling keywords on any of the 23 pages fetched.
- No unexpected external domains in `src`/`href`/`action` attributes on any page. External domains found: givebutter.com, linkedin.com, instagram.com, leaderflow.us17.list-manage.com, eepurl.com, cdn.trustedsite.com, digitalasset.intuit.com (Mailchimp badge), challenges.cloudflare.com (Turnstile), donatenow.networkforgood.org, cameronmacallister.com, aialosangeles.org.
- The Internet Archive has **no spam captures** of either page. The latest captures (7 Aug 2026) are clean, and the archive was briefly offline for one later query.

**Interpretation:** someone may have cleaned the pages since October, or the spam is cloaked on conditions I can't reproduce (visitor IP/country, cookies, first visit only, time of day). **Do not treat the old site as clean.** A WordPress hack like this usually leaves a backdoor behind. This strengthens the case for moving off WordPress rather than cleaning it.

### Spam doorway URLs (Indicators of compromise)
The Internet Archive captured 25 spam URLs, all on **11 May 2026** between 08:03 and 09:44 UTC, all hanging off one real page:

```
/flowcilitators/become-a-flowcilitator/?Slot=2695.html   (also 2890, 4236, 4502, 4591, 4745, 5882, 7613, 8253)
/flowcilitators/become-a-flowcilitator/?Game=2798.html   (also 5325, 6179, 7500)
/flowcilitators/become-a-flowcilitator/?app=0529.html    (also 2065, 5700, 6179, 7021, 7686, 7858, 7882)
/flowcilitators/become-a-flowcilitator/?krslotID=2082.html (also 7186, 7204, 8938)
```

- The archived copies and today's live response for `?Slot=2695.html` both show the normal Flowcilitator page. The spam content was probably served only to certain visitors, or the URLs were seeded by spammers to rank Korean slot keywords ("krslot").
- **For the new site:** these query strings will simply load the real page, which is harmless. The security developer may want a rule that strips or blocks `?Slot=`, `?Game=`, `?app=`, `?krslotID=` patterns, and the Search Console removal tool should be used for them.
- **No redirect domains** (where spam sends visitors) were seen in anything I fetched. If the October screenshots (`review/img/before-about-spam.webp`, `before-faq-spam.webp`) show a domain or Telegram handle, add it to the indicator list.

---

## 6. External links and embeds

| Purpose | URL | Where on live site | Note |
|---|---|---|---|
| Donate (main) | `https://givebutter.com/ocXKYA` | Primary header button, mobile menu Donate, Sponsor page "Click to Donate" (×2), Home "Click to Donate" | Most-used link |
| Donate (campaign) | `https://givebutter.com/LFGivingTuesday2024` | Second (sticky) header Donate button, every page | A 2024 GivingTuesday campaign, likely out of date |
| Donate (fiscal sponsor) | `https://donatenow.networkforgood.org/communitypartners/` | Sponsor page, a Donate button hidden on desktop/tablet (shows on mobile only) | Community Partners is LeaderFlow's fiscal sponsor (footer: "LeaderFlow is a project of Community Partners, a 501c3 company") |
| Newsletter | `http://eepurl.com/ivZ0H6` | Footer "Subscribe" | Plain http; use https on the new site |
| Newsletter embed | `leaderflow.us17.list-manage.com/subscribe/post?u=b499831579caca202a426782a&id=109e09415f&f_id=006460e0f0` | Pop-up/footer form | Mailchimp audience ID 109e09415f |
| LinkedIn | `https://www.linkedin.com/company/leaderflow/` | Footer | Founders' profiles on About: `/in/janiecelwilliams/`, `/in/john-gavan-se-7113a628/` |
| Instagram | `https://www.instagram.com/_leaderflow/` | Footer | |
| Impact video | Vimeo `941699892` | Home | Autoplay with sound (blocked by browsers) |
| Award | aialosangeles.org press release | Home | |
| Partner | `https://cameronmacallister.com/` | Home logo | |
| Email | `janiece@leaderflow.org` | Connect page | Cloudflare email obfuscation (`/cdn-cgi/l/email-protection`) |
| TrustedSite badge | `cdn.trustedsite.com/js/1.js` | Every page | Drop on the new site |

**Question for Janiece (already in the proposal): which donate link is current?** The answer should cover all three, including the Network for Good / Community Partners link.

---

## 7. DNS and email: what must be preserved at launch

Observed publicly on 12 Nov 2026 (resolver 8.8.8.8). Before changing anything, take a full export of the zone from GoDaddy, because private records (for example Google DKIM under a custom selector) are not visible from outside.

| Record | Value | Keep? |
|---|---|---|
| NS | `ns31.domaincontrol.com`, `ns32.domaincontrol.com` (GoDaddy) | Domain stays at GoDaddy (per proposal) |
| SOA | serial `2026060303` (last DNS change ≈ 3 June 2026), default TTL 600 s | TTL is already low (10 min), which helps a fast switch-over and rollback |
| A `leaderflow.org` | `160.153.0.109` (GoDaddy Managed WordPress) | **Changes at launch** to the new host. Write down the old value for rollback |
| CNAME `www` | → `leaderflow.org` | Point to the new host (or keep www → apex redirect) |
| MX | `aspmx.l.google.com` (1), `alt1`/`alt2.aspmx.l.google.com` (5), `alt3`/`alt4.aspmx.l.google.com` (10) | **Must keep exactly**: Google Workspace email |
| TXT (SPF) | `v=spf1 include:dc-aa8e722993._spfm.leaderflow.org ~all` → which resolves to `v=spf1 include:_spf.google.com ~all` | **Keep.** This is a GoDaddy-managed SPF include. If the zone moves away from GoDaddy, the include must be flattened. If a form service sends email "from" leaderflow.org, its SPF include must be added |
| TXT | `google-site-verification=DJSfG69DhZRXDnshIVk6K542l1jBLOzzKAjaUJqRC30` | **Keep** (Search Console) |
| TXT | `v=verifydomain MS=3535067` | **Keep** (Microsoft domain verification, purpose unknown; ask) |
| TXT `_dmarc` | `v=DMARC1; p=none;` | Keep. Monitoring only, no reports address. The security brief may recommend tightening it later |
| CNAME `k2._domainkey` | → `dkim2.mcsv.net` | **Keep** (Mailchimp DKIM) |
| CNAME `k3._domainkey` | → `dkim3.mcsv.net` | **Keep** (Mailchimp DKIM) |
| `google._domainkey` | Not found | Google DKIM may be off, or use another selector. Check in Google Admin |
| CNAME `_domainconnect` | → `_domainconnect.gd.domaincontrol.com` | GoDaddy default, keep |
| `impact.leaderflow.org` | Does not exist | **To be created** for the impact page (needs the 15-min GoDaddy call) |

---

## 8. Content issues that need to carry over or be fixed

| # | Issue | Where |
|---|---|---|
| 1 | Conflicting application deadlines: **Jan 4, 2026** (FAQ) vs **Jan 9, 2026** (Application Process, application form). FAQ also says the window opened **Nov 19, 2025** | FAQ, Application Process, form |
| 2 | Stale hidden blocks still in the page source: "NOW OPEN through September 17, 2024", "We are not accepting applications for 2025…", "check back for 2024 program dates", "2026 Cohort Applications are now open! … Apply Now" | Application Process, Program |
| 3 | Menu item says "**2025** Application Form" (mobile/secondary menu) | All pages |
| 4 | "Sessions are held once a month on Fridays beginning in March through November" vs city session dates that end in **September** | Program vs application form |
| 5 | Footer "© 2023" | All pages |
| 6 | FAQ last answer cut off: "…align your current role with your long-term career vis" | FAQ |
| 7 | "Acquire practice skills" (probably "practical") | Home |
| 8 | "Field:" vs "Industry:" labels mixed | Graduates |
| 9 | "LeaderFlow, Inc. was created as a 501(c)(3) nonprofit" (About) vs footer "LeaderFlow is a project of Community Partners, a 501c3 company" | About vs footer. Ask which is correct |
| 10 | Three different donate destinations (section 6) | Site-wide |
| 11 | Newsletter pages are Lorem ipsum placeholders | `/newsletter-archive/`, `/2023/…` |
| 12 | Application form field-type bugs and broken resume upload (section 4) | Application form |
| 13 | Application form has no Turnstile (the other two forms do) | Application form |
| 14 | Homepage hero rotates 3 messages; first CTA is "About Us"; no "Apply" button | Home |
| 15 | Vimeo autoplay with sound (shows a black box); promo MP4 is 194 MB and embedded twice | Home |
| 16 | 2026 application window is closed; next dates unknown | Everywhere. **Need from Janiece** |

---

## 9. Things to collect before the old site is switched off

1. Export of **Ninja Forms submissions** (all past applications and inquiries) from WP Admin.
2. Export of the **Redirection plugin** rules (there may be existing redirects).
3. Full **GoDaddy DNS zone export**.
4. **Search Console** indexed-pages export and a list of spam URLs.
5. The **promo MP4** (194 MB) and any media not already in the demo.
6. A full **backup** of the WordPress site, kept offline and treated as possibly infected. Never restore it onto the new host. This is the rollback copy promised in the proposal.
7. Who receives form notification emails today (WP Mail SMTP / Ninja Forms email actions).
