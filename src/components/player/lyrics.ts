export type LyricLine = { time: number; text: string };

const TIMESTAMP = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?]/g;

/**
 * Parses LRC: lines with one or more {@code [mm:ss.xx]} timestamps. Lines without a timestamp, such as tags like
 * {@code [ar:...]}, are left out. Sorted by time.
 */
export function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];

  for (const raw of lrc.split(/\r?\n/)) {
    const stamps = [...raw.matchAll(TIMESTAMP)];

    if (stamps.length === 0) {
      continue;
    }

    const text = raw.replace(TIMESTAMP, "").trim();

    for (const stamp of stamps) {
      const fraction = stamp[3] ? Number(stamp[3].padEnd(3, "0")) / 1000 : 0;

      lines.push({ time: Number(stamp[1]) * 60 + Number(stamp[2]) + fraction, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

/**
 * The index of the line being sung at a time, or -1 before the first.
 */
export function currentLine(lines: LyricLine[], time: number): number {
  let index = -1;

  for (let i = 0; i < lines.length && lines[i].time <= time; i++) {
    index = i;
  }
  return index;
}

const LABEL = /^\s*([\p{L}][\p{L} ./&+,;()-]{0,23}?)\s*:\s+(?=\S)/u;

/**
 * A line without its singer label, and the singer: the name the label stands for when it is known, else nothing, so
 * that a line which merely has a colon early on keeps its text.
 */
export function singerOf(line: string, names: ReadonlyMap<string, string>): { singer: string | null; text: string } {
  const match = LABEL.exec(line);
  const name = match ? names.get(match[1].trim()) : undefined;

  return name && match ? { singer: name, text: line.slice(match[0].length) } : { singer: null, text: line };
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = String(whole % 60).padStart(2, "0");

  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${secs}` : `${minutes}:${secs}`;
}
