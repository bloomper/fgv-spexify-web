import { parseLrc } from "@/components/player/lyrics";

/** A line of the lyrics editor: its text and when it starts, in seconds, or null before it is timed. */
export type TimedLine = { time: number | null; text: string };

/**
 * The editor's lines from a track's lyrics: synchronised ones with their times, plain ones untimed.
 */
export function toLines(lyrics: string | null | undefined, synced: boolean): TimedLine[] {
  if (!lyrics) {
    return [];
  }
  if (synced) {
    return parseLrc(lyrics).map((line) => ({ time: line.time, text: line.text }));
  }
  return lyrics.split(/\r?\n/).map((text) => ({ time: null, text }));
}

/** A time as LRC writes it: mm:ss.cc. */
export function lrcTime(seconds: number): string {
  const centis = Math.max(0, Math.round(seconds * 100));
  const minutes = Math.floor(centis / 6000);
  const rest = centis % 6000;

  return `${String(minutes).padStart(2, "0")}:${String(Math.floor(rest / 100)).padStart(2, "0")}.${String(rest % 100).padStart(2, "0")}`;
}

/** A time typed as m:ss, mm:ss.cc or seconds; null when it is none. */
export function parseTime(value: string): number | null {
  const match = /^\s*(?:(\d{1,3}):)?(\d{1,2}(?:[.,]\d{1,3})?)\s*$/.exec(value);

  if (!match) {
    return null;
  }
  return Number(match[1] ?? 0) * 60 + Number(match[2].replace(",", "."));
}

/**
 * The lines as lyrics: LRC when every line with text has a time, the lines in time order; else plain text.
 */
export function toLyrics(lines: TimedLine[]): { lyrics: string | null; synced: boolean } {
  const kept = lines.filter((line) => line.time !== null || line.text.trim() !== "");

  if (kept.length === 0) {
    return { lyrics: null, synced: false };
  }
  if (kept.every((line) => line.time !== null)) {
    return {
      lyrics: [...kept]
        .sort((a, b) => (a.time as number) - (b.time as number))
        .map((line) => `[${lrcTime(line.time as number)}]${line.text}`)
        .join("\n"),
      synced: true,
    };
  }
  return {
    lyrics: lines
      .map((line) => line.text)
      .join("\n")
      .trim(),
    synced: false,
  };
}

/**
 * New text for the lines, one per row, keeping the times of the rows that stay in place.
 */
export function withText(lines: TimedLine[], text: string): TimedLine[] {
  return text.split(/\r?\n/).map((row, i) => ({ time: lines[i]?.time ?? null, text: row }));
}

/** The line playing at a time: the last timed line at or before it, or -1. */
export function lineAt(lines: TimedLine[], time: number): number {
  let index = -1;

  lines.forEach((line, i) => {
    if (line.time !== null && line.time <= time && (index < 0 || (lines[index].time as number) <= line.time)) {
      index = i;
    }
  });
  return index;
}
