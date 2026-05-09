# RPCForge — GSAP Scroll Animations Implementation Prompt

You are an expert React 18 + Vite + Tailwind CSS frontend developer specializing in GSAP animations. I have a Web3 RPC gateway project called RPCForge. Add MetaMask/Linear-level scroll animations to the existing landing page.

---

## Project Context

- React 18 + Vite + Tailwind CSS
- Fonts: Inter (300,400,500,600,700) for UI, JetBrains Mono (400,500) for code
- Primary color: `#6467f2` (purple/violet), referenced as `text-primary` / `bg-primary` in Tailwind
- Background: `#09090b` (zinc-950), Card: `#18181b` (zinc-900), Border: `#27272a` (zinc-800), Muted: `#a1a1aa` (zinc-400), White: `#fafafa` (zinc-100)
- Existing utilities to REUSE (do NOT recreate): `.glass-panel`, `.custom-scrollbar`, `shadow-[0_0_30px_rgba(100,103,242,0.3)]`, `blur-[120px]`, `bg-clip-text` gradient, `group-hover:`, `transition-all duration-300`
- Files: `frontend/src/App.jsx`, `frontend/src/LandingPage.jsx`, `frontend/src/SignupPage.jsx`, `frontend/src/Dashboard.jsx`, `frontend/src/index.css`

---

## Step 1 — Install Dependencies

```bash
cd frontend && npm install gsap @gsap/react
```

---

## Step 2 — index.css Additions

Append these to the BOTTOM of `frontend/src/index.css` (do NOT remove anything existing):

```css
.gsap-hidden {
  opacity: 0;
}

.typewriter-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #6467f2;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.6s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

.pricing-card {
  transform-style: preserve-3d;
  perspective: 1000px;
}

@media (prefers-reduced-motion: reduce) {
  .gsap-hidden { opacity: 1 !important; }
}
```

---

## Step 3 — Create `frontend/src/animations/scrollAnimations.js`

