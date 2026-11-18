# Prompt for the Linear agent: Cloudflare forms setup

Paste everything in the box below into Linear's agent. It adds the Cloudflare database work to the existing
"LeaderFlow Website: Phase 1 (Launch)" project and updates the issues that still describe the old plan (Apps Script,
Google Sheet, Tally). Background: `review/plan/07-forms-to-monday-plan.md`.

```text
Update my Linear project "LeaderFlow Website: Phase 1 (Launch)" (team LeaderFlow, key LF) for a change of plan on the website forms. Before you create or change anything, show me the full list of new issues and every change to existing issues, and wait for my OK. Reuse existing labels, milestones and statuses; don't create duplicates. If an issue I mention doesn't exist, tell me instead of guessing.

CONTEXT
All three website forms (Contact, Become a Flowcilitator, and the Development Program application) are now our own forms. Submissions go to a small API on Cloudflare (Pages Functions in the repo's functions/ folder), which checks them (Turnstile spam check, honeypot, every field again), saves them in a Cloudflare D1 database, saves résumé PDFs in private Cloudflare R2 storage, and emails staff through Resend. Staff download a monday.com-ready spreadsheet from a private staff page at leaderflow.org/admin/, protected by Cloudflare Access. Phase 2 sends submissions straight into monday through its API. This replaces the earlier plan of Apps Script → Google Sheet, and the Tally option for the application.

1. CHANGES TO EXISTING ISSUES
- "Contact + Flowcilitator forms: validation fix, honeypot, Turnstile, Function → Apps Script → Sheet + email": rename to "Contact + Flowcilitator form handlers (D1 + email)". Replace the description with: "Est: 4 h. Write functions/api/contact.js and functions/api/flowcilitator.js using the shared form code. Save to D1, email staff through Resend. Front end already done." Keep labels Forms, Phase 1.
- "Application form in the chosen tool + application page": rename to "Application form handler (D1 + R2 résumé + open/closed dates)". Description: "Est: 8–12 h. Write functions/api/application.js. Check that the résumé really is a PDF, max 5 MB; refuse applications outside the open dates; flag duplicate emails. Front end already built." Remove any "blocked until the form tool is decided" note.
- Decision "O4 Application form tool: Tally (recommended) or Google Form": set status Done, add the comment "Decided 13 Nov 2026: our own form on the new site, saved to Cloudflare D1. See the forms plan."
- "Kickoff + LeaderFlow account setup (Cloudflare, GitHub org, Tally, …)": remove Tally from the title and description.
- Later item "monday.com integration (4–6 h)": rename to "Phase 2: send submissions straight into monday (API)", move it to the Phase 2 project, est 8 h, label Phase 2.

2. NEW ISSUES (Phase 1 project, label Forms unless stated, owner Rahsaan unless stated)
Put "Est: X h" at the start of each description.

Milestone "Kickoff & accounts" (due Wed 18 Nov)
- [High] LeaderFlow creates their Cloudflare account (role email, 2FA, Free plan) and invites Rahsaan as Administrator. Est 0.5 h. Labels Client & Admin, Security. Owner Janiece. Status Waiting on Client.
- [High] Decision: OK to add a payment card to Cloudflare? R2 (résumé storage) and Zero Trust (staff login) may ask for a card even on the free tiers; expected cost $0. Label Decision. Owner Janiece. Status Waiting on Client.

Milestone "Build" (due Fri 20 Nov)
- [High] Local setup: install Wrangler, add wrangler.toml, schema.sql (submissions table), .dev.vars.example and .gitignore (.dev.vars, .wrangler/). Run the site, functions and a local database with `wrangler pages dev`. No Cloudflare account needed. Est 1.5 h. Due Mon 16 Nov.
- [High] Shared form code: validation, Turnstile check, honeypot, D1 save, Resend email, open/closed dates. Est 4 h.
- [High] Create the Pages project from GitHub (output directory "site", no build command, functions/ at repo root). Est 0.5 h. Label Security. Blocked by the Cloudflare account issue.
- [High] Create the D1 database (leaderflow-forms, plus leaderflow-forms-preview for testing), run schema.sql on both, put the IDs in wrangler.toml. Est 0.5 h. Blocked by the Cloudflare account issue.
- [High] Create the R2 bucket leaderflow-resumes (private; public access off). Est 0.25 h. Blocked by the card decision.
- [High] Turnstile widget for leaderflow.org and the pages.dev preview domain. Put the site key in the forms and store TURNSTILE_SECRET as a Pages secret. Est 0.5 h.
- [High] Resend: add the sending domain, add its DNS records at GoDaddy, store RESEND_API_KEY as a Pages secret. Est 1 h. Label DNS & Launch. Owner Together.
- [High] Staff page /admin/: list submissions, "Download new" and "Download all" monday CSV (UTF-8 with BOM), open a résumé, delete a submission. Est 6 h.
- [High] Cloudflare Access: protect /admin/* and /api/admin/*, one-time PIN login, policy = staff email list. Est 1 h. Label Security. Blocked by the card decision and the staff emails.
- [Medium] Automatic deletion: a scheduled Worker removes submissions and résumés older than the agreed retention. Est 1.5 h. Label Security. Due Thu 31 Dec.

Milestone "Testing" (due Mon 30 Nov)
- [High] Forms end-to-end test: each form on preview, a fake non-PDF résumé, an application while closed, spam/honeypot, the emails arriving, CSV import into a TEST COPY of the monday board (every column, résumé link, dropdowns). Est 3 h. Label Testing.
- [High] One-page "How to import into monday" guide for staff, with screenshots. Est 1.5 h. Label Client & Admin.

3. NEW CLIENT INPUT ISSUES
Milestone "Kickoff & accounts", label Client & Admin, owner Janiece, status Waiting on Client, due Fri 20 Nov:
- Screenshots of every monday board column (name and type), plus the exact status/dropdown labels
- Which forms go into monday (all three, or only applications)?
- Who receives the submission emails?
- Staff emails allowed into the staff page
- Should applicants get a confirmation email?
- Confirm the application questions, ethnicity options and exact commitment wording
- How long to keep submissions (suggested 12 months)
- Should old un-entered Ninja Forms submissions be exported once and imported?

4. DEPENDENCIES
Set "blocked by" links as noted above. Also: the Access issue and the staff page are blocked by "Staff emails allowed into the staff page"; the forms end-to-end test is blocked by all three handler issues, the staff page and the Resend issue.

Finally, list for me any existing issue that still mentions Apps Script, Google Sheet or Tally, so I can check it.
```
