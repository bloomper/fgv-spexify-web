// General MIDI program per score part: DATA, first matching row wins (order matters: specific instruments before voices).
// The part name (Swedish or English) is matched case-insensitively. program null = take the score's own <midi-program>, else piano.
export interface InstrumentRow {
  re: RegExp;
  program: number | null;
  drum?: boolean;
  label: string; // Swedish name shown in the parts list
}

export const INSTRUMENTS: InstrumentRow[] = [
  { re: /trumm|drum|slagverk|perc|batteri|cymbal|virvel/i, program: 0, drum: true, label: "Trummor" },
  { re: /kontrabas|double ?bass|contrabass|upright|stråkbas/i, program: 32, label: "Kontrabas" },
  { re: /el[- ]?bas|bass ?guitar|basgitarr|electric bass/i, program: 33, label: "Elbas" },
  { re: /piano|klaver|flygel|keyboard|keys|cembalo|harpsichord/i, program: 0, label: "Piano" },
  { re: /orgel|organ/i, program: 19, label: "Orgel" },
  { re: /ackordeon|accordion|dragspel/i, program: 21, label: "Dragspel" },
  { re: /synt|synth/i, program: 80, label: "Synt" },
  { re: /piccolo|flöjt|floejt|flute/i, program: 73, label: "Flöjt" },
  { re: /klarinett|clarinet/i, program: 71, label: "Klarinett" },
  { re: /oboe|engelskt horn|english horn/i, program: 68, label: "Oboe" },
  { re: /fagott|bassoon/i, program: 70, label: "Fagott" },
  { re: /sax/i, program: 65, label: "Saxofon" },
  { re: /trumpet|kornett|cornet/i, program: 56, label: "Trumpet" },
  { re: /trombon|trombone/i, program: 57, label: "Trombon" },
  { re: /tuba|euphonium/i, program: 58, label: "Tuba" },
  { re: /horn/i, program: 60, label: "Valthorn" },
  { re: /viola|altfiol/i, program: 41, label: "Altfiol" },
  { re: /violin|fiol|violine/i, program: 40, label: "Fiol" },
  { re: /cello|violoncell/i, program: 42, label: "Cello" },
  { re: /harp|harpa/i, program: 46, label: "Harpa" },
  { re: /gitarr|guitar|akustisk|ukulele|banjo|mandolin/i, program: 24, label: "Gitarr" },
  {
    re: /vibrafon|vibraphone|xylofon|xylophone|marimba|klockspel|glockenspiel|celesta/i,
    program: 11,
    label: "Vibrafon",
  },
  // voices last: "Tenor sax" / "Bas" (instrument) are caught above only when they carry the instrument word
  {
    re: /sopran|soprano|\balt\b|alto|tenor|\bbas\b|bass|baryton|kör|choir|chorus|sång|sing|vocal|voice|röst|solo|stämma|mezzo|diskant/i,
    program: 52,
    label: "Kör",
  },
];

export const DEFAULT_ROW: InstrumentRow = { re: /./, program: null, label: "Piano" };

export interface Voice {
  program: number;
  drum: boolean;
  label: string;
}

/** Instrument of a part: name regex table first, then the score's <midi-program> (0-based) when given, else piano. */
export function instrumentFor(name: string, xmlProgram?: number | null, xmlDrum?: boolean): Voice {
  const row = INSTRUMENTS.find((r) => r.re.test(name || ""));
  if (row) return { program: row.program ?? xmlProgram ?? 0, drum: !!row.drum, label: row.label };
  return { program: xmlProgram ?? 0, drum: !!xmlDrum, label: xmlDrum ? "Trummor" : DEFAULT_ROW.label };
}

/** MIDI channel per part index: 0-8, 10-15 for pitched parts (shared round robin beyond 15), 9 for drums. */
export function channelsFor(drums: boolean[]): number[] {
  const free = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15];
  let n = 0;
  return drums.map((d) => (d ? 9 : free[n++ % free.length]));
}
