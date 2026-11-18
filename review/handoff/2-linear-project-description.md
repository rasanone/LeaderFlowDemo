# Linear project description

## Summary (short field)

Rebuild leaderflow.org as a fast, secure static site on Cloudflare Pages, replacing the hacked WordPress site, live at least one week before applications open (target Tue 1 Dec 2026).

## Description

**Client:** LeaderFlow, a nonprofit leadership program for AEC professionals (contact: Janiece)
**Owner:** Rahsaan
**Plan:** `review/plan/05-project-plan.md` in the repo (source of truth for tasks and dates). Scope and payment come from the proposal as sent.

### Goal

Replace the compromised WordPress site with the approved static redesign (plain HTML/CSS/JS), hosted on Cloudflare Pages in LeaderFlow's own account. Applicants should have a smooth, spam-free experience when applications open.

### Priorities

1. **Security:** LeaderFlow owns every account, 2FA everywhere, no shared passwords, no long-lived keys, and the old site is never a fallback.
2. **Performance:** pages load fast on phones, with page-size budgets checked with PageSpeed and WebPageTest.

### In scope: Phase 1 (launch)

- New site on Cloudflare Pages with security headers, a 404 page, and redirects for every old URL
- Contact and Flowcilitator forms (Turnstile, honeypot, Function → LeaderFlow-owned Google Sheet + email)
- Application form in a tool the team can edit (Tally recommended, Google Form fallback; to be confirmed)
- Matching dates, FAQ and a single donate link; "Apply" button on the homepage
- Mailchimp double opt-in + reCAPTCHA
- Cookieless visitor statistics (Cloudflare Web Analytics)
- Impact report page at impact.leaderflow.org (included at no cost)
- DNS moved to Cloudflare with email records preserved; launch, after-launch checks, support through Dec 31
- Handover guide in early January

### Phase 2 (separate project, after applications are underway)

Four starting points on the homepage, Flowcilitator summary + FAQ, impact numbers and testimonials, a "get notified" sign-up, and share previews.

### Out of scope (quote separately at $35/h)

monday.com integration, a self-editing tool/CMS, new pages.

### Key dates

| Date | Milestone |
|---|---|
| Fri 13 Nov | Call with Janiece; impact PDF due |
| Mon 16 Nov | Scope-of-work document final |
| Nov 16–18 | Kickoff + account setup |
| Mon 23 Nov | DNS on Cloudflare; private preview sent |
| Nov 23–27 | Client feedback rounds (Thanksgiving Thu 26) |
| Nov 27–30 | Testing |
| **Tue 1 Dec** | **Launch (tentative; depends on application opening date)** |
| Dec 1–31 | After-launch checks and support |
| Early Jan | Handover |
