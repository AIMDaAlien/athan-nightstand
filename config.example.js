// Copy this file to `config.local.js`, then edit the values for your location.
// `config.local.js` is ignored by Git so exact coordinates stay private.
window.ATHAN_CONFIG = {
  lat: null,
  lng: null,

  method: 'NorthAmerica',
  madhab: 'Shafi',

  hijriVariant: 'islamic-umalqura',
  hijriAdjustmentDays: 0,

  timeFormat: '12h',

  dimAfterHour: 23,
  dimUntilHour: 5,

  pixelShiftMs: 60_000,
  layoutSwapMs: 6 * 60 * 60_000,
};
