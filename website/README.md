# Atike Pvt Ltd — Brand Landing Page

A single-page, scroll-driven cinematic landing page for **Atike Pvt Ltd** and its
two brands, **Putani** (flagship kidswear retail) and **Sharvari** (premium
children's clothing label). Built with the [`BRAND-landing`](../.claude/skills/BRAND-landing/SKILL.md)
project skill conventions, sourced entirely from [`copy/brand-kit.md`](../copy/brand-kit.md).

The cinematic background video is fixed behind the page and scrubs frame-by-frame
as the visitor scrolls — it does not autoplay like a normal video.

## Stack

- [Vite](https://vitejs.dev/) — dev server & build
- Vanilla JavaScript (ES modules)
- [GSAP](https://gsap.com/) + `ScrollTrigger` — pinned reveals, scroll-scrubbed video
- [Lenis](https://lenis.darkroom.engineering/) — smooth scrolling
- Plain CSS with brand tokens as custom properties (no framework)

## Setup

```bash
cd website
npm install
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Build

```bash
npm run build -- --base=./
```

Output is written to `website/dist/`. The `--base=./` flag makes the build
portable so it can be opened from any subfolder or static host, not just the
domain root.

## Preview the production build

Always preview over HTTP — the video and ES modules will not work correctly
opened directly as a `file://` path.

```bash
npx serve dist
```

or

```bash
npm run preview
```

## Project structure

```txt
website/
├─ index.html          # all page markup + Google Fonts link
├─ package.json
├─ src/
│  ├─ main.js           # Lenis, ScrollTrigger, video scrub, section motion
│  ├─ style.css         # brand tokens, layout, sections, layer architecture
│  └─ glass.css         # glass panels, buttons, cards (loads after style.css)
└─ public/
   ├─ bg.mp4            # frequent-keyframe re-encoded scroll background video
   └─ img/               # reference images used inline in sections
```

## Background video

The raw Higgsfield-generated video lives at
[`assets/videos/brand-scroll-background.mp4`](../assets/videos/brand-scroll-background.mp4)
(project root). Raw AI-generated MP4s seek poorly during scroll scrubbing, so it
was re-encoded with a **short, fixed keyframe interval** (`-g 8 -keyint_min 8
-sc_threshold 0` — a keyframe every 8 frames, roughly every ⅓ second) and
copied to `website/public/bg.mp4` using the helper script at
[`scripts/swap-bg-video.sh`](../scripts/swap-bg-video.sh) (project root):

```bash
# from the project root, not website/
scripts/swap-bg-video.sh "assets/videos/brand-scroll-background.mp4"
```

Re-run this any time the source video changes. `ffmpeg` must be on your `PATH`
(installed via `winget install Gyan.FFmpeg` on Windows, or your package manager
of choice elsewhere).

## Verifying scroll scrub in the browser console

```js
window.__bgv.readyState   // should be 4 once the video is ready
window.__bgv.duration     // total seconds of the background video
window.__ST.refresh()     // force ScrollTrigger to recalculate section positions
```

`window.__lenis`, `window.__ST`, and `window.__bgv` are only exposed in dev mode
(`npm run dev`), not in the production build.

## Mobile behavior

On touch devices / viewports under 769px, the fixed background video is hidden
and replaced with a static poster image (`.mobile-poster`, using the hero
reference image) to keep the experience light. Pinned sections and reveals still
run, but the video-scrub ScrollTrigger is skipped entirely on touch devices.

## Before going live

- **WhatsApp**: the CTA buttons and footer link to the Atike/Putani WhatsApp
  group (`https://chat.whatsapp.com/LszkuzwGuI5IoobzXmngid`). Update both
  occurrences in `index.html` if the group link ever changes.
- **Store address**: the footer currently lists "Hunsur, Karnataka" per the
  brand kit's target audience section — add a full street address if you want
  one displayed.
- **Domain placeholder**: `index.html` has five occurrences of
  `https://REPLACE_WITH_DOMAIN.example` (canonical URL, Open Graph `og:url` /
  `og:image`, Twitter `twitter:image`, and the JSON-LD `image` field) — replace
  all five with the real production domain once one exists. Until then, social
  link previews (WhatsApp, etc.) and the canonical tag will point at a
  non-existent placeholder domain rather than break silently.
- Re-run `npm run build -- --base=./` after any content or asset change and
  spot-check the output with `npx serve dist`.

## SEO &amp; sharing

- **Favicon**: `public/favicon.png` (32×32) and `public/apple-touch-icon.png`
  (180×180) are generated from the Atike icon mark (`assets/logos/atike-logo-transparent.png`,
  the icon alone with no wordmark — legible at small sizes, unlike the full
  lockup). Regenerate both if the logo changes.
- **Social preview image**: `public/og-image.jpg` (1200×630) is cropped from
  the hero reference photo. Used for Open Graph and Twitter Card previews —
  regenerate if you want a different image shared when links are posted.
- **Structured data**: a `ClothingStore` JSON-LD block sits in `index.html`'s
  `&lt;head&gt;`, built only from confirmed facts (name, description, brands,
  Hunsur/Karnataka locality, email, WhatsApp link) — no street address, phone,
  or opening hours are included since none were confirmed. Add them once
  available; don't fabricate placeholder values for structured data, since
  inaccurate business data in schema.org markup can affect search trust.

## Security headers

Since the hosting platform wasn't decided yet, config for the three most
likely static hosts is included and ready to go:

- **Netlify**: `netlify.toml` (build config) + `public/_headers` (copied to
  `dist/_headers` on build — Netlify reads this automatically).
- **Cloudflare Pages**: also reads `dist/_headers` — no extra config needed.
- **Vercel**: `vercel.json` at the `website/` root, with the same headers
  defined in its own `headers` block (Vercel doesn't read `_headers` files).
- **GitHub Pages**: cannot serve custom HTTP headers at all — it's static
  file hosting with no per-response header control. If you deploy there,
  the CSP and other security headers below simply won't apply unless you
  put a CDN (e.g. Cloudflare) in front of it.

All three configs set the same policy:

- A `Content-Security-Policy` scoped to what this site actually loads —
  same-origin scripts/media/images, Google Fonts for `style-src`/`font-src`,
  and one specific SHA-256 hash allowlisting the inline JSON-LD structured
  data script (not a blanket `'unsafe-inline'` for scripts). `style-src`
  does need `'unsafe-inline'`, because GSAP animates by writing directly to
  element `style` attributes — there's no practical way around this for a
  GSAP-driven site, and inline *styles* are a much narrower attack surface
  than inline *scripts*.
- `X-Frame-Options: DENY` and `frame-ancestors 'none'` (clickjacking
  protection — meta-tag CSP can't express `frame-ancestors` at all, which is
  part of why this needs real HTTP headers, not just a `&lt;meta&gt;` tag).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  and a `Permissions-Policy` disabling camera/microphone/geolocation/payment/USB,
  none of which this site uses.

This exact policy was tested locally (temporarily, via a meta tag + a
`securitypolicyviolation` listener, both removed afterward) against a full
scroll cycle, every GSAP-driven animation, the mobile menu, and the JSON-LD
block — zero violations. If you ever add a new external resource (an
analytics script, a different font host, etc.), you'll need to add it to the
policy in **both** `public/_headers` and `vercel.json`, or that resource will
be silently blocked in production.

## Brand tokens

All colors and fonts are defined as CSS custom properties in `src/style.css`,
sourced directly from `copy/brand-kit.md` §6–7:

| Token | Value | Source |
|---|---|---|
| `--blue` | `#2563eb` | Primary — trust, reliability |
| `--yellow` | `#fbbf24` | Warm accent — energy, cheerfulness |
| `--coral` | `#f97316` | Accent — warmth, festivity |
| `--font-head` | Baloo 2 | Friendly, rounded heading font |
| `--font` | Poppins | Clean, legible body font |
| `--font-kn` | Noto Sans Kannada | Reserved for bilingual copy |

Do not hardcode new colors or fonts outside these tokens — update the brand kit
first, then propagate the change into `:root` in `src/style.css`.
