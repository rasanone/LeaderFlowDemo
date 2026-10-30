# LeaderFlow — redesigned static site (demo)

A redesign of [leaderflow.org](https://leaderflow.org) as a plain HTML/CSS/JS site. Every word of visible copy is taken verbatim from the live site; the About and FAQ text was recovered from the Internet Archive because those pages on the live site currently serve spam (see `review/`).

- **Site:** `index.html` and one folder per page, mirroring the live URLs
- **Design review:** `review/index.html` — findings, before/after screenshots, next steps

## Structure

```
index.html
about-us/
become-a-sponsor/
connect-with-us/
flowcilitators/become-a-flowcilitator/
flowcilitators/meet-the-flowcilitators/
leaderflow-development-program/            (+ application-form, application-process,
                                               leaderflow-graduates, participantfaqs)
review/                                    design review page + screenshots
assets/css/site.css                        all styles (tokens at the top)
assets/js/site.js                          nav, dropdowns, video facade, tabs, forms, reveal
assets/img/                                optimized WebP images (brand, photo, logo, people, grads)
```

All links are relative, so the site works from a domain root or a GitHub Pages project path (`username.github.io/leaderflow/`). There is no build step.

## Run locally

Any static server works, for example:

```sh
npx serve .
# or
python -m http.server 8000
```

## Publish on GitHub Pages

1. Push this folder to a GitHub repository.
2. **Settings → Pages → Build and deployment:** Source = *Deploy from a branch*, Branch = `main`, folder = `/ (root)`.
3. The site appears at `https://<username>.github.io/<repo>/` and the review at `…/review/`.

## Forms

GitHub Pages can't process form submissions. The Contact form (home and Connect page) and the Become a Flowcilitator form keep every original field and label, and post to whatever URL is in their `data-endpoint` attribute:

```html
<form class="form" data-endpoint="" method="post">
```

Leave it empty and the form shows a "demo" message. To make it live, create a form at a service such as Formspree, Basin or Getform and paste its endpoint URL into `data-endpoint` (the script sends `FormData` and expects a 2xx response). Search for `data-endpoint` to find all three forms.

Donate, Subscribe and social links point to the same external URLs as the live site (Givebutter, Mailchimp, LinkedIn, Instagram).

## Notes

- Videos load only when clicked: the Vimeo impact video, and the promo MP4 still hosted on leaderflow.org.
- Fonts: Merriweather + Montserrat from Google Fonts.
- Copy issues in the original text were intentionally left unchanged; they're listed on the review page.
