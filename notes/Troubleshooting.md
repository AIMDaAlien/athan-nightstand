# Troubleshooting

## `net::ERR_ACCESS_DENIED`

Meaning:

The Android WebView or kiosk shell blocked direct file access to
`file:///sdcard/athan/index.html`.

Fix:

Use the Termux localhost fallback:

```bash
cd /sdcard/athan
python -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080/index.html
```

## Configuration Required

Meaning:

The app did not receive valid `lat` and `lng` values.

Fix:

Create and edit:

```bash
cp config.example.js config.local.js
```

Then push the folder again:

```bash
adb push . /sdcard/athan/
```

## Athan Does Not Play

Check:

- `audio/fajr.mp3` exists.
- `audio/standard.mp3` exists.
- Android media volume is up.
- Do Not Disturb is not blocking media or alarms.
- Webview Kiosk has `Media playback requires user gesture` disabled.
- Tap the screen once after launch to prime audio.

## App Looks Too Slow Or Janky

Likely cause:

The LG V30's Snapdragon 835 may struggle with CSS backdrop blur.

Fix:

Lower `--glass-blur` in `style.css`, for example:

```css
--glass-blur: 8px;
```

If still rough, remove `backdrop-filter` and use a more opaque panel.

## Countdown Or Times Look Wrong

Check:

- Android date and time are set automatically.
- Android timezone is correct.
- `lat` and `lng` are correct.
- `method` matches the local mosque convention.
- `madhab` matches the desired Asr timing.
- `hijriAdjustmentDays` is set if the local Hijri date differs.

