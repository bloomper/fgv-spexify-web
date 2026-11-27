import { describe, expect, it } from "vitest";
import { lineAt, lrcTime, parseTime, toLines, toLyrics, withText } from "@/components/player/lrc";
import { singerOf } from "@/components/player/lyrics";

describe("the lyrics editor's lines", () => {
  it("reads synced and plain lyrics", () => {
    expect(toLines("[00:01.50]Här står vi\n[00:04.00]på scenen", true)).toEqual([
      { time: 1.5, text: "Här står vi" },
      { time: 4, text: "på scenen" },
    ]);
    expect(toLines("Här står vi\npå scenen", false)).toEqual([
      { time: null, text: "Här står vi" },
      { time: null, text: "på scenen" },
    ]);
    expect(toLines(null, false)).toEqual([]);
  });

  it("writes LRC when every line has a time, else plain text", () => {
    expect(
      toLyrics([
        { time: 64.255, text: "b" },
        { time: 1.5, text: "a" },
      ])
    ).toEqual({ lyrics: "[00:01.50]a\n[01:04.26]b", synced: true });
    expect(
      toLyrics([
        { time: 1.5, text: "a" },
        { time: null, text: "b" },
      ])
    ).toEqual({ lyrics: "a\nb", synced: false });
    expect(toLyrics([{ time: null, text: " " }])).toEqual({ lyrics: null, synced: false });
  });

  it("reads and writes times", () => {
    expect(lrcTime(0)).toBe("00:00.00");
    expect(lrcTime(125.5)).toBe("02:05.50");
    expect(parseTime("2:05.5")).toBe(125.5);
    expect(parseTime("7,25")).toBe(7.25);
    expect(parseTime("x")).toBeNull();
  });

  it("keeps the times of the lines that stay when the text changes", () => {
    expect(
      withText(
        [
          { time: 1, text: "a" },
          { time: 2, text: "b" },
        ],
        "A\nB\nC"
      )
    ).toEqual([
      { time: 1, text: "A" },
      { time: 2, text: "B" },
      { time: null, text: "C" },
    ]);
  });

  it("finds the line playing", () => {
    const lines = [
      { time: 1, text: "a" },
      { time: null, text: "b" },
      { time: 3, text: "c" },
    ];

    expect(lineAt(lines, 0.5)).toBe(-1);
    expect(lineAt(lines, 2)).toBe(0);
    expect(lineAt(lines, 3)).toBe(2);
  });
});

describe("singer labels", () => {
  const names = new Map([
    ["Ph", "Philip"],
    ["Ph/Pa", "Philip & Pamela"],
  ]);

  it("shows the singer's name and drops the label", () => {
    expect(singerOf("Ph: Här står jag", names)).toEqual({ singer: "Philip", text: "Här står jag" });
    expect(singerOf("Ph/Pa: och vi", names)).toEqual({ singer: "Philip & Pamela", text: "och vi" });
  });

  it("leaves lines alone whose label names no one", () => {
    expect(singerOf("Ack: så är det", names)).toEqual({ singer: null, text: "Ack: så är det" });
    expect(singerOf("Ph:utan mellanslag", names)).toEqual({ singer: null, text: "Ph:utan mellanslag" });
  });
});
