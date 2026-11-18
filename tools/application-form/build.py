# Builds the step-by-step Development Program application page (application-form/apply/) and points the
# Application Form page's "Start your application" button at it.
# Usage (from the repo root): python tools/application-form/build.py site
# Questions and limits come from the live 2026 Ninja Forms application (review/plan/01-audit-live-site.md, section 4).
# Anything not captured exactly is marked TBC; edit the lists below and re-run.
import re, sys, html
SITE = sys.argv[1]
PAGE = SITE + '/leaderflow-development-program/application-form/index.html'   # info page (dates, who can apply)
APPLY = SITE + '/leaderflow-development-program/application-form/apply/index.html'  # the step-by-step application
ARROW = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
         'stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>')
OPT = ' <span class="opt">(optional)</span>'

CITIES = ['Houston', 'Los Angeles', 'Seattle', 'New York', 'Chicago']
GENDER = ['Man', 'Woman', 'Non-binary']
PRONOUNS = ['He/Him', 'She/Her', 'They/Them', 'Any']
# TBC: the live form has 6 ethnicity options; their exact wording wasn't captured. These are placeholders.
ETHNICITY = ['American Indian or Alaska Native', 'Asian', 'Black or African American', 'Hispanic or Latino',
             'Native Hawaiian or Pacific Islander', 'White']
FIRM_SIZE = ['1–50', '51–100', '101–200', '200+']
STATES = ('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH '
          'OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY').split()
QUESTIONS = [  # (field name, question, max words)
    ('q_capacity', 'What leadership capacity do you most hope to strengthen through this program, and how do you envision applying it in your work or community?', 250),
    ('q_why_now', 'Why are you applying to LeaderFlow at this stage of your career? What motivates you to grow as a leader now?', 300),
    ('q_commitment', 'How will you ensure you can meet this commitment while managing the time, energy, and accountability required by the program (including balancing work, travel, assignments, and cohort interactions)?', 200),
    ('q_vulnerability', 'How do you approach vulnerability and mutual support in group settings?', 200),
    ('q_perspective', 'What unique perspective, experience, or resource do you hope to bring to your cohort peers?', 150),
    ('q_dream', 'Dream a little: if you were equipped with essential leadership tools, a supportive network, and the ability to recognize and act on emerging opportunities, what impact would you hope to make in your career and community?', 250),
]
# TBC: the live form's exact acknowledgement wording wasn't captured; these restate its six commitments.
ACKS = [
    ('ack_attendance', 'I commit to attending every in-person session of the program.'),
    ('ack_engagement', 'I will engage fully in sessions, assignments and cohort activities.'),
    ('ack_reflections', 'LeaderFlow may use my reflections anonymously.'),
    ('ack_confidentiality', 'I will keep what is shared within my cohort confidential.'),
    ('ack_media', 'If accepted, I agree to be photographed and filmed at program events.'),
    ('ack_accuracy', 'The information in this application is accurate.'),
]


def field(id_, label, inp, full=False):
    return f'<div class="field{" field--full" if full else ""}"><label for="{id_}">{label}</label>{inp}</div>'


def text(id_, name, label, typ='text', auto='', req=True, full=False, maxlen=200, extra=''):
    a = f' autocomplete="{auto}"' if auto else ''
    r = ' required' if req else ''
    return field(id_, label + ('' if req else OPT),
                 f'<input id="{id_}" name="{name}" type="{typ}"{a} maxlength="{maxlen}"{r}{extra}>', full)


def choices(name, legend, opts, req=True, cls='', hint=''):
    h = f'<p class="field__hint">{hint}</p>' if hint else ''
    items = ''.join(
        f'<label class="check check--radio"><input type="radio" name="{name}" value="{html.escape(o)}"'
        f'{" required" if req else ""}><span>{html.escape(o)}</span></label>' for o in opts)
    return (f'<fieldset class="field field--full choices-field"><legend class="field__label">{legend}{"" if req else OPT}</legend>{h}'
            f'<div class="choices {cls}" id="{name}-group" data-group="{name}">{items}</div></fieldset>')


def select(id_, name, label, opts, auto=''):
    a = f' autocomplete="{auto}"' if auto else ''
    o = '<option value="">Choose…</option>' + ''.join(f'<option>{html.escape(x)}</option>' for x in opts)
    return field(id_, label, f'<select id="{id_}" name="{name}"{a} required>{o}</select>')


BACK = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
        'stroke-linejoin="round" aria-hidden="true"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>')  # Lucide "arrow-left"


def step_nav(prev, nxt, next_label):
    b = f'<a class="btn btn--outline btn--back" href="#{prev[0]}" data-back>{BACK}Back</a>' if prev else '<span></span>'
    n = f'<a class="btn btn--submit" href="#{nxt[0]}" data-next>{next_label}{ARROW}</a>' if nxt else ''
    return f'<div class="apply-step__nav">{b}{n}</div>'


