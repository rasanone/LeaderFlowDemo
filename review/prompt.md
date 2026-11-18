# LeaderFlow Website Rebuild: Multi-Agent Workflow

## Context

I was recently contracted to build a new website for **LeaderFlow** (leaderflow.org).

- Their current site was built on a Wix-style website builder. Some of its pages have been **compromised (hacked)**, and the site is generally in poor shape.
- About a week ago I sent the team a demo of the redesign, and they really liked it. **The demo is the current project in this repository.**
- They have a **deadline in December** and need the site ready by then.
- My main point of contact is **Janiece**. Her latest email and my proposal are in Appendix A and Appendix B. Every agent should use them as the source of truth for scope, timeline, and payment terms.

### Priorities (in order)

1. **Security.** Equal to or more important than site efficiency. My security practices have been bad in the past. On another site I was building, that led to the site being hacked and the organization's AWS account being compromised. That cannot happen again.
2. **Efficiency and performance (extremely important).** All content must load blazingly fast, using proven techniques.

The project itself is simple, so every plan should be clear and easy to follow, but thorough.

### Current tech stack

- Plain **HTML, JavaScript, and CSS**. I prefer this because the site is very basic and it keeps things lightweight.
- The team may later want **API integrations, such as monday.com**.

---

## The agents

|Agent|Role|
|---|---|
|**Project Manager**|Audits the existing site and the demo site in full, then writes the project plan.|
|**Cybersecurity Developer**|Writes a security design brief for the Project Manager.|
|**Senior Web Dev Expert**|Writes a design plan for refining the site further in UI/UX and efficiency, based on the current project structure.|
|**Full-Stack Senior Web Dev**|Refines the existing demo based on the approved project plan.|

---

## Phase 1: Audits, security brief, and design plan

The three agents below work **at the same time**.

### Project Manager: full audits

1. **Audit the existing site (leaderflow.org) in full.** Cover every page, the content, current page links (which must keep working on the new site), forms, the compromised pages, and anything else that needs to carry over or be fixed. Treat the compromised pages as hostile: inspect them safely and don't run scripts from them.
2. **Audit the demo site (this repository) in full.** Compare it against the existing site and against everything promised in my proposal. List what's done, what's missing, and what needs work.

### Cybersecurity Developer: security design brief for the Project Manager

Write a design brief the Project Manager will build into the project plan. It should tell me exactly what to do to keep this site, LeaderFlow's accounts, and my own setup secure, so the security steps are part of the plan from the start rather than added at the end.

### Senior Web Dev Expert: UI/UX and efficiency design plan

Based on the current project structure, write a design plan for refining the site even more in terms of **UI/UX and efficiency**. Include:

- The **carousel on the main page**, for efficiency and user experience.
- A recommendation on whether to **stay with HTML/JS/CSS or move to React**, given that the team may want integrations like monday.com later. Give the reasoning.
- An evaluation of **Cloudflare Pages** for hosting and **Cloudflare Functions** for server-side needs such as the forms. Coordinate with the Cybersecurity Developer on the security side of this.

### Project Manager: the project plan

Once the audits, the security brief, and the design plan are done, the Project Manager combines them into **one project plan**. It must:

- State exactly what needs to be done, and when, to meet the December deadline.
- Include the action items from Janiece's email (Appendix A): the simple proposal / scope of work document for her accounting records, the Friday afternoon call, and the timing of the impact report PDF.
- Flag the unfinished line in my proposal's Phase 1 timeline, "Also add the the…", so I can fill it in. Don't guess what it was meant to say.

---

## Phase 2: My review (STOP HERE)

**Stop after the project plan is written and wait for me.** I will review the project plan and approve it or request changes. Don't start Phase 3 until I approve.

---

## Phase 3: Refine the demo

After I approve the plan, the **Full-Stack Senior Web Dev** refines the existing demo based on what the Project Manager identified in the approved project plan. This includes the security brief and the UI/UX and efficiency design plan, as included in that plan.

---

## Appendix A: Janiece's confirmation email

