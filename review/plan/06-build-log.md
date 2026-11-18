# 06: Build log (Phase 1 demo refinement)

**By:** Full-Stack Senior Web Dev · **Date:** Thursday 12 November 2026
**Base:** `main` @ `b60abb6`. **Nothing is committed or pushed.** The moves are staged as `git mv` renames, and new files are untracked. `review/` is untouched apart from this file.
**Follows:** `05-project-plan.md` (D1–D7, §6 work list) and `04-design-plan.md`.

---

## 1. What changed, by plan item

### M4: restructure to `site/` (D3)
- Used `git mv` to move every deployable file into `site/`: all page folders, `index.html`, `assets/` and `.nojekyll`. Git history follows the files.
- Kept outside `site/`: `README.md`, `review/`, the new `tools/` (developer scripts) and the new `source-images/` (originals for generated images; never deployed).
- All page links are still relative. `site/.nojekyll` was kept as instructed. It can be deleted once the site is on Pages.
- `review/index.html` (not edited) still points at `../assets/...` for its favicon and logo, so those two images no longer load on that internal page. It is never deployed.

### M5: hardening files (site-side parts only)
- **`site/404.html`:** same header and footer as the site, with links to Home, Apply, Development Program, FAQ, Become a Flowcilitator and Connect, and `noindex`. Every link is root-relative (`/…`), because the host serves this page at any unknown URL.
- **`site/robots.txt`** allows everything and points to `https://leaderflow.org/sitemap.xml`.
- **`site/sitemap.xml`** lists the 11 content pages (`lastmod` 2026-11-12). The 404 and donate pages are left out.
- **Canonical tags** (`https://leaderflow.org/<path>/`) are on all 11 pages.
- **Icons:** `site/favicon.ico` (16 and 32 px, PNG-in-ICO) and `site/apple-touch-icon.png` (180 px, full-bleed) are made from the brand SVG by `tools/make-icons.mjs`. They are linked in every page's `<head>`.
- **Inline styles:** the 70 `style=""` attributes are gone. Logo widths are now the `width`/`height` attributes (same rendered size). The rest became classes: `framed--2x1`, `framed--3x2`, `framed--5x6`, `title-sm`, `logos--single`, `btn-row--center`, `split--top`, `callout__sub`. One old inline `margin-top:24px` never applied (it was overridden by `.mt-0 !important`), so it was dropped to keep the page looking the same.
- **No inline scripts or `on*=` handlers** anywhere (checked in the browser). JS still sets two CSS custom properties through the CSSOM (`--i` stagger, `--sub-h`), which a CSP allows.
- **Not done (Cloudflare work, Rahsaan):** `_headers`, `_redirects`, `_routes.json`, WAF and zone settings.

### M6: performance
- **Fonts, self-hosted and trimmed** (`site/assets/fonts/`, script `tools/build-fonts.sh`):
  - Built with fonttools from the OFL variable fonts in github.com/google/fonts. They were downloaded into their own scratch folder and nothing from them is in the repo except the output and the two OFL licence files.
  - Fraunces roman: wght 300–600, opsz 9–144 (variable), SOFT pinned to 100 and WONK to 1. 58.7 KB.
  - Fraunces italic: wght 300–400, opsz pinned at 72. 40.6 KB (it was 70 KB with opsz variable). The italic is only used at display sizes (the hero word, the city highlights, one feature quote). Side by side, the hero's "Leadership" is very slightly wider than before. If Janiece notices, rebuild with opsz kept variable (+30 KB).
  - Inter: wght 400–600, opsz 14, and only the features in use (`cv11`, `ss01`, etc.). 34.2 KB.
  - Latin subset, WOFF2, `font-display: swap`, `unicode-range`. Fraunces roman and Inter are preloaded on every page; the italic is not.
  - Fallback metric overrides (Georgia → Fraunces, Arial → Inter) limit layout shift when the fonts swap in (`tools/fallback-metrics.py`).
  - The Google Fonts links and preconnects are removed, so every page now loads from **one origin**. Headings were SOFT 50 before and are SOFT 100 now (the design plan accepted this). The difference is barely visible in the screenshots.