Create this new file. Export a single function `initScrollAnimations()`. All animation logic lives here. This keeps LandingPage.jsx clean.

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // ─── HERO (fires on page load, no ScrollTrigger) ───────────────────────────

  // Badge: scale 0.9→1, opacity 0→1, duration 0.5s
  gsap.from(".hero-badge", { scale: 0.9, opacity: 0, duration: 0.5, ease: "power2.out" });

  // Headline words: split by wrapping each word in a span with class "hero-word"
  // y: 40→0, opacity 0→1, stagger 0.1s, ease power3.out, delay 0.2s
  gsap.from(".hero-word", { y: 40, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power3.out", delay: 0.2 });

  // Subheadline: y: 20→0, opacity 0→1, delay 0.6s
  gsap.from(".hero-sub", { y: 20, opacity: 0, duration: 0.6, ease: "power2.out", delay: 0.6 });

  // CTA buttons: y: 20→0, opacity 0→1, stagger 0.1s, delay 0.8s
  gsap.from(".hero-cta", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.8 });

  // Chain badges: scale 0→1, stagger 0.07s, ease back.out(1.7), delay 1s
  gsap.from(".chain-badge", { scale: 0, opacity: 0, duration: 0.5, stagger: 0.07, ease: "back.out(1.7)", delay: 1 });

  // Terminal/code block: x: 60→0, opacity 0→1, delay 0.5s, duration 0.8s
  gsap.from(".hero-terminal", { x: 60, opacity: 0, duration: 0.8, ease: "power2.out", delay: 0.5 });

  // Glow orbs: slow float loop
  gsap.to(".glow-orb", { y: -20, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 1 });

  // ─── STATS BAR ─────────────────────────────────────────────────────────────

  ScrollTrigger.create({
    trigger: ".stats-bar",
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.from(".stats-bar", { opacity: 0, y: 30, duration: 0.6, ease: "power2.out" });
      gsap.from(".stats-separator", { scaleX: 0, duration: 0.5, stagger: 0.3, ease: "power2.out", transformOrigin: "left center" });

      // Counter animations
      document.querySelectorAll(".stat-counter").forEach((el) => {
        const target = parseFloat(el.dataset.target);
        const isPercent = el.dataset.format === "percent";
        const isM = el.dataset.format === "million";
        const obj = { value: 0 };
        gsap.to(obj, {
          value: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            if (isPercent) el.textContent = obj.value.toFixed(1) + "%";
            else if (isM) el.textContent = (obj.value / 1000000).toFixed(1) + "M";
            else el.textContent = Math.round(obj.value).toString();
          },
        });
      });
    },
  });

  // ─── HOW IT WORKS ──────────────────────────────────────────────────────────

  gsap.from(".how-title", {
    scrollTrigger: { trigger: ".how-title", start: "top 85%", toggleActions: "play none none none", once: true },
    y: 40, opacity: 0, duration: 0.6, ease: "power2.out",
  });

  gsap.from(".how-card", {
    scrollTrigger: { trigger: ".how-cards", start: "top 85%", toggleActions: "play none none none", once: true },
    y: 60, opacity: 0, duration: 0.7, stagger: 0.2, ease: "power2.out",
  });

  gsap.from(".how-card-accent", {
    scrollTrigger: { trigger: ".how-cards", start: "top 85%", toggleActions: "play none none none", once: true },
    scaleY: 0, duration: 0.4, stagger: 0.2, ease: "power2.out", transformOrigin: "top center", delay: 0.4,
  });

  // SVG arrow draw-on
  document.querySelectorAll(".how-arrow").forEach((el) => {
    const length = el.getTotalLength ? el.getTotalLength() : 100;
    gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(el, {
      scrollTrigger: { trigger: ".how-cards", start: "top 85%", toggleActions: "play none none none", once: true },
      strokeDashoffset: 0, duration: 0.8, ease: "power2.out", delay: 0.8,
    });
  });

  // ─── FEATURES GRID ─────────────────────────────────────────────────────────

  gsap.from(".features-label", {
    scrollTrigger: { trigger: ".features-label", start: "top 85%", toggleActions: "play none none none", once: true },
    y: 30, opacity: 0, duration: 0.6, ease: "power2.out",
  });

  gsap.from(".feature-card", {
    scrollTrigger: { trigger: ".features-grid", start: "top 85%", toggleActions: "play none none none", once: true },
    y: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: "power2.out",
  });

  gsap.from(".feature-icon", {
    scrollTrigger: { trigger: ".features-grid", start: "top 85%", toggleActions: "play none none none", once: true },
    scale: 0, rotation: -10, duration: 0.5, stagger: 0.12, ease: "back.out(1.7)", delay: 0.2,
  });

  // ─── DASHBOARD PREVIEW ─────────────────────────────────────────────────────

  gsap.from(".dashboard-title", {
    scrollTrigger: { trigger: ".dashboard-title", start: "top 85%", toggleActions: "play none none none", once: true },
    x: -40, opacity: 0, duration: 0.7, ease: "power2.out",
  });

  gsap.from(".dashboard-mockup", {
    scrollTrigger: { trigger: ".dashboard-mockup", start: "top 85%", toggleActions: "play none none none", once: true },
    y: 80, scale: 0.95, opacity: 0, duration: 1, ease: "power3.out",
  });

  gsap.from(".dashboard-badge", {
    scrollTrigger: { trigger: ".dashboard-mockup", start: "top 85%", toggleActions: "play none none none", once: true },
    scale: 0, opacity: 0, duration: 0.5, stagger: 0.15, ease: "back.out(2)", delay: 0.4,
  });

  gsap.to(".dashboard-glow", {
    opacity: 0.6, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut",
  });

  // ─── PRICING ───────────────────────────────────────────────────────────────

  gsap.from(".pricing-title", {
    scrollTrigger: { trigger: ".pricing-title", start: "top 85%", toggleActions: "play none none none", once: true },
    y: 30, opacity: 0, duration: 0.6, ease: "power2.out",
  });

  gsap.from(".pricing-card", {
    scrollTrigger: { trigger: ".pricing-grid", start: "top 85%", toggleActions: "play none none none", once: true },
    rotateY: 90, opacity: 0, duration: 0.6, stagger: 0.15, ease: "power2.out", transformOrigin: "left center",
    onComplete: () => {
      // Pro card glow after flip
      const proCard = document.querySelector(".pricing-card-pro");
      if (proCard) gsap.to(proCard, { boxShadow: "0 0 30px rgba(100,103,242,0.4)", duration: 0.5 });
    },
  });

  // Pricing card hover (GSAP mouseenter/leave)
  document.querySelectorAll(".pricing-card").forEach((card) => {
    card.addEventListener("mouseenter", () => gsap.to(card, { scale: 1.03, duration: 0.2 }));
    card.addEventListener("mouseleave", () => gsap.to(card, { scale: 1, duration: 0.2 }));
  });

  // ─── TERMINAL CTA ──────────────────────────────────────────────────────────

  gsap.from(".terminal-window", {
    scrollTrigger: {
      trigger: ".terminal-window",
      start: "top 85%",
      toggleActions: "play none none none",
      once: true,
      onEnter: () => startTypewriter(),
    },
    y: 60, scale: 0.96, opacity: 0, duration: 0.7, ease: "power2.out",
  });

  gsap.to(".cta-pulse", { scale: 1.04, duration: 1.5, yoyo: true, repeat: -1, ease: "sine.inOut" });

  // ─── NAVBAR SCROLL ─────────────────────────────────────────────────────────

  ScrollTrigger.create({
    start: "top -80px",
    onEnter: () => document.querySelector(".site-navbar")?.classList.add("navbar-scrolled"),
    onLeaveBack: () => document.querySelector(".site-navbar")?.classList.remove("navbar-scrolled"),
  });
}