> Rahsaan,
> 
> This is super helpful! Thanks so much for laying this out so clearly!
> 
> I'm happy to move forward with what you've proposed, and I also really appreciate your offer to create the impact report page at no additional cost. We are finalizing the last round of edits as I type, and I'm hoping we'll put our "pens down" by Friday...but I'll follow up to confirm when we can get the official PDF over to you (either Friday or sometime this weekend).
> 
> The next thing I'll need from you is to put this into a simple proposal or scope of work document for our accounting records. It doesn't need to be anything elaborate, just something that captures the scope, timeline, and payment terms we've discussed.
> 
> In the meantime, how does Friday afternoon look for you to walk through the details/questions you've included here and get things started?
> 
> Thanks again

**Action items from this email to include in the plan:**

- She accepted the proposal, including the free impact report page.
- The final impact report PDF is expected Friday or over the weekend. She'll confirm.
- **I owe her a simple proposal / scope of work document** (scope, timeline, payment terms) for their accounting records.
- **She proposed a Friday afternoon call** to walk through the details and questions and get started.

---

## Appendix B: My proposal (as sent to Janiece)

> Hi Janiece,
> 
> Thanks again for thinking of me for this. I'd love to help LeaderFlow with this project. I realized my last message was vague, so I've put together a detailed plan that covers everything. None of this is set in stone, so let me know if anything should change.
> 
> The main goal of the first phase is getting LeaderFlow a fast, secure, easy-to-use website, live at least a week before applications open. Given the timeline and scope, the total for a nonprofit like LeaderFlow is $1,200.
> 
> I agree the best approach is to split the work into two phases, as you suggested. Phase 1 is everything you need for the application launch. Phase 2 adds the growth pieces once applications are underway.
> 
> ## The impact report
> 
> For the report, my suggestion is a simple standalone page at **impact.leaderflow.org**. I can do this at no extra cost.
> 
> It would have:
> 
> - A short introduction
> - Three or four headline numbers from the report
> - A clear "Download the report" button
> - A link to donate
> 
> The page is separate from the current site, so it won't be affected by the hacked pages. When the new site launches, it becomes the site's Impact page and the link you've shared keeps working.
> 
> **What I'll need:** the final PDF and the headline numbers by Friday, November 13, and a 15-minute call with whoever manages your GoDaddy account to connect the page.
> 
> If that's too tight of a window, you can easily upload the PDF to Google Drive and share that link in your announcement. I'll move it onto the new page afterward.
> 
> ## Phase 1
> 
> This is everything you need so applicants have a smooth experience when applications open.
> 
> - **A clean, fast new site with built-in spam protection.** It moves to more secure hosting so the hacking can't return, loads quickly on phones, works with screen readers, and keeps all your current page links working.
> - **New application, contact, and Flowcilitator forms.** Applications go into a spreadsheet LeaderFlow owns or arrive as a neatly formatted email, and your team can edit the questions without me.
> - **Up-to-date information with fewer fake newsletter sign-ups.** Application dates, FAQ, and donate links all match, there's a clear "Apply" button on the homepage, and Mailchimp's built-in protections are turned on.
> - **Visitor statistics** so you can see how many people visit and which pages they use, without tracking anyone personally.
> 
> ## Phase 2: helping LeaderFlow grow
> 
> Once applications are rolling, this is geared towards bringing in more applicants, volunteers, and supporters.
> 
> - **Four clear starting points on the homepage:** apply, lead a session, become a sponsor, donate.
> - **A short summary and FAQ for prospective Flowcilitators.**
> - **Impact numbers and testimonials** placed where people make decisions.
> - **A "get notified" sign-up** so people can hear when applications reopen.
> - **Better previews when the site is shared** on LinkedIn and other platforms.
> 
> Any new content I write will come to you as a draft first, so it always sounds like LeaderFlow.
> 
> ## Timeline
> 
> My goal is to have the new site live at least a week before applications open, so I can test the application before any real applicant sees it. Once I know when applications officially open this year, we can lock in a specific launch day.
> 
> ### Phase 1
> 
> - **Week of Nov 16 (or earlier):** Kickoff call (30 min) to set up accounts in LeaderFlow's name
> - **About one week after kickoff:** A private preview link will be sent to you
> - **Following few days:** 2–3 rounds of changes
> - **Before launch:** Testing all forms and pages on different devices and network types, and sending test applications to your team
> - **Launch day:** The new site goes live early in the day, when traffic is lowest, to ensure a smooth transition
> - **Through Dec 31:** Final testing and fixes
> - **Early January:** Website is complete. You will receive all website files and a short how-to guide
> 
> The old site will be saved as a backup, so if anything goes sideways on launch day (or after), we can switch back within minutes.
> 
> ### Phase 2
> 
> Phase 2 will take about 3–4 weeks. This will be built in a private environment and won't need to touch the live site while applications are open.
> 
> 1. Week 1: Gather testimonials, impact numbers, and Flowcilitator details.
> 2. Week 2: Draft new wording for your approval.
> 3. Week 3: Two rounds of feedback and changes.
> 4. Week 4: Test, publish, then 30 days of support.
> 
> ## Cost
> 
> I believe in LeaderFlow's mission and love supporting nonprofits. Phasing the work doesn't change the total, and the redesign you've already seen is included.
> 
> - **Phase 1 (ready for applications):** $800
> - **Phase 2 (growth improvements):** $400
> - **Impact report page:** Included
> - **Total:** $1,200
> 
> **Payment:** each phase is billed half at the start and half when it's finished.
> 
> - Phase 1: $400 at kickoff, $400 at launch
> - Phase 2: $200 at the start, $200 when it's published
> 
> **After the project:** updates like new application dates, a new graduating class, or sponsor logos are billed at my nonprofit rate of $35 per hour.
> 
> **Running costs:** the new hosting is free for a site this size. Once the site is stable, you can likely cancel your current hosting plan and its add-ons.
> 
> ## Clarifying questions
> 
> ### Is the Mailchimp spam related to the hacked pages?
> 
> The hacked pages came from someone breaking into the website. The fake sign-ups come from automated programs that find sign-up forms and fill them in.
> 
> The new site fixes the website side, and I can eliminate most fake sign-ups by implementing:
> 
> - A confirmation email new subscribers must click, so fake addresses never join your list
> - A "verify you're human" check on the sign-up form
> 
> If those are already on, I'll investigate further to determine how the fake sign-ups are getting through.
> 
> ### How will the site stay protected, and what does maintenance involve?
> 
> The move itself is the biggest security upgrade. The new site has no login page and no add-ons for hackers to break into. It's just finished pages, so there is very little to attack. The hosting automatically blocks suspicious traffic.
> 
> There are no monthly security updates to install. Ongoing work is mostly content: new application dates, a new graduating class, new sponsor logos. Later on, I could add a simple editing tool so your team can make these changes yourselves. With that tool, everyone who manages the site would get their own login with two-step verification instead of a shared password.
> 
> ### Will LeaderFlow keep full ownership and access?
> 
> Yes, LeaderFlow owns everything.
> 
> - **Hosting:** the account is set up in LeaderFlow's name with a LeaderFlow email address. You add me as a user and can remove my access at any time.
> - **Website files:** stored in an account LeaderFlow owns, and you'll also receive a full copy.
> - **Domain:** leaderflow.org stays registered in your GoDaddy account.
> - **Other tools:** Mailchimp, Givebutter, your email and your other services stay exactly as they are.
> - **No shared passwords:** I'll never ask you to send me one.
> 
> At the end, you'll get a short guide explaining where everything lives and how to make simple changes.
> 
> ## Next steps
> 
> Let me know what you think of the plan. Does the scope and timing work for you, and is there anything you'd like to add or change? It would also help to know when applications officially open, who should receive them, and which donate link is current.
> 
> If it's easier to talk it through, I'm happy to hop on a call this week. Thanks again for the opportunity! I'm excited to get LeaderFlow's site where it should be.
> 
> Best,
> 
> Rahsaan