# Athan Nightstand

I wanted a single-page web app that turns an always-plugged-in Android phone (target: LG V30 on LineageOS 21, Android 14) into a bedside prayer-times clock. Giant countdown to the next prayer, the five daily prayer times plus Sunrise, Gregorian + Hijri dates, and the athan plays at each prayer. To be fair, Mawaqit could work but I wanted by own spin on the theming.

Visual language: periwinkle glassmorphism on a near-black base, Ubuntu typeface, slow drifting gradients and soft cross-fades. A "night mode" collapses to true AMOLED-black between 23:00 and 05:00.

## Stack
- HTML / CSS / vanilla browser JavaScript — no build step
- [`adhan`](https://github.com/batoulapps/adhan-js) 4.4.3 (vendored browser bundle at `lib/adhan.js`) for prayer time calculation
- `Intl.DateTimeFormat` with `islamic-umalqura` calendar for the Hijri date
- Ubuntu font (latin subset, woff2) vendored in `fonts/`
- Intended to run in a fullscreen Android WebView/kiosk shell

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

### 3. Free kiosk shell
Recommended free/open-source option: **Webview Kiosk** from F-Droid.

1. Install Webview Kiosk from F-Droid.
2. Set the start URL to:
   ```text
   file:///sdcard/athan/index.html
   ```
3. Enable fullscreen/immersive mode, keep screen on, launch on boot, and use as
   the default launcher if you want a locked-down bedside device.
4. In Web Engine settings, disable **Media playback requires user gesture**.
   That setting is what allows the athan audio to play unattended.
5. Set Android media volume, disable Do Not Disturb if needed, and lock
   orientation to portrait.

If WebView Kiosk shows `net::ERR_ACCESS_DENIED` for the `file:///sdcard/...`
URL, use the localhost method below instead.

### 3b. Localhost fallback

Some Android WebView builds block direct `file:///sdcard/...` pages. The free
workaround is to run a tiny local web server on the phone with Termux.

1. Install **Termux** from F-Droid.
2. Open Termux and run:
   ```bash
   pkg update
   pkg install python
   termux-setup-storage
   ```
3. Allow the storage permission popup.
4. Start the local server:
   ```bash
   cd /sdcard/athan
   python -m http.server 8080
   ```
5. In Webview Kiosk, use this start URL instead:
   ```text
   http://127.0.0.1:8080/index.html
   ```

Keep Termux running in the background. For a permanent nightstand setup, disable
battery optimization for Termux so Android does not kill the local server.

### 4. First tap
Tap the screen once after setup. This primes the audio element in case your
browser/WebView still requires a user gesture before audio playback.

## Browser/autoplay notes

Plain Chrome or most normal mobile browsers are not ideal for unattended athan
audio. Modern browsers generally block audible autoplay until the user interacts
with the page. The app includes a first-tap audio unlock, but that only helps the
current browser session.

For reliable unattended playback after reboot, use one of these:

- A free/open-source WebView kiosk shell that exposes Android WebView's
  `mediaPlaybackRequiresUserGesture` setting, such as Webview Kiosk.
- A small native Android wrapper app that loads this folder in WebView and sets
  media playback to not require a user gesture.

Fully Kiosk Browser can also do this, but it is not required and is intentionally
not the recommended setup for this project.

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

**Athan doesn't play** — check the audio files are at the exact paths
`audio/fajr.mp3` and `audio/standard.mp3`, confirm Android media volume is up,
and disable **Media playback requires user gesture** in your WebView/kiosk app.
If using a normal browser, tap the screen once after launch.

To test audio immediately, open one of these URLs and tap once if playback does
not start:

```text
http://127.0.0.1:8080/index.html?testAudio=fajr
http://127.0.0.1:8080/index.html?testAudio=standard
```

**Configuration required is showing** — copy `config.example.js` to
`config.local.js`, then set numeric `lat` and `lng` values.

**Hijri date is off by a day** — set `hijriAdjustmentDays` in `config.local.js`
to `1` or `-1` to align with your local mosque's convention.

**Countdown drifts** — it recomputes from `Date.now()` each tick, so drift is impossible unless the system clock is wrong. Check **Settings → System → Date & time → Automatic**.

## License

MIT for the app code. See `THIRD_PARTY_NOTICES.md` for vendored library/font
notices. Audio files are not included in the repository.
