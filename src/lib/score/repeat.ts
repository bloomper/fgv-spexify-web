// MusicXML <measure-repeat> ("repeat the previous bar / previous N bars"): ONE rule for the browser, twin of the server's MeasureRepeats (keep in step).
// Sibelius writes start (with N) in the attributes of the first repeated bar, rest-only bars, and stop in the attributes of the first bar AFTER the
// span (a bar with its own notes). A repeated bar sounds like the bar N positions earlier in WRITTEN order (already resolved: chains and N>1 groups
// work), per staff; `number` names the staff (none = all staves). The stop bar is repeated only when no staff of the part has notes of its own there.
// A bar with notes of its own is never replaced; nothing to copy stays silent. The sheet keeps showing the sign: only the notes change.
export interface RepeatSign {
  staff: number | null;
  kind: "start" | "stop";
  n: number;
}

/** items: notes with their written bar `m` and `staff`; signs: bar index -> signs found in that bar's attributes. Returns items plus the copies. */
export function resolveMeasureRepeats<T extends { m: number; staff: number }>(
  items: T[],
  signs: Map<number, RepeatSign[]>,
  staves: number[] = [1]
): T[] {
  if (!signs.size) return items;
  const by = new Map<string, T[]>();
  for (const it of items) {
    const k = `${it.m}:${it.staff}`;
    by.set(k, [...(by.get(k) ?? []), it]);
  }
  const own = new Set(by.keys());
  const all = Array.from(new Set([...items.map((i) => i.staff), ...staves])).sort((a, b) => a - b);
  const last = Math.max(...signs.keys(), ...items.map((i) => i.m));
  const active = new Map<number | null, number>();
  const extra: T[] = [];
  for (let m = Math.min(...signs.keys()); m <= last; m++) {
    const stops: Array<number | null> = [];
    for (const s of signs.get(m) ?? []) {
      if (s.kind === "start") active.set(s.staff, s.n);
      else stops.push(s.staff);
    }
    for (const s of all) {
      const n = active.get(s) || active.get(null);
      if (!n || m - n < 0) continue;
      if (stops.includes(s) || stops.includes(null)) {
        if (all.some((x) => own.has(`${m}:${x}`))) continue;
      } else if (own.has(`${m}:${s}`)) continue;
      for (const it of by.get(`${m - n}:${s}`) ?? []) {
        const c = { ...it, m };
        extra.push(c);
        by.set(`${m}:${s}`, [...(by.get(`${m}:${s}`) ?? []), c]);
      }
    }
    for (const s of stops) active.delete(s);
  }
  return [...items, ...extra];
}

/** Signs of one <attributes> element. */
export function repeatSigns(attributes: Element): RepeatSign[] {
  const out: RepeatSign[] = [];
  for (const ms of Array.from(attributes.children).filter((c) => c.tagName === "measure-style")) {
    const num = parseInt(ms.getAttribute("number") ?? "", 10);
    const staff = Number.isFinite(num) ? num : null;
    for (const mr of Array.from(ms.children).filter((c) => c.tagName === "measure-repeat")) {
      const ty = mr.getAttribute("type");
      if (ty === "start")
        out.push({ staff, kind: "start", n: Math.max(1, parseInt((mr.textContent ?? "").trim(), 10) || 1) });
      else if (ty === "stop") out.push({ staff, kind: "stop", n: 0 });
    }
  }
  return out;
}