// ─── TYPEWRITER ──────────────────────────────────────────────────────────────

function startTypewriter() {
  const el = document.querySelector(".typewriter-output");
  if (!el) return;

  const lines = [
    { text: "$ curl https://rpcforge.app/eth/YOUR_KEY", color: "#fafafa" },
    { text: "  -d '{\"method\":\"eth_blockNumber\"}'", color: "#a1a1aa" },
    { text: "> { \"result\": \"0x112A3F4\", \"cached\": true, \"latency\": \"12ms\" }", color: "#6467f2" },
  ];

  const cursor = document.querySelector(".typewriter-cursor");
  let delay = 0;

  lines.forEach((line, lineIdx) => {
    const span = document.createElement("span");
    span.style.color = line.color;
    span.style.display = "block";
    el.appendChild(span);

    if (lineIdx > 0) delay += lineIdx === 2 ? 600 : 100;

    [...line.text].forEach((char, charIdx) => {
      const charDelay = delay + charIdx * 40;
      setTimeout(() => { span.textContent += char; }, charDelay);
    });

    delay += line.text.length * 40;
  });

  // Stop cursor blink after typewriter finishes
  setTimeout(() => { if (cursor) cursor.style.animation = "none"; }, delay + 200);
}
```

---

## Step 4 — Update `frontend/src/LandingPage.jsx`

Rewrite the full file. Rules:
- Keep ALL existing logic, routing, Tailwind classes, and design tokens
- Only ADD: GSAP class names, `useGSAP` hook, `initScrollAnimations()` call
- Do NOT change colors, fonts, or existing utilities
- Add `gsap-hidden` class to every animated element
- Split headline words into `<span className="hero-word inline-block">` spans
- Add `site-navbar` class to `<nav>`
- Add `glow-orb` class to background blur divs
- Add `hero-badge`, `hero-sub`, `hero-cta`, `chain-badge`, `hero-terminal` classes
- Add `stats-bar`, `stat-counter` with `data-target` and `data-format` attributes, `stats-separator`
- Add `how-title`, `how-cards`, `how-card`, `how-card-accent`, `how-arrow` classes
- Add `features-label`, `features-grid`, `feature-card`, `feature-icon` classes
- Add `dashboard-title`, `dashboard-mockup`, `dashboard-badge`, `dashboard-glow` classes
- Add `pricing-title`, `pricing-grid`, `pricing-card`, `pricing-card-pro` classes
- Add `terminal-window`, `typewriter-output`, `typewriter-cursor`, `cta-pulse` classes

Import and call pattern at top of component:

```jsx
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { initScrollAnimations } from "./animations/scrollAnimations";
gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  useGSAP(() => {
    initScrollAnimations();
  });
  // ... rest of component
}
```

Navbar scrolled state CSS — add to `index.css`:

```css
.navbar-scrolled {
  background: rgba(9, 9, 11, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #27272a;
}
```

---

## Step 5 — Update `frontend/src/App.jsx`

Add a `PageWrapper` component for route transitions. Wrap every `<Route element={...}>` with it.

```jsx
import React, { useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import LandingPage from "./LandingPage";
import SignupPage from "./SignupPage";
import Dashboard from "./Dashboard";

function PageWrapper({ children }) {
  const containerRef = useRef();
  useGSAP(() => {
    gsap.from(containerRef.current, { opacity: 0, y: 20, duration: 0.3, ease: "power2.out" });
  }, { scope: containerRef });
  return <div ref={containerRef}>{children}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
        <Route path="/signup" element={<PageWrapper><SignupPage /></PageWrapper>} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><LandingPage /></PageWrapper>} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## What NOT to Change

- Do NOT change any colors — use `#6467f2`, not teal/green
- Do NOT change `.glass-panel`, `.custom-scrollbar` utilities
- Do NOT change `Dashboard.jsx` or `SignupPage.jsx` internals
- Do NOT change routing structure
- Keep Inter + JetBrains Mono fonts
- Keep ALL existing Tailwind classes — only ADD animation classes

---

## Output Order

1. `frontend/src/index.css` — append new CSS only
2. `frontend/src/animations/scrollAnimations.js` — new file, full content
3. `frontend/src/LandingPage.jsx` — full rewrite with GSAP classes added
4. `frontend/src/App.jsx` — full rewrite with PageWrapper added
