import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SheetMusicPanel } from "@/components/sheet/sheet-music-panel.client";

vi.mock("@/components/sheet/pdf-reader.client", () => ({ PdfReader: ({ title }: { title: string }) => <div>pdf {title}</div> }));
vi.mock("@/components/sheet/score-view.client", () => ({
  ScoreView: ({ title, midi, syncs }: { title: string; midi: boolean; syncs: unknown[] }) => <div>{midi ? "midi" : "score"} {title} {syncs.length}</div>,
}));

const file = (id: string, title: string, kind: "PDF" | "MUSIC_XML" | "MIDI" | "OTHER", extension = "pdf") => ({
  id, title, name: `${title}.${extension}`, extension, contentType: "x", size: 1, pages: null, roleSv: "Partitur", roleEn: "Score",
  instrumentsSv: [], instrumentsEn: [], desk: null, kind,
});

const studio = {
  id: "t", editor: false, singers: [],
  scoreSyncs: [{ fileId: "x1", method: "MANUAL" as const, status: "DONE" as const, points: [], jumps: [], quality: 1, error: null,
    stale: false, updatedAt: null, version: 1 }],
  sheetMusic: {
    arrangementId: "a", archiveUrl: "https://arkiv.test/arrangements/a",
    versions: [
      { id: "v1", label: "Original", arranger: "A. Arr", recommended: true, key: "F-dur", tempo: null,
        files: [file("p1", "Partitur", "PDF"), file("x1", "Noter", "MUSIC_XML", "musicxml"), file("m1", "Midi", "MIDI", "mid"),
          file("o1", "Källa", "OTHER", "mscz")] },
      { id: "v2", label: "Band 2019", arranger: null, recommended: false, key: null, tempo: null, files: [file("p2", "Stämmor", "PDF")] },
    ],
  },
};

describe("the sheet music panel", () => {
  it("shows the notes first and every file of the chosen version", () => {
    render(<SheetMusicPanel trackId="t" studio={studio} onChanged={vi.fn()} />);
    expect(screen.getByText("score Noter 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "inArchive" })).toHaveAttribute("href", "https://arkiv.test/arrangements/a");
    fireEvent.click(screen.getByRole("button", { name: "Partitur" }));
    expect(screen.getByText("pdf Partitur")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Midi" }));
    expect(screen.getByText("midi Midi 0")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Källa" }));
    expect(screen.getByText(/downloadOnly/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download/ })).toHaveAttribute("href", "/api/sheet-music/t/o1?download=true");
    fireEvent.change(screen.getByRole("combobox", { name: "version" }), { target: { value: "v2" } });
    expect(screen.getByText("pdf Stämmor")).toBeInTheDocument();
  });
});
