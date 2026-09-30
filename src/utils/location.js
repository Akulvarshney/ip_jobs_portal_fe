const parts = value => typeof value === 'string'
  ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(',').map(part => part.trim()).filter(Boolean)
  : [];

// Support older city-only records without mixing fully qualified namesakes.
export function matchesCityLocation(location, selection) {
  if (!selection) return true;
  const stored = parts(location);
  const selected = parts(selection);
  if (!stored.length || !selected.length || stored[0] !== selected[0]) return false;
  const [shorter, longer] = stored.length <= selected.length ? [stored, selected] : [selected, stored];
  return shorter.every(part => longer.includes(part));
}
