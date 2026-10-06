const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const LIGHT_START_MS = 6 * 60 * 60 * 1000;
const DARK_START_MS = 18 * 60 * 60 * 1000;

const millisecondsIntoIstDay = (now) => ((now + IST_OFFSET_MS) % DAY_MS + DAY_MS) % DAY_MS;

export function getLoggedOutTheme(now = Date.now()) {
  const time = millisecondsIntoIstDay(now);
  return time >= LIGHT_START_MS && time < DARK_START_MS ? 'light' : 'dark';
}

export function millisecondsUntilNextThemeChange(now = Date.now()) {
  const time = millisecondsIntoIstDay(now);
  const next = time < LIGHT_START_MS
    ? LIGHT_START_MS
    : time < DARK_START_MS
      ? DARK_START_MS
      : DAY_MS + LIGHT_START_MS;
  return next - time;
}