def step(n, id_, title, intro, body, prev, nxt):
    i = f'<p class="apply-step__intro">{intro}</p>' if intro else ''
    label = 'Review your application' if nxt and nxt[0] == 'step-review' else f'Next: {nxt[1]}'
    return (f'<fieldset class="apply-step" id="{id_}" data-step tabindex="-1"><legend class="apply-step__title">'
            f'<span class="apply-step__num" aria-hidden="true">{n}</span>{title}</legend>{i}'
            f'<div class="form form--2col">{body}</div>{step_nav(prev, nxt, label)}</fieldset>\n        ')


UPLOAD_ICON = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" '
               'stroke-linejoin="round"><path d="M12 13v8"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>'
               '<path d="m8 17 4-4 4 4"/></svg>')  # Lucide "cloud-upload"

steps = [
    ('step-you', 'About you', '', ''.join([
        text('ap-name', 'full_name', 'Full name', auto='name', full=True),
        text('ap-email', 'email', 'Email', 'email', 'email', maxlen=254),
        text('ap-phone', 'phone', 'Phone', 'tel', 'tel', maxlen=40),
        choices('pronouns', 'Preferred pronouns', PRONOUNS, req=False, cls='choices--row'),
        choices('gender', 'Gender', GENDER, req=False, cls='choices--row'),
        choices('ethnicity', 'Ethnicity', ETHNICITY, req=False, cls='choices--2col'),
    ])),
    ('step-city', 'Program city',
     'Choose the city where you would attend every session. <a href="../../">Session dates for each city</a> are on the program page.',
     choices('program_city', 'Which city are you applying for?', CITIES, cls='choices--cards')),
    ('step-address', 'Mailing address', '', ''.join([
        text('ap-street', 'street', 'Street address', auto='street-address', full=True),
        text('ap-city', 'address_city', 'City', auto='address-level2', maxlen=100),
        '<div class="field-pair">' + select('ap-state', 'state', 'State', STATES, auto='address-level1') +
        text('ap-zip', 'zip', 'ZIP code', auto='postal-code', maxlen=10, extra=' inputmode="numeric" data-zip') + '</div>',
    ])),
    ('step-work', 'Your work', '', ''.join([
        text('ap-firm', 'firm', 'Current firm or organization', auto='organization'),
        text('ap-role', 'role', 'Current role or title', auto='organization-title'),
        choices('firm_size', 'Approximate firm size', [s + ' employees' for s in FIRM_SIZE], cls='choices--row'),
        text('ap-years', 'years_experience', 'Years of relevant experience in the AEC industry', 'text', maxlen=2,
             extra=' inputmode="numeric" data-whole-number'),
        text('ap-linkedin', 'linkedin', 'LinkedIn profile or professional website', 'url', 'url', req=False, maxlen=300,
             extra=' placeholder="https://"'),
    ])),
    ('step-questions', 'Your answers',
     'Six short questions. You may want to draft your answers first. Everything you type is saved on this device until you submit.',
     ''.join(
         f'<div class="field field--full"><label for="ap-{n}"><span class="q-num">{i + 1}.</span> {html.escape(q)}</label>'
         f'<textarea id="ap-{n}" name="{n}" rows="6" maxlength="{w * 12}" data-max-words="{w}" required></textarea>'
         f'<p class="field__count" id="ap-{n}-count" aria-hidden="true">Up to {w} words</p></div>'
         for i, (n, q, w) in enumerate(QUESTIONS))),
    ('step-resume', 'Résumé', '',
     '<div class="field field--full"><label for="ap-resume">Résumé or CV <span class="opt">(PDF, up to 5 MB)</span></label>'
     f'<div class="upload" data-upload><span class="upload__icon" aria-hidden="true">{UPLOAD_ICON}</span>'
     '<span class="upload__text" data-upload-text><strong>Choose a PDF</strong> or drop it here</span>'
     '<input id="ap-resume" name="resume" type="file" accept="application/pdf,.pdf" required data-max-mb="5"></div></div>'),
    ('step-ack', 'Commitments', 'Please read and confirm each of the following.',
     '<fieldset class="field field--full"><legend class="visually-hidden">Commitments</legend><div class="choices">' + ''.join(
         f'<label class="check"><input type="checkbox" name="{n}" value="yes" required><span>{html.escape(t)}</span></label>'
         for n, t in ACKS) + '</div></fieldset>'),
]

REVIEW = ('step-review', 'Review and submit')
ALL = steps + [(REVIEW[0], REVIEW[1], '', '')]
body = ''.join(step(i + 1, *s, ALL[i - 1] if i else None, ALL[i + 1]) for i, s in enumerate(steps))
review = (f'<div class="apply-step apply-review" id="{REVIEW[0]}" data-step data-review tabindex="-1" role="group" aria-labelledby="review-title">'
          f'<h2 class="apply-step__title" id="review-title"><span class="apply-step__num" aria-hidden="true">{len(steps) + 1}</span>{REVIEW[1]}</h2>'
          '<p class="apply-step__intro">Check your answers before you submit. You can go back to any section to change something.</p>'
          '<div class="review" data-review-list></div>'
          '<div class="form__hp" aria-hidden="true"><label for="ap-website">Leave this field empty</label><input id="ap-website" name="website" type="text" tabindex="-1" autocomplete="off" maxlength="100"></div>'
          '<div class="form__turnstile" data-turnstile-slot></div>'
          f'<div class="apply-step__nav"><a class="btn btn--outline btn--back" href="#{steps[-1][0]}" data-back>{BACK}Back</a>'
          f'<button class="btn btn--submit" type="submit">Submit application{ARROW}</button></div>'
          '<p class="form__status" role="status" aria-live="polite"></p></div>')
