# iOS Info.plist notes

**Status:** Not applicable while PulseCap remains PWA-only.

If a native Capacitor shell is ever added:
- Camera / photo library keys only if progress photos use native pickers.
- Notification permission strings only if push/local notifications ship natively.
- Keep on-device data messaging consistent with `PRIVACY.md` / `SECURITY.md`.

Until then, iOS users install via **Add to Home Screen**. Rest-timer notifications require an installed PWA + granted Notification permission.
