import {describe, expect, it} from "vitest";
import {currentLine, formatDuration, parseLrc} from "@/components/player/lyrics";

describe("parseLrc", () => {
    it("reads timestamped lines in time order and skips tags", () => {
        const lines = parseLrc("[ar:Kören]\n[00:04.50]Andra\n[00:01.00][00:07]Första och tredje\n");

        expect(lines).toEqual([
            {time: 1, text: "Första och tredje"},
            {time: 4.5, text: "Andra"},
            {time: 7, text: "Första och tredje"},
        ]);
    });

    it("finds the line being sung", () => {
        const lines = parseLrc("[00:01.00]a\n[00:03.00]b");

        expect(currentLine(lines, 0.5)).toBe(-1);
        expect(currentLine(lines, 2)).toBe(0);
        expect(currentLine(lines, 10)).toBe(1);
    });
});

describe("formatDuration", () => {
    it("formats minutes and hours", () => {
        expect(formatDuration(65)).toBe("1:05");
        expect(formatDuration(3725)).toBe("1:02:05");
        expect(formatDuration(Number.NaN)).toBe("0:00");
    });
});