- **Hero LCP fix:** no opacity animation on the hero H1 or the hero image any more. Only the lede, buttons and status fade in. The image has `fetchpriority="high"`, `srcset` 480w/713w and `sizes`. It is now an opaque 5:4 crop of exactly the region the arch showed before (the transparent corners were outside it, checked pixel by pixel), so the `scale(1.1)` hack is gone. 55.9 KB → 24.4 KB (713w) or 13.6 KB (480w). Measured LCP element: the hero image, about 290–330 ms locally.
- **Interior header photos:** now a `<picture>` with `<source media="(min-width: 760px)">` and a 1×1 `data:` GIF as the fallback, so phones download nothing (the box is hidden below 760 px). Desktop gets a centred 1040×417 crop: 25.5 KB and 34.8 KB, from 33.1 KB and 45.9 KB. `fetchpriority` was removed, because the H1 is the LCP on interior pages.
- **Graduate headshots** (`tools/images.mjs grads`):
  - All 172 photos are pre-cropped to 4:5 with exactly the CSS's old `object-position: center 22%`, so nothing visible changes.
  - Sizes are 240w, 360w and 480w, never upscaled. Where the crop is narrower, its native width is used.
  - Each image has `srcset` and `sizes="(max-width: 700px) 45vw, 240px"`, plus correct `width`/`height` (was a wrong `560×560`). The first 5 load eagerly; the rest are lazy.
  - Alpha is kept, because some sources are cut-outs on a transparent background. My first pass dropped the alpha channel and exposed junk pixels on at least one photo; this was caught in the screenshots and fixed.
  - The originals moved to `source-images/grads/`.
- **Reveal flicker fix:**
  - `site.js` now marks `.reveal` content that is already on screen as visible *before* removing `no-js`, so it never blinks out and fades back in.
  - The hero flow lines now draw with a CSS animation from the first frame instead of with JS.
  - The nested `.reveal` inside `.reveal` on the homepage is gone (that callout moved).
- **Orphans:** `hero-connect.webp` and `leader-3.webp` were not used by any page. They moved to `source-images/photo/` so they are no longer deployed.
- **Image tools available:** libwebp `cwebp`/`dwebp` 1.6 (msys2) and headless Edge. There is no Pillow and no ImageMagick. fonttools went into a throwaway venv in the scratchpad, not the repo. Every re-encode is one lossy generation from a lossless PNG intermediate, at q82 with `-sharp_yuv`. Spot-checked visually.

### M8: content
- **Homepage hero:** the main button is now gold **"Apply"** → `application-form/`, and "About Us" became a secondary ghost button. A status line sits under the buttons.
  - Closed: the approved "The application period for the 2026 … is now closed." + "Get notified" (Mailchimp).
  - Open: "Applications for the [YEAR TBC] … open until [CLOSING DATE AND TIME TBC]."
- The status callout was taken out of the video row (design plan H2), so the impact video now stands on its own.
- **Applications open/closed switch, in one place:**
  - Home, Program, Application Process, Application Form and FAQ each carry both an `apps-open` and an `apps-closed` version.
  - One line in `site.css` (`APPLICATIONS SWITCH`) hides one set. It is set to **closed**.
  - The closed version uses the existing approved wording plus a **"Get notified"** button → `https://eepurl.com/ivZ0H6`. The open version has "Apply now" or "Start your application".
  - It is static CSS: there is no JS date logic, it works without JS, and screen readers skip the hidden version.
- **Program page:** the status callout moved near the top (state-aware). The "Your First Step Starts Here." band now has **Apply** next to "Connect with Us".
- **Application Process:** the callout is state-aware.
- **FAQ:** the stale "November 19, 2025 … January 4, 2026" bullet is replaced by the state-aware text (closed: the approved closed sentence + "get notified"; open: the same sentence with TBC dates). The truncated last answer is still verbatim (O10).
- **Footer:** © 2026 on every page. Subscribe now uses `https://eepurl.com/ivZ0H6`.
- **Donate (O3 is open, so I did not pick one):**
  - Every Donate and "Click to Donate" button (14 places) now points to the internal **`/donate/`** page.
  - That page forwards with a 0-second meta refresh and has a visible fallback link. It is `noindex`.
  - **The URL lives only in `site/donate/index.html`** (two lines marked `DONATE-URL`). It is set to `https://givebutter.com/ocXKYA`, the live site's *main* header and mobile-menu Donate link per audit 1 §6 and audit 2 §4.
  - Later, `/donate/ <url> 302` in `_redirects` can replace the page.
  - **Verify on Pages** that a `_redirects` rule takes precedence over the static `donate/index.html` before relying on it, or delete the page when adding the rule.

