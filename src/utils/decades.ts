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

/**
 * Albums grouped by the decade of their year, newest decade first, keeping their order within each; albums without a
 * year are left out.
 */
export function byDecade<T extends { year?: number | null }>(albums: T[]): { decade: number; albums: T[] }[] {
  const groups = new Map<number, T[]>();

  for (const album of albums) {
    if (album.year) {
      const decade = Math.floor(album.year / 10) * 10;

      groups.set(decade, [...groups.get(decade) ?? [], album]);
    }
  }
  return [...groups].sort(([a], [b]) => b - a).map(([decade, items]) => ({ decade, albums: items }));
}

/**
 * Albums grouped by kind, in the kinds' order, for the kinds that are not the default and have albums. The kinds come
 * from the API, so a new kind gives a new group.
 */
export function byKind<K extends { id: string; isDefault: boolean }, T extends { kind: { id: string } }>(
  albums: T[], kinds: K[],
): { kind: K; albums: T[] }[] {
  return kinds.filter(kind => !kind.isDefault)
    .map(kind => ({ kind, albums: albums.filter(album => album.kind.id === kind.id) }))
    .filter(group => group.albums.length > 0);
}
