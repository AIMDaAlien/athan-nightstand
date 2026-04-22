# Decisions

## Use A Static Web App

Decision: keep the app as plain HTML, CSS, and JavaScript.

Reason:

- Easier to deploy to an old Android phone.
- No build step.
- No package install on the phone.
- Can run offline.

## Vendor adhan-js

Decision: vendor the prayer-time library in `lib/adhan.js`.

Reason:

- The app should not require the internet.
- The Android device should not need npm or a bundler.

## Avoid ES Modules

Decision: use classic scripts instead of module imports.

Reason:

- Android and desktop browsers can block local ES module imports from `file://`.
- Classic scripts are more reliable for local file deployment.

## Keep Coordinates Private

Decision: remove real coordinates from tracked source and use `config.local.js`.

Reason:

- Exact coordinates can reveal a private location.
- Public repo should be reusable by other people without exposing the original
  local setup.

## Do Not Commit Audio

Decision: ignore `audio/*.mp3`.

Reason:

- Athan recordings may have copyright or redistribution limits.
- Users should provide their own local files.

## Prefer Free Kiosk Tooling

Decision: document Webview Kiosk from F-Droid instead of requiring Fully Kiosk.

Reason:

- Project should be usable without paid dependencies.
- Webview Kiosk is free/open-source.
- Webview Kiosk exposes the media gesture setting needed for unattended audio.

## Document Localhost Fallback

Decision: document Termux localhost serving.

Reason:

- Some Android WebView shells block `file:///sdcard/...` access.
- `http://127.0.0.1:8080/index.html` avoids Android file-access restrictions.

