/**
 * The decades the years fall in, newest first, e.g. 1970 for 1975.
 */
export function decadesOf(years: number[]): number[] {
  return [...new Set(years.map(year => Math.floor(year / 10) * 10))].sort((a, b) => b - a);
}

/**
 * A decade from an address, e.g. "1970"; null for anything else.
 */
export function parseDecade(value: string | undefined | null): number | null {
  return value && /^\d{3}0$/.test(value) ? Number(value) : null;
}
