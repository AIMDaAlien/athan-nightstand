# Backlog

## Near-Term

- Add a simple on-screen setup checklist for missing config/audio.
- Test athan autoplay with `Media playback requires user gesture` disabled.
- Add a screenshot to the README using the accepted V30 pinned-mode layout.
- Keep monitoring the pinned V30 layout after several hours, especially after
  burn-in movement or layout swap.

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
- Consider a named `v30Pinned` layout/profile instead of hard-coded media-query
  tuning if other devices start using the app.

## Open Questions

- Does Webview Kiosk on the LG V30 allow direct `file:///sdcard/...` access after
  settings changes, or is localhost required?
- Does unattended audio work reliably after reboot with Webview Kiosk?
- Should the project eventually ship a native Android wrapper to avoid Termux?
