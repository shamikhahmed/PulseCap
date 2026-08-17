# PulseCap — Security Notes

## Local-only data

- Workouts, body stats, PRs, and Smart Coach history live in **localStorage** on your device.
- **No telemetry**, analytics SDKs, or server database ship with PulseCap.
- Protect your device passcode and exported backup files — anyone with the file can read your training data.

## Smart Coach

- Smart Coach is **rule-based** (not an LLM). No training data is sent to external AI services.
- Injury, readiness, and My Plan guidance is informational — **not medical advice** and not a substitute for a licensed trainer or clinician.

## Data residency

- Data never leaves your device unless you export a backup or share screenshots.
- Plan import (text PDF / JSON / pasted text) is parsed **in the browser**. Files are not uploaded. PulseCap stores the structured plan in localStorage only after you confirm the review; **scanned PDFs are rejected** (no OCR).
- Clearing site data or uninstalling the PWA removes local copies.

## PWA / supply chain

- Static assets served from GitHub Pages; verify `sw.js` cache version (`pulsecap-v86`) when updating.
- Do not commit `.env` or API keys to the repository.

## Reporting

Open a private security issue on the [PulseCap GitHub repo](https://github.com/shamikhahmed/PulseCap) for vulnerabilities.
