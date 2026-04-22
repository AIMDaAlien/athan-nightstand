# Athan Nightstand

A single-page web app that turns an always-plugged-in Android phone (target: LG V30 on LineageOS 21, Android 14) into a bedside prayer-times clock. Giant countdown to the next prayer, the five daily prayer times plus Sunrise, Gregorian + Hijri dates, and the athan plays at each prayer.

Visual language: periwinkle glassmorphism on a near-black base, Ubuntu typeface, slow drifting gradients and soft cross-fades. A "night mode" collapses to true AMOLED-black between 23:00 and 05:00.

## Stack
- HTML / CSS / vanilla browser JavaScript — no build step
- [`adhan`](https://github.com/batoulapps/adhan-js) 4.4.3 (vendored browser bundle at `lib/adhan.js`) for prayer time calculation
- `Intl.DateTimeFormat` with `islamic-umalqura` calendar for the Hijri date
- Ubuntu font (latin subset, woff2) vendored in `fonts/`
- Launched via **Fully Kiosk Browser** on the phone

## First-time setup on your laptop

1. Open `index.html` in Chrome to preview.
2. Copy the example config:
   ```bash
   cp config.example.js config.local.js
   ```
3. Edit `config.local.js`:
   - `lat` / `lng` — your exact decimal coordinates
   - `method` — prayer calculation method, e.g. `'NorthAmerica'`
   - `madhab` — `'Shafi'` (earlier Asr) or `'Hanafi'` (later)
   - `timeFormat` — `'12h'` or `'24h'`
   - `hijriAdjustmentDays` — `0`, `1`, or `-1` to match local moonsighting
   - `dimAfterHour` / `dimUntilHour` — night-mode schedule
4. Confirm the two mp3 files exist in `audio/`:
   - `audio/fajr.mp3` — Fajr athan (has the extra "prayer is better than sleep" phrase)
   - `audio/standard.mp3` — athan for Dhuhr, Asr, Maghrib, Isha

`config.local.js` and the audio files are ignored by Git. That keeps exact
coordinates and possibly copyrighted recordings out of public commits.

## Device setup (LG V30, LineageOS 21)

### 1. Root + charge control
1. Install Magisk: patch `boot.img` from the LineageOS build, flash via fastboot.
2. Install **Advanced Charging Control (ACC)** from F-Droid or [`github.com/MatteCarra/AccA`](https://github.com/MatteCarra/AccA).
3. Set `shutdown capacity: 60`, `resume capacity: 40`. Charging now cycles 40→60 indefinitely, which dramatically extends the battery's life while plugged in 24/7.

### 2. Deploy the app
```bash
adb push . /sdcard/athan/
```

### 3. Fully Kiosk Browser
1. Install from `fully-kiosk.com` (sideload or Play Store).
2. Buy the Plus license (~€7 one-time) — unlocks autoplay, motion sensing, remote admin.
3. **Start URL**: `file:///sdcard/athan/index.html`
4. Enable: Fullscreen · Keep Screen On · Disable Status Bar · Launch on Boot · **Autoplay Videos** (this is what lets the athan sound fire) · Screensaver Off.
5. **Advanced Web Settings → Set as Launcher**.
6. **Device Management → Screen Brightness**: ~25% (burn-in friendly).
7. Lock orientation to portrait.

### 4. First tap
Tap the screen once after setup. This primes the audio element in case Fully Kiosk's autoplay isn't yet taking effect — the code handles this on the first `pointerdown`.

## Burn-in protection (built in)
- Near-black base `#0b0b1e`, pure `#000` in night mode.
- Aurora gradient drifts over 3 minutes — no region stays bright.
- Every 60s the whole stage translates ±2px on a 9-point pattern.
- Every 6h, countdown and prayer list swap vertical order.
- Night mode (23:00–05:00) dims all text to muted periwinkle.

## Files

```
index.html          // layout
config.example.js   // copy to config.local.js and edit locally
style.css           // periwinkle tokens, glass, Ubuntu, animations, day/night
app.js              // prayer calc, tick loop, athan trigger, burn-in shift
lib/adhan.js        // vendored adhan-js 4.4.3 browser bundle
fonts/              // Ubuntu woff2 latin subset (300/400/500/700)
audio/              // drop fajr.mp3 and standard.mp3 here
```

## Customization quick-reference

| Want to change…              | Edit                            |
|------------------------------|---------------------------------|
| Location                     | `config.local.js`               |
| Calculation method           | `config.local.js`               |
| Madhab / Asr timing          | `config.local.js`               |
| Hijri adjustment             | `config.local.js`               |
| Time format                  | `config.local.js`               |
| Color palette                | `:root` block in `style.css`    |
| Glass blur strength          | `--glass-blur`                  |
| Countdown / row font sizes   | `.countdown`, `.prayer-name`, `.prayer-time` in `style.css` |
| Pixel-shift interval         | `config.local.js`               |
| Night-mode hours             | `config.local.js`               |

## Troubleshooting

**Glass blur is janky on the V30** — Snapdragon 835 struggles with `backdrop-filter` under some drivers. Drop `--glass-blur` from `12px` → `8px` in `style.css`. If still janky, remove `backdrop-filter` entirely and set `--glass-bg: rgba(26, 26, 58, 0.55)` (opaque fallback).

**Athan doesn't play** — confirm Fully Kiosk's "Autoplay Videos" is on, then tap the screen once. Check the audio files are at the exact paths `audio/fajr.mp3` and `audio/standard.mp3`.

**Configuration required is showing** — copy `config.example.js` to
`config.local.js`, then set numeric `lat` and `lng` values.

**Hijri date is off by a day** — set `hijriAdjustmentDays` in `config.local.js`
to `1` or `-1` to align with your local mosque's convention.

**Countdown drifts** — it recomputes from `Date.now()` each tick, so drift is impossible unless the system clock is wrong. Check **Settings → System → Date & time → Automatic**.

## License

MIT for the app code. See `THIRD_PARTY_NOTICES.md` for vendored library/font
notices. Audio files are not included in the repository.
