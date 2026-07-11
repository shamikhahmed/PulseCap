# PulseCap — Monetization Plan

## Model: Freemium → Pro ($4.99/mo or $39.99/yr)

### Why someone pays
Serious lifters log every session. The free tier gets them in the door with 50 exercises and PR tracking. The moment they want Smart Coach (adaptive training), body map, or recovery readiness — they hit the Pro gate. These are the exact features a committed athlete can't live without, and $4.99/mo is less than one protein shake.

### Revenue logic
- Target: 2,000 MAU at 8% Pro conversion = 160 × $4.99 = **$798/mo**
- Fitness has the highest willingness-to-pay among PWA categories — comparable to Hevy/Strong
- Annual plan ($39.99/yr) projected 40% uptake of Pro subscribers

---

## Free vs Pro

| Feature | Free | Pro |
|---------|------|-----|
| Exercise library | 50 exercises | ✅ 300+ with muscle mapping |
| Workout logging | ✅ Unlimited sessions | ✅ Unlimited sessions |
| PR tracking | ✅ | ✅ |
| Offline PWA | ✅ | ✅ |
| Body map & measurements | ❌ | ✅ |
| Smart Coach (adaptive) | ❌ | ✅ |
| Recovery readiness score | ❌ | ✅ |
| Nutrition tracking | ❌ | ✅ |
| wger.de library sync | ❌ | ✅ |
| Unlimited training history | ✅ (last 30 days) | ✅ Unlimited |
| Training analytics | ❌ | ✅ |
| Future: coach export PDF | ❌ | ✅ Roadmap |

---

## Implementation gates
- `window.PulsePro.isPro()` — reads `localStorage.getItem('pc_pro_active') === '1'`
- Demo mode returns `isPro() = true` (full experience)
- Gates at: exercise library (>50), body map tab, Smart Coach tab, recovery readiness widget
- Gate copy: "Smart Coach is a Pro feature →" triggers `openProUpgrade()`

## Payment path (current)
- Waitlist via `openProUpgrade()` modal — collects intent
- Next: Stripe hosted checkout or RevenueCat on Capacitor App Store build

## Enterprise / team angle
- Coaches who manage 10+ athletes — team pricing TBD
- See `ENTERPRISE.md` for B2B framing

---

*Last updated: 2026-06-28*
