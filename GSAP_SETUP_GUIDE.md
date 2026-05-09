# RPCForge Landing Page - GSAP Animations Setup Guide

## 🚀 Quick Setup Commands

### Step 1: Install GSAP Dependencies
```bash
cd frontend
npm install gsap @gsap/react
```

### Step 2: Verify File Structure
Ensure these files exist in your project:
```
frontend/
├── src/
│   ├── LandingPage.jsx          (✅ Updated with animations)
│   ├── index.css                (✅ Updated with animation utilities)
│   ├── animations/
│   │   └── scrollAnimations.js  (✅ New file - all animation logic)
│   ├── App.jsx
│   ├── Dashboard.jsx
│   └── SignupPage.jsx
```

### Step 3: Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` and scroll to see animations in action!

---

## 📋 What's Included

### ✨ Animations Implemented

#### Hero Section
- **Badge**: Scale & fade-in on page load (0.5s)
- **Headline**: Word-by-word animation with stagger (0.7s each)
- **Subheadline**: Fade-in with slide-up (0.6s)
- **CTA Buttons**: Staggered slide-up (0.5s each)
- **Chain Badges**: Pop-in with spring effect (0.5s each)
- **Code Terminal**: Slide-in from right (0.8s)
- **Glow Orbs**: Continuous float animation (4s loop)

#### Stats Bar
- **Bar Container**: Fade-in with slide-up (0.6s)
- **Counters**: Animated number counting (2s each)
- **Separators**: Scale-in from left (0.5s each)

#### How It Works Section
- **Title**: Fade-in with slide-up (0.6s)
- **Cards**: Staggered slide-up (0.7s each)
- **Accents**: Scale-in from top (0.4s each)

#### Features Grid
- **Label**: Fade-in (0.6s)
- **Cards**: Staggered slide-up (0.6s each)
- **Icons**: Scale & rotate-in (0.5s each)
- **Hover Effect**: Lift up with glow shadow

#### Pricing Section
- **Title**: Fade-in with slide-up (0.6s)
- **Cards**: 3D flip-in animation (0.6s each)
- **Pro Card**: Extra glow effect after flip
- **Hover Effect**: Scale up (1.03x)

#### CTA Section
- **Container**: Fade-in with slide-up (0.6s)
- **Button**: Continuous pulse animation (1.5s loop)

#### Navbar
- **Scroll Effect**: Background blur & border appear on scroll past 80px
- **Logo**: Continuous float & pulse animation

---

## 🎨 Design System (DO NOT CHANGE)

### Colors
- **Primary**: `#6467f2` (purple/violet)
- **Background**: `#09090b` (zinc-950)
- **Card**: `#18181b` (zinc-900)
- **Border**: `#27272a` (zinc-800)
- **Muted**: `#a1a1aa` (zinc-400)
- **White**: `#fafafa` (zinc-100)

### Fonts
- **UI**: Inter (300, 400, 500, 600, 700)
- **Code**: JetBrains Mono (400, 500)

### Existing Utilities (Reused)
- `.glass-panel` — frosted glass with purple border
- `.custom-scrollbar` — thin purple scrollbar
- `shadow-[0_0_30px_rgba(100,103,242,0.3)]` — purple glow
- `blur-[120px]` — background glow orbs
- `bg-clip-text` — gradient text
- `transition-all duration-300` — smooth transitions

---

## 🔧 Animation Classes Reference

### HTML Classes Used
```html
<!-- Hero Section -->
<div class="hero-badge">...</div>
<span class="hero-word">...</span>
<p class="hero-sub">...</p>
<button class="hero-cta">...</button>
<div class="chain-badge">...</div>
<div class="hero-terminal">...</div>
<div class="glow-orb">...</div>

<!-- Stats Bar -->
<section class="stats-bar">...</section>
<div class="stat-counter" data-target="99.9" data-format="percent">...</div>
<div class="stats-separator">...</div>

<!-- How It Works -->
<h2 class="how-title">...</h2>
<div class="how-cards">
  <div class="how-card">
    <div class="how-card-accent">...</div>
  </div>
</div>

<!-- Features -->
<h2 class="features-label">...</h2>
<div class="features-grid">
  <div class="feature-card">
    <div class="feature-icon">...</div>
  </div>
</div>

<!-- Pricing -->
<h2 class="pricing-title">...</h2>
<div class="pricing-grid">
  <div class="pricing-card pricing-card-pro">...</div>
</div>

<!-- CTA -->
<section class="cta-section">
  <button class="cta-pulse">...</button>
</section>
```

