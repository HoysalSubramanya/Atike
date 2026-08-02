import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const bgVideo = document.getElementById("bgv");
const preloader = document.getElementById("preloader");
const isTouch = window.matchMedia("(hover: none)").matches || window.innerWidth < 769;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lastVideoT = -1;

/* ---------------------------------------------------------
   Preloader
   --------------------------------------------------------- */

function initPreloader() {
  window.addEventListener("load", () => {
    setTimeout(() => preloader?.classList.add("is-hidden"), 300);
  });
}

/* ---------------------------------------------------------
   Lenis smooth scroll, wired into GSAP's ticker
   --------------------------------------------------------- */

function initLenis() {
  const lenis = new Lenis({
    lerp: prefersReducedMotion ? 1 : 0.1,
    smoothWheel: !prefersReducedMotion,
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/* ---------------------------------------------------------
   Scroll-scrubbed background video (desktop / hover devices)
   Maps whole-document scroll progress to bgVideo.currentTime.
   --------------------------------------------------------- */

function setupVideoScrub() {
  if (!bgVideo) return;

  const bindScrub = () => {
    ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (!bgVideo.duration) return;
        const t = self.progress * (bgVideo.duration - 0.05);
        if (Math.abs(t - lastVideoT) > 0.008) {
          bgVideo.currentTime = t;
          lastVideoT = t;
        }
      },
    });
  };

  if (bgVideo.readyState >= 1) {
    bindScrub();
  } else {
    bgVideo.addEventListener("loadedmetadata", bindScrub, { once: true });
  }
}

/* ---------------------------------------------------------
   Generic fade/slide reveals
   --------------------------------------------------------- */

function setupReveals() {
  if (prefersReducedMotion) {
    gsap.set(".reveal-up", { opacity: 1, y: 0 });
    return;
  }

  gsap.utils.toArray(".reveal-up").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

/* ---------------------------------------------------------
   #impact — pinned word-by-word reveal
   --------------------------------------------------------- */

function setupImpact() {
  const section = document.querySelector("#impact");
  if (!section) return;

  const pin = section.querySelector(".impact__pin");
  const words = [...section.querySelectorAll(".word")];

  function render(p) {
    words.forEach((word, i) => {
      const start = (i / words.length) * 0.72;
      const o = gsap.utils.clamp(0, 1, (p - start) / 0.12);
      word.style.opacity = 0.12 + o * 0.88;
      word.style.filter = `blur(${(1 - o) * 8}px)`;
      word.style.transform = `translateY(${(1 - o) * 18}px)`;
    });
  }

  if (prefersReducedMotion) {
    render(1);
    return;
  }

  render(0);

  ScrollTrigger.create({
    trigger: section,
    start: "top top",
    end: () => "+=" + innerHeight * 1.7,
    pin,
    scrub: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => render(self.progress),
  });
}

/* ---------------------------------------------------------
   Subtle parallax on framed media
   --------------------------------------------------------- */

function setupParallax() {
  if (isTouch || prefersReducedMotion) return;

  gsap.utils.toArray(".split-section__media, .experience__media, .craft__media").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 24 },
      {
        y: -24,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  });
}

/* ---------------------------------------------------------
   Mobile menu — hamburger toggle + full-screen overlay
   --------------------------------------------------------- */

function setupMobileMenu(lenis) {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (!toggle || !menu) return;

  const links = [...menu.querySelectorAll("a")];

  function openMenu() {
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lenis.stop();
    links[0]?.focus();
  }

  function closeMenu(returnFocus = true) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lenis.start();
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu();
    else openMenu();
  });

  links.forEach((link) => link.addEventListener("click", () => closeMenu(false)));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860 && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu(false);
    }
  });
}

function setupYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------
   Re-sync ScrollTrigger positions once lazy images finish
   loading — their size change after the initial refresh()
   would otherwise desync every pin below them on the page.
   --------------------------------------------------------- */

function setupLazyImageRefresh() {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  lazyImages.forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
  });
}

/* ---------------------------------------------------------
   Dev hooks for Claude Preview / console verification
   --------------------------------------------------------- */

function initDevHooks(lenis) {
  if (import.meta.env.DEV) {
    window.__lenis = lenis;
    window.__ST = ScrollTrigger;
    window.__bgv = bgVideo;
  }
}

function init() {
  initPreloader();
  setupYear();

  const lenis = initLenis();

  if (!isTouch && !prefersReducedMotion) {
    setupVideoScrub();
  }

  setupReveals();
  setupImpact();
  setupParallax();
  setupLazyImageRefresh();
  setupMobileMenu(lenis);

  initDevHooks(lenis);

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

init();
