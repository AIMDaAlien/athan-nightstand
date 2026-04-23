# Architecture

## Shape

The app is intentionally plain:

- Static HTML.
- Static CSS.
- Vanilla browser JavaScript.
- No bundler.
- No package manager.
- No server required for normal desktop preview.
- Intended runtime is a fullscreen Android kiosk browser or WebView shell.

This keeps deployment simple for an old Android phone and avoids runtime network
dependencies.

## Runtime Flow

1. `index.html` loads the stylesheet.
2. `index.html` renders empty date, countdown, and prayer-time slots.
3. `lib/adhan.js` loads first and exposes `window.Adhan`.
4. `config.local.js` loads if present and sets `window.ATHAN_CONFIG`.
5. `app.js` merges `DEFAULT_CONFIG` with `window.ATHAN_CONFIG`.
6. `app.js` validates config.
7. If config is missing, the page shows a setup message.
8. If config is valid, the app calculates prayer times and starts a one-second tick loop.

## Prayer Calculation

Prayer times use the vendored `adhan-js` bundle:

- `Coordinates`
- `CalculationMethod`
- `PrayerTimes`
- `Madhab`

The public default calculation method is `NorthAmerica`.

Sunrise is displayed but is not treated as an athan trigger.

Prayer schedules are cached by local date. The one-second tick loop reuses the
same `PrayerTimes` instance for today's schedule instead of rebuilding it every
second, and keeps a small rolling cache for adjacent dates such as tomorrow's
Fajr.

Date and time formatting uses long-lived `Intl.DateTimeFormat` instances. The
Gregorian/Hijri date text only re-renders when the local date key changes.

## Athan Trigger

The app tracks the most recent passed prayer from:

- Fajr
- Dhuhr
- Asr
- Maghrib
- Isha

When the current period changes, it plays:

- `audio/fajr.mp3` for Fajr.
- `audio/standard.mp3` for all other athan prayers.

The trigger is seeded on page load so an already-passed prayer does not play
immediately after opening the app.

## Display and Burn-In Mitigation

The CSS uses a dark, low-brightness interface:

- Near-black base.
- AMOLED black in night mode.
- Dimmed night text.
- Slow background drift.
- One-minute pixel shift.
- Six-hour layout swap.

This does not eliminate burn-in risk, but it reduces static high-brightness
regions.

## Device Layout Notes

The LG V30 pinned-mode viewport behaves differently from the unpinned WebView.
The accepted current layout uses extra right-side width reserve plus a small
negative left offset in portrait media queries so prayer times do not clip when
Android screen pinning is active.
