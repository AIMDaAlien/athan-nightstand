# Setup and Deployment

## Mac Setup

Install ADB:

```bash
brew install android-platform-tools
```

Check it:

```bash
adb version
```

## Phone Setup

On the LG V30:

1. Enable Developer Options.
2. Enable USB Debugging.
3. Plug the phone into the Mac.
4. Approve the USB debugging prompt.

Check from the Mac:

```bash
adb devices
```

Expected shape:

```text
List of devices attached
<device-id>    device
```

## Push App To Phone

From the project folder:

```bash
cd "/Users/aim/Documents/athan standalone app"
adb push . /sdcard/athan/
```

This copies the full working folder, including ignored local files such as:

- `config.local.js`
- `audio/fajr.mp3`
- `audio/standard.mp3`

## Direct File Mode

The ideal simple URL is:

```text
file:///sdcard/athan/index.html
```

If the kiosk shell allows file access, this is the cleanest fully offline setup.

## Android Localhost Fallback

If WebView shows:

```text
net::ERR_ACCESS_DENIED
```

then direct file access is blocked. Use Termux.

In Termux:

```bash
pkg update
pkg install python
termux-setup-storage
cd /sdcard/athan
python -m http.server 8080
```

Then set the kiosk URL to:

```text
http://127.0.0.1:8080/index.html
```

Keep Termux running, and disable battery optimization for Termux for a permanent
setup.

## Kiosk Shell

Preferred free/open-source option:

- Webview Kiosk from F-Droid.

This project is intended to run in a kiosk browser or Android WebView shell.
Plain Chrome is useful for previewing, but it is not the target runtime for a
bedside device because unattended audio and fullscreen behavior are restricted.

Important settings:

- Fullscreen or immersive mode.
- Keep screen on.
- Portrait orientation.
- Launch on boot when ready.
- Disable `Media playback requires user gesture`.

## Current V30 Deployment Notes

- The accepted phone URL is the localhost form:
  `http://127.0.0.1:8080/index.html`.
- Direct `file:///sdcard/athan/index.html` previously hit
  `net::ERR_ACCESS_DENIED`.
- The current CSS includes pinned-mode offsets for the LG V30. Re-test after any
  layout or font-size changes before assuming the pinned view is still aligned.
