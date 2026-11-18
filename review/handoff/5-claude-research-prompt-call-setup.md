# Prompt for Claude (claude.ai): research for the call setup

Paste everything in the box below into a new Claude chat with web search (or Research) turned on.

```text
I need a detailed, step-by-step guide I can follow during a video call this afternoon. Please research it thoroughly using current official documentation (GoDaddy, Cloudflare, GitHub, Mailchimp) as of November 2026, and cite the pages you used. Where a menu name or button might have changed recently, say so and describe what to look for instead.

ABOUT ME AND THE PROJECT
- I'm a freelance web developer rebuilding the website for LeaderFlow, a small nonprofit. My contact is Janiece. Their domain is leaderflow.org, registered at GoDaddy. The current WordPress site was hacked, so we're moving to a static site on Cloudflare Pages.
- I understand what needs to happen, but I have never used GoDaddy's DNS settings, Cloudflare, or Mailchimp's admin settings myself. Assume I know nothing about where things are in each tool. Explain every click, and explain any jargon (DNS, CNAME, TTL, propagation, etc.) in one plain sentence the first time it appears.
- Security rules I've promised the client: no shared passwords ever. Every account is created in LeaderFlow's name with a LeaderFlow email address, and they add me as a user with my own login. They can remove my access at any time.

WHAT I NEED TO DO ON THE CALL (three tasks)

TASK 1: Create LeaderFlow's hosting account (Cloudflare) and add me
- The person who will own LeaderFlow's accounts creates a free Cloudflare account with a LeaderFlow email address (no credit card), turns on two-step verification, and invites me as a member with the right role so I can create and deploy Pages projects. Tell me which role to ask for, with the least access I need.
- Also cover: whether they should create a GitHub organization for the website files now, and how they would add me to it. Keep this part short.
- Fallback to research: if they can't create the account today, I host the page on my own Cloudflare account for now. How would I later move a Pages project and its custom domain to their account? Can a Pages project be transferred between accounts, or do I have to recreate it? What are the steps, and does the site go down while I do it?

TASK 2: Connect impact.leaderflow.org (GoDaddy DNS + Cloudflare Pages)
- The goal is a standalone impact report page (a single static HTML page plus a PDF) at impact.leaderflow.org, hosted on Cloudflare Pages. The rest of leaderflow.org must keep working exactly as it does now, including email, so we only touch this one subdomain. The DNS stays at GoDaddy for now; it moves to Cloudflare in a later step.
- Give me the exact order of steps:
  1. Deploy the page to Cloudflare Pages. Compare Direct Upload with connecting a GitHub repo, and recommend one for a single page.
  2. Add impact.leaderflow.org as a custom domain in the Pages project. Explain why this must come before the DNS record, and what goes wrong if it doesn't.
  3. Add the CNAME record in GoDaddy: the exact Type, Name/Host, Value/Points to, and TTL values to enter, and where to find "DNS" / "Manage DNS" in GoDaddy's current dashboard.
  4. Check it worked: how long it usually takes, how to check from my own computer (including a free online DNS checker), what the HTTPS certificate status should show in Cloudflare, and what "pending" or "inactive" states mean.
- Troubleshooting: common errors and their fixes (for example 522 errors, an SSL certificate stuck on pending, an existing record named "impact", CAA records blocking the certificate, the domain not verifying).
- Warnings: list exactly what they must NOT touch in GoDaddy (MX, TXT/SPF, DKIM, DMARC, the existing A and www records, nameservers), and explain why in one line each.
- GoDaddy access without sharing passwords: explain GoDaddy's "Delegate Access" feature. How does the account owner invite me? What access levels exist? Which one do I need for DNS only? What do I see after accepting? Can they remove me later?
- While we're in GoDaddy, three extra safety steps, if they're quick: turn on two-step verification, turn on Domain Lock (transfer lock), and export or download a copy of the full DNS zone (all records) as a backup before anything changes. Tell me how to do each one and how long it takes.

TASK 3: Turn on Mailchimp's spam protection
- LeaderFlow gets fake newsletter sign-ups from bots. On the call, Janiece will turn on the protections while I guide her. Find the current steps for:
  1. Double opt-in (new subscribers must click a confirmation email): where the setting is, what it changes for real subscribers, and whether it affects people already on the list.
  2. reCAPTCHA ("verify you're human") on Mailchimp's hosted sign-up form: where it is and any limits (for example, whether it only applies to hosted forms and not embedded forms or other integrations).
  3. Anything else built in that helps (for example, how to find and clean up fake contacts already on the list), plus what to check if fake sign-ups continue after these are on.
- Note which settings depend on the Mailchimp plan (Free versus paid), and which user role is needed to change them.

WHAT I WANT BACK
1. A one-page "before the call" checklist: what I should prepare or test myself first (for example, deploy the impact page to its free pages.dev address ahead of time so the call only needs the domain step), what to send them in advance, and what they should have ready (logins, a phone for two-step codes, a LeaderFlow email inbox they can open).
2. For each task, a step-by-step guide written as a script I can read on the call. Split each step into "What I say" (plain, friendly words a non-technical person understands) and "What they click" (exact menu path). Include an estimated time for each task.
3. A short explanation I can give Janiece or the GoDaddy manager, in non-technical language, of why each step is safe: no passwords shared, email won't be affected, and they keep control and can remove my access.
4. A "how I know it worked" check and a "what to do if it fails" fallback for each task.
5. A glossary of the terms I'll hear, one line each.
6. Sources: links to the official help pages you used, with the date checked.

If anything I've described is wrong or out of date, tell me directly and explain the correct approach.
```
