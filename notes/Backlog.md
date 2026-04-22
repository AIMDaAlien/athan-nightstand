# Backlog

## Near-Term

- Add a simple on-screen setup checklist for missing config/audio.
- Add a screenshot to the README after V30 layout is confirmed.
- Test Webview Kiosk file mode vs localhost mode on the actual V30.
- Test athan autoplay with `Media playback requires user gesture` disabled.

## Later

- Create a tiny native Android wrapper app for fully self-contained free
  deployment.
- Add optional geolocation setup for users who do not want to manually find
  coordinates.
- Add selectable calculation method UI.
- Add an optional next-day preview.
- Add a small health/status panel hidden behind a long press or query string.
- Add documentation for auto-starting the Termux server after boot if localhost
  mode becomes the preferred setup.

## Open Questions

- Does Webview Kiosk on the LG V30 allow direct `file:///sdcard/...` access after
  settings changes, or is localhost required?
- Does unattended audio work reliably after reboot with Webview Kiosk?
- Should the project eventually ship a native Android wrapper to avoid Termux?
