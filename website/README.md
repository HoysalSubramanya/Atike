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
   ├─ bg.mp4            # all-keyframe re-encoded scroll background video
   └─ img/               # reference images used inline in sections
```

## Background video

The raw Higgsfield-generated video lives at
[`assets/videos/brand-scroll-background.mp4`](../assets/videos/brand-scroll-background.mp4)
(project root). Raw AI-generated MP4s seek poorly during scroll scrubbing, so it
was re-encoded to **all-keyframe H.264** (`-g 1 -keyint_min 1 -sc_threshold 0`)
and copied to `website/public/bg.mp4` using the helper script at
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
- Re-run `npm run build -- --base=./` after any content or asset change and
  spot-check the output with `npx serve dist`.

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