---

## 📱 Responsive Breakpoints

- **Mobile**: 1 column layouts
- **Tablet (md)**: 2 columns for features, 2 columns for pricing
- **Desktop (lg)**: 4 columns for features, 4 columns for pricing

---

## ⚙️ GSAP Configuration

### ScrollTrigger Settings
All scroll animations use:
```javascript
{
  start: "top 85%",           // Trigger when element is 85% down viewport
  toggleActions: "play none none none",  // Play once, don't reverse
  once: true                  // Never replay
}
```

### Easing Functions Used
- `power2.out` — smooth deceleration
- `power3.out` — stronger deceleration
- `back.out(1.7)` — spring/bounce effect
- `sine.inOut` — smooth sine wave

### Stagger Patterns
- **Hero words**: 0.1s stagger
- **Chain badges**: 0.07s stagger
- **Feature cards**: 0.12s stagger
- **Pricing cards**: 0.15s stagger

---

## 🎯 Logo Animation Details

### CSS Animations
```css
.logo-icon {
  animation: logoFloat 3s ease-in-out infinite;
}

.logo-glow {
  animation: logoPulse 2s ease-in-out infinite;
}
```

### Effects
- **Float**: Moves up/down 4px continuously
- **Glow**: Box-shadow pulses from 15px to 25px

---

## 🔍 Accessibility Features

### Reduced Motion Support
All animations respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .gsap-hidden { opacity: 1 !important; }
  .typewriter-cursor { animation: none; }
}
```

### Keyboard Navigation
- All links and buttons are keyboard accessible
- Tab order follows visual hierarchy
- Focus states are visible

---

## 🐛 Troubleshooting

### Animations Not Playing?
1. Check browser console for errors
2. Verify GSAP is installed: `npm list gsap`
3. Ensure `useGSAP()` hook is called in LandingPage.jsx
4. Check that animation classes are present in HTML

### Performance Issues?
1. Reduce number of simultaneous animations
2. Use `will-change` CSS for animated elements
3. Disable animations on mobile if needed
4. Check GPU acceleration is enabled

### Navbar Not Changing on Scroll?
1. Verify ScrollTrigger is registered
2. Check navbar element has correct selector
3. Ensure scroll distance is > 80px

---

## 📊 Animation Timeline

### Page Load (0-2s)
1. Badge scales in (0-0.5s)
2. Headline words slide in (0.2-0.9s)
3. Subheadline fades in (0.6-1.2s)
4. CTA buttons slide in (0.8-1.3s)
5. Chain badges pop in (1-1.5s)
6. Terminal slides in (0.5-1.3s)

### On Scroll
- Stats bar animates when 85% visible
- How It Works section animates when 85% visible
- Features grid animates when 85% visible
- Pricing cards animate when 85% visible
- CTA section animates when 85% visible

---

## 🚀 Deployment

### Vercel
```bash
cd frontend
vercel --prod
```

### Render
```bash
npm run build
# Deploy dist/ folder
```

---

## 📝 Notes

- All animations are GPU-accelerated for smooth 60fps performance
- Mobile animations are optimized for touch devices
- Animations are disabled for users with `prefers-reduced-motion` enabled
- No external animation libraries beyond GSAP are used
- All animations are self-contained in `scrollAnimations.js`

---

## 🎓 Learning Resources

- [GSAP Documentation](https://gsap.com/docs/)
- [ScrollTrigger Guide](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [useGSAP Hook](https://gsap.com/docs/v3/React/useGSAP/)

---

## ✅ Checklist

- [x] GSAP installed (`npm install gsap @gsap/react`)
- [x] Animation utilities added to `index.css`
- [x] `scrollAnimations.js` created with all animations
- [x] `LandingPage.jsx` updated with animation classes
- [x] Logo has float & pulse animations
- [x] Navbar scroll effect implemented
- [x] All sections have scroll triggers
- [x] Hover effects on cards
- [x] Responsive design maintained
- [x] Accessibility features included
- [x] Performance optimized

---

**Ready to launch! 🚀**
