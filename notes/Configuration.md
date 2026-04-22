# Configuration

## Public vs Private Config

The public repo ships with `config.example.js`.

Each user should copy it:

```bash
cp config.example.js config.local.js
```

Then edit `config.local.js`.

`config.local.js` is ignored by Git because it can contain exact home
coordinates.

## Required Local Values

At minimum:

```js
window.ATHAN_CONFIG = {
  lat: 0,
  lng: 0,
};
```

Use real decimal coordinates locally. Do not commit them.

## Optional Local Values

Common settings:

```js
window.ATHAN_CONFIG = {
  method: 'NorthAmerica',
  madhab: 'Shafi',
  hijriVariant: 'islamic-umalqura',
  hijriAdjustmentDays: 0,
  timeFormat: '12h',
  dimAfterHour: 23,
  dimUntilHour: 5,
};
```

## Audio

The app expects:

- `audio/fajr.mp3`
- `audio/standard.mp3`

These files are ignored by Git because athan recordings may have separate
copyright or redistribution terms.

## Missing Config Behavior

If `lat` or `lng` is missing, the app shows:

```text
Configuration required
Set decimal lat/lng in config.local.js
```

This avoids silently calculating for a fake default location.