### M10: Application Form page (front end only)
- The page is now the applicants' landing page.
  - Open state: dates (TBC), a "Who can apply" summary (verbatim eligibility bullets), "What you'll need" (drawn from the 2026 form's fields in audit 1 §4), and a primary **"Start your application"** button to the external form.
  - Closed state: the approved callout + "Get notified", with eligibility and "What you'll need" still shown so people can prepare.
- The button is a plain same-tab link with no third-party script or iframe. Its href is the placeholder `#APPLICATION-FORM-URL-TBC` (the tool is undecided, O4).
- "What you'll need" and the open-state heading are **draft copy for Janiece's approval** (marked in HTML comments). No time estimate or interview dates were invented.

### M9: Contact and Flowcilitator forms (front end only)
- **Validation bug fixed.**
  - JS validates required fields, email format, phone (at least 7 digits) and length.
  - Errors appear inline under each field, as text plus an icon (never colour alone), linked with `aria-describedby` and `aria-invalid`.
  - Focus moves to the first invalid field, and the status region announces "Please correct the highlighted fields". Fields re-check as they are fixed.
- **Sending behaviour:** the button is disabled while sending, values are kept if sending fails, and focus moves to the status message when it finishes.
- **No-JS fallback:** `novalidate` was removed from the HTML (JS adds it). Forms have `action="/api/contact"` or `/api/flowcilitator` with `method="post"`, so without JS the browser validates and posts there. Those endpoints don't exist yet, so a no-JS submit will error until the Function is built.
- **Honeypot:** a `website` field, off-screen via the `.form__hp` class, `aria-hidden` and `tabindex="-1"`. JS fakes success and sends nothing if it is filled. **The Function must also drop these.**
- **maxlength:** name 100, email 254, phone 30, firm 150, contact message 5,000, Flowcilitator textareas 3,000 (matching security brief D29).
- **Turnstile:** a marked `<div class="form__turnstile" data-turnstile-slot>` in each form, plus the lazy-load steps as a comment in `site.js`. There are no keys and no script loads.
- `data-endpoint` is still empty. There is no Function code and no secrets.
- Required fields show `*` (hidden from screen readers, which announce "required"), with a "Fields marked * are required" note.

### Accessibility (on everything touched)
- Visible focus rings on all new links and buttons (the existing `:focus-visible` system).
- Error colour `#a4161a` (7.4:1 on white).
- Fixed the Flowcilitator breadcrumb, which had two `aria-current` items.
- The hero status link is gold on navy (well above 4.5:1).
- Reduced motion: the hero is fully visible with no animation (checked: opacity 1 on H1, image and lede).
- With JS disabled, pages and forms render fully (checked in screenshots).
- **Not done:** an NVDA/VoiceOver pass (M13, a manual test).

### Not done (out of scope, as instructed)
- Promo video: still `leaderflow.org/wp-content/…/leaderflow-promotional-video.mp4`, with `TODO(M7, D6)` comments in `index.html` and `site.js`.
- Everything Cloudflare, DNS, accounts, Phase 2 items, and copy beyond the approved fixes.

---

## 2. Measurements

The local server sends files uncompressed, so text files are shown with Brotli compression applied (what Pages will send). Fonts and images are actual bytes. Headless Edge was used with the cache disabled. "First view" = everything loaded before scrolling.

| | Before | After |
|---|---|---|
| **Homepage first view, mobile 375 px @2×** (HTML+CSS+JS br + fonts + images) | **≈ 462 KB** (16.6 + 311.7 + 133.3), 13 requests, **3 origins** | **≈ 253 KB** (19.8 + 130.9 + 102.5), 12 requests, **1 origin** |
| **Fonts, homepage** | 311.7 KB (Google Fonts) | **130.9 KB** (Fraunces roman 58.7 + italic 40.6 + Inter 34.2 on disk) |
| Fonts, interior pages | 165.2 KB | **91.1 KB** |
| Hero image | 55.9 KB (1010×627, alpha) | 24.4 KB (713w) / 13.6 KB (480w) |
| Interior page images, first view on mobile (e.g. Connect, FAQ) | 41.1 KB (hidden header photo) | **8.6 KB** (logo only) |
| **Graduates, 2025 tab, all 70 photos** | **1,341 KB** | **911 KB** on a 2× phone · **533 KB** on 1× desktop |
| Graduates first view, desktop (images) | 372.7 KB | 163.4 KB |
| Graduates first view, mobile (images) | 145.3 KB | 79.6 KB |
| CSS (br) / JS (br) | 10.3 / 1.9 KB | 11.8 / 3.3 KB (fonts, forms, new components) |

- The homepage first view is still above the design plan's 170 KB budget. What's left is mostly the fonts (131 KB). Further options: drop the italic (−41 KB) or keep it unpreloaded as now; and responsive sizes for the remaining large photos (Should S7).
- Checks run on all 11 pages + 404 at 375 px and 1366 px:
  - 0 console errors, 0 failed requests, 0 broken images, no horizontal scroll at 375 px.
  - `tools/check-links.mjs`: 13 pages, 1,095 internal references, 0 broken.
  - Form validation, honeypot, reduced motion, the donate forward, the open state (forced via a test style) and no-JS rendering were all checked in headless Edge, with screenshots.

---

## 3. Placeholders to fill

| Placeholder | Where | Decision |
|---|---|---|
| `[YEAR TBC]`, `[OPENING DATE TBC]`, `[CLOSING DATE AND TIME TBC]` (class `tbc`, highlighted with a dashed box) | Open-state blocks on Home, Program, Application Process, Application Form, FAQ (search `TBC`) | O1 |
| `#APPLICATION-FORM-URL-TBC` | "Start your application" on the Application Form page | O4 (Tally vs Google Form) |
| Donate URL (`DONATE-URL`, currently `givebutter.com/ocXKYA`) | `site/donate/index.html` only | O3 |
| Applications switch (currently closed) | `site/assets/css/site.css`, `APPLICATIONS SWITCH` | Flip when applications open |
| `data-endpoint=""` + `data-turnstile-slot` | 3 forms | M9 server side |
| Draft copy ("What you'll need", "Applications are open", the 404 text) | Application Form page, 404 | Janiece approves |
| Optional time estimate | Application Form page (HTML comment) | Janiece |

---

## 4. Left for Rahsaan

1. **Before any commit:** plan item 0.1. There is still no `.gitignore`, and `review/plan/`, `review/prompt.md` and `review/ux-research-notes.md` are untracked. Also ignore `.check-out/` (output of `tools/check-pages.mjs`). The new `site/`, `tools/` and `source-images/` files are untracked and need `git add` on purpose.
2. **Cloudflare:**
   - Pages project with output directory `site`, no build command.
   - `_headers` (CSP: no inline styles or scripts remain, so `style-src 'self'` should work; `img-src` needs `data:`).
   - `_redirects` from audit 1 §3, including `/flowcilitators/`, and optionally `/donate/`.
   - `_routes.json`, Functions + Turnstile keys, Web Analytics, Access on previews.
   - Check that Early Hints picks up the font preloads.
3. **Vimeo (M7):** upload the promo video to LF's Vimeo and replace the MP4 facade.
4. **Verify `https://eepurl.com/ivZ0H6` works.** I could not test it from here (the automated request was blocked). The audit recommends https. If it fails, revert to `http://` in every page.
5. **Open decisions:** O1 dates, O3 donate link, O4 application tool, and approval of the draft copy.
6. **Visual check:** compare the fonts side by side (Fraunces SOFT 50 → 100 on headings; italic opsz pinned) on a real device.
7. **Manual screen-reader pass (M13):** NVDA and VoiceOver on the forms, menu, tabs and accordions.

---

## Addendum (12 Nov): impact page + flow-journey hero prototype

- **Impact page** built in `impact/` (standalone; one HTML file with inline CSS, no JS, two fonts, placeholder PDF). Every placeholder is listed in the comment at the top of `impact/index.html`. First view ≈113 KB before the PDF. Has `noindex` until real content is in.
- **Flow-journey hero (PROTOTYPE)** on `site/index.html`: the three headlines from the old rotating slider ("Accelerate Your Leadership", "Closing the Gap to Advancement", "Connect & Grow with Us") shown together as numbered steps on the gold flow line, each linking to its homepage section (`#program`, `#closing-the-gap`, `#connect`). The steps appear once in order; nothing rotates. Under 700px they become a 3-column row. CSS only, in the "Hero: flow journey" block of `site.css`. Step labels are shortened from the slide headlines, so Janiece needs to approve them.
- **Bug fix:** flow lines (hero and footer) were cut off on screens wider than 1440px, because the `pathLength` dash animation doesn't work with `vector-effect: non-scaling-stroke`. Lines now draw in with a left-to-right `clip-path` wipe.
- Checks: 12 pages × 2 viewports clean (no console errors, no sideways scroll); no broken internal links or images.

### Update: hero changed to a rotating headline (replaces the flow-journey prototype)

- Centred hero. The H1 cycles through the old slider's three headlines ("Accelerate Your Leadership", "Closing the Gap to Advancement", "Connect & Grow with Us") with a word-by-word rise/blur animation. All three are stacked in one grid cell, so the heading never changes height (no layout shift).
- Three stops on a new symmetric flow line at 25% / 50% / 75% of the width, labelled "Accelerate", "Close the gap" and "Connect & grow" (no numbers). The active stop is lit and its bar fills over 6 s; when the bar finishes, the next headline shows (the CSS `animationend` drives `site.js`). Clicking a stop jumps to it. A pause/play button meets WCAG 2.2.2.
- With reduced motion there is no auto-rotation (stops still switch on click), and the pause button is hidden. Without JS, the first headline shows.
- An arch-framed photo below crossfades with each headline, using the three original slider photos. `tools/images.mjs hero` now makes opaque 5:4 crops of all three: accelerate 24 KB, closing-gap 18 KB, connect 35 KB (713w), plus 480w versions.
- Cost: about 1.4 KB of JS and the two extra photos (they load at low priority).

### Update (13 Nov): photo beside the heading; progress shown on the flow line

- Layout: text and the arch photo side by side, with the flow line and its stops across the full width underneath, so everything fits on the first screen (1366×900). On phones: text, then the stops, then the photo.
- Progress: the loading bars are gone. A thick (4px, glowing) gold copy of the line fills it from left to right at a constant speed, one third per headline (6.5 s each, `--dwell`). As each new headline arrives, the previous third eases back to thin; after the third headline the line fades and starts again. `site.js` sets `data-active`, and each third's `animationend` moves on to the next headline. The pause button freezes it.

### Update (13 Nov): line and headline driven by one clock

- The thick gold line now grows continuously from the left across all three headlines (no jumping), and fades out at the end of each cycle.
- Sync: a single clock in `site.js` (requestAnimationFrame) sets both the line's length (via an SVG `clipPath` rect) and the active headline, photo and stop. There are no separate CSS animations that could drift apart. The headline changes exactly when the line's edge crosses one third and two thirds of the width. Stops moved to the centre of each third (x 240 / 720 / 1200 in the viewBox; 16.7% / 50% / 83.3%). The clock pauses when the hero is off screen, the tab is hidden or Pause is pressed. Clicking a stop jumps the clock to the start of that third.
- Verified with a 23-second trace (230 samples, including clicks and pause/play): 0 mismatches between line position, headline, photo and highlighted stop.
- Incoming headline words now start 0.12 s after the change (was 0.25 s), so the swap visibly begins as the line crosses.
- Follow-up: the headline now switches the instant the line's tip touches each dot, not at the one-third boundaries. The tip moves at a constant 480 viewBox units per headline, from dot 1 (x 240) to dot 2 (720) to dot 3 (1200), then on to the right edge; it holds briefly, fades out over 1 s, and the next loop starts with the line drawn up to dot 1. Re-verified: 0 mismatches in 370 samples; switches recorded at clip width 737→742 (dot at 740) and 1216→1224 (dot at 1220).

### Update (13 Nov): simpler line, no pause button, phone layout

- The flow line is now a true sine wave (period 960, amplitude 30 in viewBox units), with peaks at the first and third dots and a trough at the middle dot.
- No labels on the line (desktop or phones): the three dots are the controls (44px tap targets, named by visually hidden text).
- Pause button removed at Rahsaan's request. Note: WCAG 2.2.2 expects a way to pause content that moves by itself for more than 5 s. Mitigations in place: no auto-rotation with reduced motion; the clock stops when the hero is off screen or the tab is hidden.
- Phones (under 700px): the photo is hidden so the hero fits on screen; `sizes` makes phones fetch the smallest file for the one eager image (the other two are lazy and are not fetched while hidden). Tablets (700px and up) keep text and photo side by side.
- Re-verified: sync trace 0 mismatches (including clicks); homepage at 375px and 1366px has no console errors and no sideways scroll.
- Dots removed from the line as well (with their buttons, CSS and click handling). The line is now purely decorative: the gold fill grows along the sine wave and the headline, description and photo change as the tip passes the crest/trough points (x 240 / 720 / 1200). Re-verified: 200-sample sync trace, 0 mismatches; homepage clean at 375px and 1366px.

### Update (13 Nov): hero polish and a smoother end of loop

- **Feathered line instead of a hard cut.** The thick gold line is now shown through an SVG gradient mask (`#journey-mask`) instead of a `clipPath` rect. `site.js` moves the gradient's 8 stops each frame, so the tip fades out softly over about 100 viewBox units and the glow fades with it. No dots or markers; same single clock.
- **End of loop (Rahsaan's request).** Old: the full line held for about 2 s, faded linearly in 1 s, then a 260-unit segment popped back in over 0.3 s. New: the tip runs off the right edge at the same steady speed. The full line rests for about 0.8 s. Then it **dissolves from left to right**: a soft 520-unit trailing edge sweeps along the line in the direction of flow, with smoothstep easing, over 2.35 s. A brief empty beat follows. Then the next line **draws in from the left edge** over 1.25 s on a cubic curve. It starts at rest and arrives at the first crest at exactly the steady speed, so the hand-off into the next loop has no jump in position or speed. Headline 1 returns as the tip reaches the crest, as at every other change.
- **Headline choreography.** The word blur was removed. It caused 7 to 10 dropped frames (up to 104 ms) the first time each headline appeared. Words now use opacity and transform only: the outgoing words lift away quickly (0.3–0.4 s, ease-in). The incoming words rise in with a long ease-out (`--ease-out`, 0.24 s delay, 70 ms stagger), so the two headlines barely overlap. The description follows at 0.4 s.
- **Photo crossfade without a dip.** The incoming photo fades in on top (`is-active`, z 2). The previous one stays opaque underneath (`is-prev`). The arch shadow moved to the frame, so it no longer doubles during the fade. The other two photos are decoded after `load` (desktop and tablet only).
- **Composition.** The wave's height now scales with width (`clamp(110px, 11.5vw, 220px)`), so it keeps its sweep on wide screens. From 700 to 1199px the text column gets the larger share, so each headline fits on two lines and the hero is about 110px shorter at 768px.
- **Rejected:** a lighter, comet-like head colour (looked washed-out next to the brand gold, and close to a marker).
- **Checks:**
  - Sync trace: 300 samples, 0 mismatches. Changes happen at tip x ≈ 720 / 1200 / 240.
  - Frame times over the first headline change and over the loop restart at 1366 and 375 (headless): 0 frames over 25 ms (before: 8).
  - `check-pages`: no problems, no sideways scroll.
  - Reduced motion: first headline stays, gold line hidden.
  - No JS: first headline shows, gold line hidden.
  - Hero bottom: 777px at 1366×900, 790px at 1440×900, 846px at 1920×1080.

### Update (13 Nov): form-first Connect and Flowcilitator pages, form redesign

- **Whole form in the first view.** Connect and Become a Flowcilitator now open with a `form-hero`: title on the left, the full form card on the right, inside the dark band. The photo banner and the old lower form sections are gone. The Flowcilitator details (role, qualifications, training) follow below, reached by three jump links, and end with a "Back to the inquiry form" link.
- **Verified:** the whole card, including the Send button, is in view at 1280×640, 1366×657 (1366×768 laptop with browser bars), 1440×789, 1536×730 and 1920×960. Under 820px tall the form tightens; under 700px tall the Flowcilitator card title becomes screen-reader-only. Phones: title, then the form (Connect's email/social links move below it).
- **Form redesign (all three forms, including the homepage):** no asterisks; optional fields say "(optional)". Soft-filled 48px fields with a white background and gold ring on focus. Name and Email side by side. Textareas grow with their text. Clearer button labels ("Send message", "Send inquiry") with an arrow; full-width on phones. Email fields show a `name@example.com` hint.
- **Sessions of interest is now multi-select** (checkbox list in a dropdown; works without JS; `site.js` shows "2 sessions selected", closes on Escape or an outside click). **Back end note:** `sessions` can now arrive more than once per submission.
- Label tweaks: "Your Name" → "Name", "Message/other comments" → "Other comments", "Start a discussion here" → "Message" (the card title now says "Start a discussion"). New microcopy: card title "Flowcilitator inquiry" and "Ready to lead a session?"; confirm with Janiece.
- Checks: interaction test (multi-select, inline errors, demo submit message) passed with no JS errors; `check-pages` 24 checks with no problems or sideways scroll; `check-links` no broken internal links.
- Follow-up: Connect now shows one wave (the hero's wave was removed; the footer keeps its own), and the hero and footer read as one dark surface (the hero grid fades out as the footer grid fades in; no glow at the join). Both form heroes have an even background (the warm bottom-left patch is gone). The back-to-top button is removed from Connect. In-page links now scroll smoothly (`scroll-behavior: smooth`, off with reduced motion); checked with a jump link landing just under the header.

### Update (13 Nov): homepage program cards and sponsor wall

- **Program cards (#program):** the outlined serif numbers are gone. Each card now has a line icon in a round badge and a small solid number (Inter 600, tabular, gold rule). Choreographed reveal: cards rise in turn (110 ms stagger), then a gold line draws across each card's top edge, the icon draws itself in (stroke dash), the number slides in, and the photo settles from a slow zoom. Hover (pointer devices): the card lifts, a soft light follows the pointer (`[data-spotlight]` in `site.js` sets `--mx`/`--my`), and the icon badge turns gold. Reduced motion: everything shows at once. Considered and rejected: sticky stacking cards (long, awkward on phones), expanding panels (hide text, no hover on phones), 3D tilt (off-tone).
- **Sponsor wall:** logos now show in full colour (the grayscale/72% opacity filter made them read as faint text). Even grid per tier: 5 across (3 for Foundational/Platinum), 3 on tablets, 2 on phones; the squeezed Regional/Partner side-by-side columns are gone. Logo width/height attributes are area-normalised from each file's real proportions, with extra area for thin or detailed marks (Structural Group, Cameron MacAllister, Syska Hennessy, Moody Nolan, Walter P Moore, etc.).
- **Source-file limits:** the SHoP logo file is missing its "o"; Cameron MacAllister's text is tiny inside its image; Moody Nolan's mark is faint. Better logo files from those organisations would fix them.
- The Become a Sponsor page shares the logo styles (now full colour) but keeps its older size attributes.
- Checks: frame captures of the reveal at 0.06–2.4 s and the hover state; `check-pages` 24 checks clean; `check-links` clean.

### Update (13 Nov): Lucide icons site-wide; statement beside the video

- **All icons are now Lucide** (lucide-static v0.469.0, ISC; licence copied to `site/assets/LICENSE-lucide.txt`). No hand-drawn icons remain. Inline: chevron-down (nav), linkedin, instagram, arrow-up (back to top), info (callouts), arrow-right (buttons), play (videos, filled via CSS), mail, award, and the program cards: presentation, sprout, users, handshake, graduation-cap (with `pathLength="1"` so they still draw in). CSS data URIs: circle-alert (field errors), arrow-right and arrow-down (button and jump-link arrows), check (tick lists), chevron-down/up (selects and the sessions dropdown). 86 replacements across 12 pages plus the stylesheet.
- **Cities statement + video side by side** (`.reach`): statement left, video right from 960px up; stacked below that. Roughly halves the section's height on desktop.
- Checks: screenshots of each changed area (desktop and phone); card reveal and hover re-tested; `check-pages` 24 checks clean; `check-links` clean.

## Homepage hero: graduate wall (2026-11-13)

The three old slider photos (at most 1010px wide, pre-cropped from the old site, visibly soft) are gone from the hero.
In their place is a wall of real LeaderFlow graduate portraits taken from the Graduates page, using only people with
a 360px+ version so they stay sharp on high-density screens.

- Three columns (four at 1600px and wider) drift slowly in alternating directions behind a soft mask, bleed off the
  right edge and pass under the flow line. Each column holds its ten portraits twice so the loop is seamless.
- Every portrait shares a navy monochrome grade, which also evens out their mixed backgrounds. Every 3.6s, site.js
  lights one fully visible graduate in colour, with a gold ring and their name, city and cohort year.
- A "Meet our graduates" link sits on the wall. The wall itself is decorative (aria-hidden).
- Phones show one sideways-drifting strip of portraits under the buttons (no captions).
- With reduced motion, nothing drifts or lights up. The drift pauses while the hero is off screen.
- The headline rotator and gold flow line are unchanged; the old photo crossfade code was removed.
- Markup is generated by `tools/grad-wall/build.py` (run `python tools/grad-wall/build.py tools/grad-wall site`).
  To change who appears, edit its COLS lists (indexes into `tools/grad-wall/sharp-grads.json`, the graduates with
  360px+ photos) and re-run it.
- Checked with screenshots at 1920, 1440, 1366x657, 1280, 1024, 820 and 375 wide. check-pages: 24/24 clean.
  check-links: nothing broken.
- Follow-up: the highlight now goes round the columns in shuffled rounds (each visible column once per round, never the
  same column twice in a row). Before, the left column could never be picked because of an edge rule. Tested over 12
  turns: 4/3/4 at 1440 wide, all four columns at 1920.
- Smoother drift: each track is its own GPU layer (will-change + translate3d), so the movement runs on the compositor
  at the display's frame rate with sub-pixel steps. The "Meet our graduates" button lost its backdrop blur, which was
  being redrawn every frame over the moving photos; it now has a near-solid background instead.
- Cooldown: a graduate who was just highlighted can't be highlighted again for 30 seconds (COOLDOWN in site.js, keyed
  by photo so the duplicate copy used for the loop counts as the same person). Tested over ~70s: 19 different people
  in a row, no repeats.
- Mobile: the drifting photo strip is gone on phones (under 700px). It crowded the hero between the application notice
  and the wave, and cut the wave off on short screens. In its place, under the notice, is a row of four overlapping
  graduate faces with a "Meet our graduates" link (FACES in tools/grad-wall/build.py; those images are lazy and hidden
  on larger screens, so they never download there). The whole hero, wave included, now fits on screen at 375x667,
  360x740, 390x844 and 430x932. Tablets under 900px keep the wall but drop the name captions (too narrow), so only the
  gold ring marks who is lit. check-pages: 24/24 clean.

## Development Program application form, built on our site (2026-11-13)

Decision: the program application is our own form instead of Tally or Google Forms (O4), so it can go through the same
form handler and monday export as the other forms (see 07-forms-to-monday-plan.md).

- **Where:** a new section on the Application Form page, generated by `tools/application-form/build.py` (edit the
  lists there, then run `python tools/application-form/build.py site`). "Start your application" now jumps to it
  (`#apply`) instead of a hosted form.
- **Content:** seven numbered sections. Fields, the six questions and their word limits match the live 2026 Ninja
  Forms application (audit 01, section 4).
  1. About you: name, email, phone; optional pronouns, gender and ethnicity
  2. Program city: five city cards
  3. Mailing address: street, city, state, ZIP
  4. Your work: firm, role, firm size, years of experience, optional LinkedIn
  5. Six questions, each with a live word counter
  6. Résumé: PDF only, up to 5 MB
  7. Six commitments
- **Placeholders (TBC):** the ethnicity options and the commitment wording, because the audit captured only their gist.
  The size cap is our choice. LeaderFlow should confirm all questions.
- **Desktop:** a sticky list of sections on the left ticks each one off when it is complete and highlights the one in
  view.
- **Saving:** answers (all but the file) are saved in the applicant's browser as they type and restored on return, with
  a "Clear the form" option. The draft is removed once the application is sent.
- **Validation:** now also covers radio groups, required tick-boxes, PDF type and size, word limits, ZIP code, whole
  numbers and web addresses. `https://` is added if missing. The six commitment errors now each show (they had shared an
  id).
- **Not connected yet:** `data-endpoint` is empty, so Submit shows the demo message. Uploading the résumé needs file
  storage (Cloudflare R2) in the form handler.
- **Visibility:** the form shows only while applications are open. New: add `?preview=open` to any page to see the
  open state (with a yellow "Preview" flag), for checking and for Janiece's review. When the form handler is built, it
  must also refuse applications while applications are closed, since anyone can add that to the address.
- **Tests:**
  - empty submit flags all 25 required items and focuses the first
  - an answer over its limit and a non-PDF file are rejected with clear messages
  - a fully filled form passes, and all seven sections tick off
  - a reload restores the draft
  - screenshots at 1440 and 375; no JS errors
  - check-pages: 24/24 clean; check-links: nothing broken

## Application form: step by step, on its own page (2026-11-13)

- **Its own page:** the application moved to `leaderflow-development-program/application-form/apply/`. "Start your
  application" on the Application Form page now links there; the info page keeps dates, eligibility and "what you'll
  need". While applications are closed, the Apply page shows the closed notice instead (`?preview=open` shows the
  form). The new page is added to `sitemap.xml` and `tools/check-pages.mjs`.
- **One section at a time** (site.js, `data-wizard`): seven sections plus a new step 8, **Review and submit**. It lists
  every answer by section, with "Complete" or "N items need attention" and an Edit link.
- **Moving around:** each section has its own address (`#step-...`), so the browser Back button and the section list
  both move between sections, and any section can be opened at any time. Back/Next buttons sit at the foot of each
  section; Next checks the current section first. Submit checks everything and opens the first section with a problem;
  the section list marks sections with errors in red and completed ones with a tick.
- **Progress:** "Step N of 8" and a progress bar. On phones the section list becomes a row of numbered circles, and
  Back/Next stack full width.
- **Header:** the Apply page uses a slim header (`.page-hero--slim`) so the form starts high on the screen.
- **Without JavaScript:** every section shows on one page and the form still submits.
- **Tests (1440 and 375):**
  - starts on step 1
  - Next on an empty step stays put and shows 3 errors
  - Next after filling goes to step 2
  - the section list jumps to step 7
  - browser Back returns to step 2
  - review lists all sections correctly
  - Submit with gaps opens step 2 and flags 6 sections
  - a complete application passes (demo message)
  - no JS errors
  - check-pages: 26/26 clean; check-links: nothing broken

## Hero smoothness: measured and fixed (2026-11-13)

The photo wall already moved as rigid columns: each `.wall__track` holds a column's photos and moves with one GPU
transform. A Chrome trace of 3 seconds of the hero showed the stutter came from elsewhere.

| 3-second trace | Repaints | Raster jobs |
|---|---|---|
| Before | 1,071 | 675 |
| Gold line hidden | 86 | 44 |
| Light-up transitions off | 446 | 10 |
| **After the fixes** | ~450 (cheap paint passes) | **~35–67** |

1. **Gold flow line:** it grew by moving SVG gradient-mask stops every frame, so the whole line and its drop-shadow glow
   were repainted every frame. Now the line is painted once, inside two "windows" (current line, next line) with
   soft-edged masks. site.js only moves the windows (and holds their panes still) with transforms, so nothing is
   repainted. The timing, feathered tip, tail dissolve and loop are the same.
2. **Light-up:** the filter fade (grayscale to colour) and the box-shadow ring repainted the 5,000px-tall column on
   every frame of the 1.2s fade. Now the tinted photo never changes: site.js adds a full-colour copy of the same file,
   with an inset gold ring, on top, and only its opacity animates. The large outer shadow was dropped.
3. **Slow-drift pixel snapping:** the drift keyframes add `rotate(.01deg)`, a common workaround for Chrome snapping
   slow transforms to whole pixels (judder at ~27px/s).
4. **Wall photos are lazy-loaded**, so phones (where the wall is hidden) no longer download them.

check-pages 26/26 clean; check-links: nothing broken.
