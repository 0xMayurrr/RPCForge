# 🚀 RPCForge GSAP Animations - Quick Commands

## Installation & Setup

### 1️⃣ Install GSAP Dependencies
```bash
cd frontend
npm install gsap @gsap/react
```

### 2️⃣ Start Development Server
```bash
npm run dev
```
Visit: `http://localhost:5173`

### 3️⃣ Build for Production
```bash
npm run build
```

---

## 📁 Files Created/Modified

### New Files
```
frontend/src/animations/scrollAnimations.js    ← All animation logic
frontend/GSAP_SETUP_GUIDE.md                   ← Full documentation
```

### Modified Files
```
frontend/src/index.css                         ← Added animation utilities
frontend/src/LandingPage.jsx                   ← Added animation classes & GSAP hook
```

---

## 🎬 What You Get

### ✨ Animations Included
- ✅ Hero section (badge, headline, buttons, terminal)
- ✅ Stats bar with animated counters
- ✅ How It Works section with staggered cards
- ✅ Features grid with hover effects
- ✅ Pricing cards with 3D flip animation
- ✅ CTA section with pulse button
- ✅ Navbar scroll effect
- ✅ Animated logo (float + glow)
- ✅ Glow orbs background animation

### 🎨 Design Features
- Professional SaaS aesthetic
- Dark theme (zinc-950 background)
- Purple accent color (#6467f2)
- Smooth transitions & hover states
- Responsive design (mobile, tablet, desktop)
- Accessibility support (prefers-reduced-motion)

---

## 🔧 Customization

### Change Animation Speed
Edit `frontend/src/animations/scrollAnimations.js`:
```javascript
// Example: Make hero badge slower
gsap.from('.hero-badge', {
  scale: 0.9,
  opacity: 0,
  duration: 1,  // ← Change this (default: 0.5)
  ease: 'power2.out',
});
```

### Change Animation Easing
Available easing functions:
- `power1.out`, `power2.out`, `power3.out` — smooth
- `back.out(1.7)` — spring/bounce
- `sine.inOut` — sine wave
- `elastic.out` — elastic bounce

### Disable Animations for Mobile
Add to `scrollAnimations.js`:
```javascript
if (window.innerWidth < 768) return; // Skip on mobile
```

---

## 📊 Animation Timing Reference

| Section | Duration | Trigger |
|---------|----------|---------|
| Hero Badge | 0.5s | Page load |
| Hero Headline | 0.7s | Page load (staggered) |
| Hero Buttons | 0.5s | Page load (staggered) |
| Stats Bar | 0.6s | Scroll to 85% |
| How It Works | 0.7s | Scroll to 85% |
| Features | 0.6s | Scroll to 85% |
| Pricing | 0.6s | Scroll to 85% |
| CTA Section | 0.6s | Scroll to 85% |

---

## 🎯 Key Classes

### Animation Triggers
```html
<div class="hero-badge">...</div>
<span class="hero-word">...</span>
<button class="hero-cta">...</button>
<div class="stats-bar">...</div>
<div class="feature-card">...</div>
<div class="pricing-card">...</div>
```

### Logo Animation
```html
<div class="logo-icon logo-glow">
  <Layers className="size-5" />
</div>
```

---

## 🐛 Quick Fixes

### Animations Not Working?
```bash
# 1. Check GSAP is installed
npm list gsap

# 2. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Restart dev server
npm run dev
```

### Performance Issues?
- Reduce stagger values (0.1 → 0.05)
- Reduce animation duration (0.7 → 0.4)
- Disable on mobile devices
- Check browser DevTools Performance tab

### Navbar Not Changing?
- Verify scroll distance > 80px
- Check navbar element selector
- Ensure ScrollTrigger is registered

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { ... }

/* Tablet */
@media (min-width: 768px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }
```

---

## 🎓 GSAP Basics

### From Animation (Hidden → Visible)
```javascript
gsap.from('.element', {
  opacity: 0,      // Start invisible
  y: 20,           // Start 20px down
  duration: 0.5,   // 0.5 seconds
  ease: 'power2.out'
});
```

### To Animation (Visible → Hidden)
```javascript
gsap.to('.element', {
  opacity: 0,
  y: -20,
  duration: 0.5
});
```

### Stagger (One by One)
```javascript
gsap.from('.items', {
  opacity: 0,
  stagger: 0.1  // 0.1s delay between each
});
```

### ScrollTrigger (On Scroll)
```javascript
gsap.from('.element', {
  scrollTrigger: {
    trigger: '.element',
    start: 'top 85%',
    once: true
  },
  opacity: 0,
  y: 20
});
```

---

## 🚀 Deployment Checklist

- [ ] Run `npm run build`
- [ ] Test animations in production build
- [ ] Check performance on mobile
- [ ] Verify all links work
- [ ] Test keyboard navigation
- [ ] Check accessibility (prefers-reduced-motion)
- [ ] Deploy to Vercel/Render

---

## 📞 Support

For issues or questions:
1. Check `GSAP_SETUP_GUIDE.md` for detailed docs
2. Review `scrollAnimations.js` for animation code
3. Check browser console for errors
4. Visit [GSAP Docs](https://gsap.com/docs/)

---

**Happy animating! 🎬✨**
