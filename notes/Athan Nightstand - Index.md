# Athan Nightstand - Index

## Purpose

Athan Nightstand is a small offline web app for turning an always-plugged-in
Android phone, currently targeting an LG V30, into a bedside prayer-times clock.

Core behavior:

- Show Gregorian and Hijri dates.
- Show a large countdown to the next prayer.
- Show Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha.
- Play a Fajr-specific athan at Fajr.
- Play a standard athan at Dhuhr, Asr, Maghrib, and Isha.
- Run without a build step or internet connection.

## Current State

- GitHub repo: https://github.com/AIMDaAlien/athan-nightstand
- Public repo is configurable and does not include private coordinates.
- Local private settings live in `config.local.js`, which is ignored by Git.
- Local audio files live in `audio/fajr.mp3` and `audio/standard.mp3`, also ignored by Git.
- Free/open-source kiosk path is preferred over paid Fully Kiosk.
- Android localhost fallback is documented for WebView file-access issues.

## Notes

- [[Architecture]]
- [[Configuration]]
- [[Setup and Deployment]]
- [[Decisions]]
- [[Troubleshooting]]
- [[Backlog]]

## Important Files

- `index.html`: page structure and audio tags.
- `app.js`: prayer calculation, rendering loop, athan playback trigger, burn-in mitigation.
- `style.css`: visual design, responsive layout, night mode.
- `config.example.js`: public example config.
- `config.local.js`: private local config, not tracked.
- `lib/adhan.js`: vendored adhan-js browser bundle.
- `audio/`: local athan files, not tracked.

