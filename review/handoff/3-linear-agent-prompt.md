# Prompt for the Linear agent

Paste everything in the box below into Linear's agent. It's written to work even if the agent can't read the repo. Add the project description from `2-linear-project-description.md` to the project afterward, or paste it in along with this prompt.

```text
Set up the organization flow in Linear for my freelance project, "LeaderFlow Website Rebuild". I'm a solo developer (Rahsaan). The client is LeaderFlow, a nonprofit; my contact is Janiece. Before you create anything, show me the full structure you'll create (team settings, statuses, labels, projects, milestones, issues) and wait for my OK. If something already exists with the same name, reuse it instead of duplicating it.

1. TEAM
Use my existing team if I have one; otherwise create a team called "LeaderFlow" (key: LF).

2. WORKFLOW STATUSES (for this team)
Backlog → Todo → In Progress → Waiting on Client → In Review → Done, plus Canceled.
"Waiting on Client" = blocked until Janiece or LeaderFlow staff act. "In Review" = waiting on my own check or a client preview round.

3. LABELS (label groups)
- Area: Security, Performance, Forms, Content, DNS & Launch, Impact Page, Client & Admin, Testing
- Owner: Rahsaan, Janiece, Together
- Phase: Phase 1, Phase 2, Later
Map priority like this: Urgent = do today; High = Must for launch; Medium = Should (by handover); Low = Later / out of scope.

4. PROJECTS
- "LeaderFlow Website: Phase 1 (Launch)": target date Tue 1 Dec 2026 (tentative; it moves if applications open earlier). Lead: me.
- "LeaderFlow Website: Phase 2 (Growth)": no dates yet; status Planned.

5. MILESTONES (Phase 1 project)
- Today & Friday call: Thu 12 – Fri 13 Nov
- Kickoff & accounts: Mon 16 – Wed 18 Nov
- Build: Mon 16 – Fri 20 Nov
- Private preview: Mon 23 Nov
- Feedback rounds: Mon 23 – Fri 27 Nov
- Testing: Fri 27 – Mon 30 Nov
- Launch: Tue 1 Dec
- After-launch & support: Tue 1 – Thu 31 Dec
- Handover: early January 2027

6. ISSUES (Phase 1). Put the estimated hours at the start of each description (e.g. "Est: 5 h"), and set milestone, labels, priority and due date.

Today & Friday call
- [Urgent] Fix repo exposure: make the demo repo private or gitignore private files. Est 0.5 h. Security, Rahsaan. Due Thu 12 Nov
- [Urgent] Confirm Friday call time with Janiece. Client & Admin, Rahsaan. Due Thu 12 Nov
- [High] Friday call with Janiece (agenda: scope, application dates, who receives applications, form tool, donate link, impact page, rollback wording, kickoff, Mailchimp). Client & Admin, Together. Due Fri 13 Nov
- [High] Draft scope-of-work document (scope, timeline, payment). Client & Admin, Rahsaan. Due Fri 13 Nov
- [High] Send final scope-of-work document. Client & Admin, Rahsaan. Due Mon 16 Nov
- [High] Receive impact report PDF + headline numbers. Impact Page, Janiece, status Waiting on Client. Due Fri 13 Nov
- [High] Own security setup: supported OS, password manager, 2 hardware keys, browser profile, GitHub cleanup, gitleaks. Est 4–6 h. Security, Rahsaan. Due Sun 15 Nov

Kickoff & accounts
- [High] Build the impact page (impact.leaderflow.org). Est 5 h. Impact Page, Rahsaan. Due Mon 16 Nov
- [High] Kickoff call + LeaderFlow account setup (Cloudflare, GitHub org, Tally, GoDaddy delegated access + domain lock). Est 5 h. Security, Together. Due Wed 18 Nov
- [High] Export the full GoDaddy DNS zone before any change. DNS & Launch, Together. Due Wed 18 Nov
- [High] Connect impact.leaderflow.org (15-min GoDaddy call). DNS & Launch, Together. Due Wed 18 Nov
- [High] Send invoice #1 (Phase 1 kickoff, $400). Client & Admin, Rahsaan. Due Wed 18 Nov

Build
- [High] Restructure repo to site/, transfer to LeaderFlow's org, Pages Git integration, preview behind Access. Est 3 h. Security
- [High] Hardening files: 404, _headers (CSP), _redirects for all old URLs, robots, sitemap, remove inline styles. Est 5 h. Security
- [High] Performance: self-hosted trimmed fonts, hero LCP fix, responsive header images, graduate photos. Est 9.5 h. Performance
- [High] Move the promo video to Vimeo. Est 0.5 h. Performance
- [High] Content: Apply button + open/closed states, single donate link, dates, © 2026. Est 4.5 h. Content
- [High] Contact + Flowcilitator forms: validation fix, honeypot, Turnstile, Function → Apps Script → Sheet + email. Est 8 h. Forms
- [High] Application form in the chosen tool + application page. Est 4 h. Forms. Blocked until the form tool is decided
- [High] Cloudflare Web Analytics. Est 0.5 h. Performance
- [High] Old-site data exports + offline archive (form entries, redirects, backup, Search Console). Est 2 h. Security, Janiece, Waiting on Client. Due Fri 20 Nov
(All Build issues: owner Rahsaan unless stated, due Fri 20 Nov.)

Private preview
- [High] Move DNS hosting to Cloudflare; compare email records line by line; test email. DNS & Launch, Together. Due Mon 23 Nov
- [High] Send private preview link to Janiece. Client & Admin, Rahsaan. Due Mon 23 Nov

Feedback rounds
- [High] Feedback round 1 / round 2 / round 3 (one issue each). Client & Admin, Together. Due Fri 27 Nov

Testing
- [High] Full testing: devices, slow networks, screen readers, PageSpeed budgets, test applications to reviewers, spam tests, 404 checks, rollback drill, enforce CSP. Est 7 h. Testing, Rahsaan. Due Mon 30 Nov

Launch
- [High] Launch: point leaderflow.org + www to Pages early morning; don't touch email records; Search Console clean-up. Est 3 h. DNS & Launch. Due Tue 1 Dec
- [High] Send invoice #2 (Phase 1 launch, $400). Client & Admin. Due Tue 1 Dec

After-launch & support
- [High] After-launch checks: site, email, Mailchimp, forms, old links, Google. DNS & Launch. Due Fri 4 Dec
- [Medium] Should items: cache-busting, minify, FAQ chips, header/footer sync script, HSTS + DNSSEC, privacy notice, sponsor wall. Est ~14 h total; make each its own issue, Low if time runs short. Due Thu 31 Dec

Handover
- [High] Handover guide + "where everything lives". Est 3 h. Client & Admin
- [Medium] Offboard my access and rotate secrets; Janiece cancels old hosting after 30 stable days. Security, Together

7. OPEN DECISIONS
Create these as issues with the label "Decision", in Phase 1 → "Today & Friday call", status Waiting on Client unless noted:
- O1 When do applications open and close? (sets the launch date; last year opened 19 Nov). Urgent
- O2 Who receives applications and contact messages?
- O3 Which donate link is current?
- O4 Application form tool: Tally (recommended) or Google Form
- O6 Effort vs price (about 75 Must hours vs the $800 Phase 1 fee). Owner Rahsaan, status Todo
- O7 Fill in or delete the unfinished "Also add the the…" line in the proposal. Owner Rahsaan, status Todo
- O8–O10 (Preview round): 501(c)(3) wording, sponsor wall, copy fixes

8. PHASE 2 PROJECT ISSUES (Backlog, no dates)
Four starting points on the homepage (3 h) · Flowcilitator summary + FAQ (3 h) · Impact numbers + testimonials (3–4 h) · "Get notified" sign-up (2 h) · Share previews site-wide (2 h) · Move the impact page to /impact/ with redirects (1.5 h) · Invoice: Phase 2 start ($200) · Invoice: Phase 2 published ($200)

9. LATER (Backlog, label Later, in the Phase 1 project)
monday.com integration (4–6 h) · Self-editing tool / CMS with 2FA logins (15–25 h) · Quarterly access review

Finally, set up a weekly project update on Fridays and a view called "This week" showing open Phase 1 issues due in the next 7 days, grouped by milestone.
```