nav = ''.join(f'<li><a href="#{s[0]}" data-step-link><span class="apply-nav__num" aria-hidden="true">{i + 1}</span>'
              f'<span class="apply-nav__label">{s[1]}</span></a></li>' for i, s in enumerate(ALL))

WIZARD = f'''<!-- APPLICATION FORM (built by tools/application-form/build.py; edit the lists there and re-run).
     PLACEHOLDER until LeaderFlow confirms the questions: fields, questions and word limits match the live 2026
     application; the ethnicity options and the commitment wording are TBC. Not connected yet: data-endpoint is empty,
     so submitting shows a demo message. One section shows at a time (site.js, data-wizard); without JavaScript every
     section shows on one page and the form still works. -->
<section class="section section--paper apply apps-open" id="apply" aria-labelledby="apply-title">
  <div class="container apply__inner">
    <aside class="apply-nav">
      <h2 class="apply-nav__title" id="apply-title">Your application</h2>
      <p class="apply-nav__progress" data-wizard-progress></p>
      <div class="apply-bar" aria-hidden="true"><span data-wizard-bar></span></div>
      <nav aria-label="Application sections"><ol>{nav}</ol></nav>
      <p class="apply-nav__save" data-draft-note hidden><span data-draft-text>Your answers are saved on this device (all except your résumé).</span> <button type="button" class="link-btn" data-draft-clear>Clear the form</button></p>
    </aside>
    <form class="apply-form" action="/api/application" method="post" enctype="multipart/form-data" data-endpoint="" data-form="application" data-wizard data-autosave="lf-application-draft" data-success="Thank you, your application has been submitted. We will be in touch by email.">
        {body}{review}
    </form>
  </div>
</section>
'''

# ---- the application page (its own page: site/leaderflow-development-program/application-form/apply/) ----
info = open(PAGE, encoding='utf-8').read()
# The info page no longer holds the form: drop it if an earlier version put it there, and point the button at the new page.
info = re.sub(r'<!-- APPLICATION FORM \(built by.*?</section>\n\n?', '', info, count=1, flags=re.S)
info = re.sub(r'<a class="btn btn--gold btn--arrow" href="(#apply|#APPLICATION-FORM-URL-TBC)">Start your application</a>\n\s*<p>.*?</p>',
              '<a class="btn btn--gold btn--arrow" href="apply/">Start your application</a>\n'
              '        <p>The application is in eight short steps. Your answers are saved on this device as you go, so you can come back and finish later.</p>',
              info, count=1, flags=re.S)
open(PAGE, 'w', encoding='utf-8', newline='').write(info)

head, rest = info.split('<main id="main">', 1)
footer = rest.split('</main>', 1)[1]
deeper = lambda t: re.sub(r'(?<=[" ,])\.\./\.\./', '../../../', t)
head = deeper(head)
head = re.sub(r'<title>.*?</title>', '<title>Apply – LeaderFlow</title>', head)
head = re.sub(r'<meta name="description" content=".*?">', '<meta name="description" content="Apply to the LeaderFlow Development Program.">', head)
head = head.replace('leaderflow-development-program/application-form/">', 'leaderflow-development-program/application-form/apply/">', 1)
closed = re.search(r'    <div class="callout apps-closed" role="note">.*?\n    </div>\n', info, flags=re.S).group(0)
closed = deeper(closed.replace('href="https://eepurl', 'href="https://eepurl'))
hero = re.search(r'<section class="page-hero bp">.*?</section>\n', info, flags=re.S).group(0)
hero = deeper(hero)
hero = hero.replace('<section class="page-hero bp">', '<section class="page-hero page-hero--slim bp">')
hero = re.sub(r'<nav aria-label="Breadcrumb">.*?</nav>',
              '<nav aria-label="Breadcrumb"><ol class="breadcrumb"><li><a href="../../">Development Program</a></li>'
              '<li><a href="../">Application Form</a></li><li aria-current="page">Apply</li></ol></nav>', hero, flags=re.S)
hero = re.sub(r'<h1>.*?</h1>', '<h1>Apply</h1>', hero)
page = (head + '<main id="main">\n' + hero + '\n<section class="section apps-closed">\n  <div class="container container--narrow">\n'
        + closed + '    <p class="mt-lg"><a href="../">Back to the application information</a></p>\n  </div>\n</section>\n\n'
        + WIZARD + '</main>' + deeper(footer))
import os
os.makedirs(os.path.dirname(APPLY), exist_ok=True)
open(APPLY, 'w', encoding='utf-8', newline='').write(page)
print('ok', os.path.relpath(APPLY, SITE), len(page) // 1024, 'KB')
