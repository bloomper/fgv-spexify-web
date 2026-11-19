import { describe, expect, it } from "vitest";
import { fileLabel, firstFile } from "@/components/sheet/sheet-music-panel.client";

const file = (id: string, kind: "PDF" | "MUSIC_XML" | "MIDI" | "OTHER", extra: Partial<Parameters<typeof fileLabel>[0]> = {}) => ({
  id, title: "Partitur", name: "Partitur.pdf", extension: "pdf", contentType: "application/pdf", size: 1, pages: 1, roleSv: "Partitur",
  roleEn: "Score", instrumentsSv: [], instrumentsEn: [], desk: null, kind, ...extra,
});

describe("the sheet music panel", () => {
  it("shows the notes first, then a PDF, then MIDI", () => {
    expect(firstFile([file("a", "OTHER"), file("b", "PDF"), file("c", "MUSIC_XML")])?.id).toBe("c");
    expect(firstFile([file("a", "MIDI"), file("b", "PDF")])?.id).toBe("b");
    expect(firstFile([file("a", "OTHER")])?.id).toBe("a");
    expect(firstFile([])).toBeNull();
  });

  it("names a part by its instruments and desk", () => {
    const part = file("a", "PDF", { title: "Stämma", instrumentsSv: ["Trumpet"], instrumentsEn: ["Trumpet"], desk: "1–2" });

    expect(fileLabel(part, "sv")).toBe("Stämma (Trumpet 1–2)");
    expect(fileLabel(file("b", "PDF"), "en")).toBe("Partitur");
  });
});
