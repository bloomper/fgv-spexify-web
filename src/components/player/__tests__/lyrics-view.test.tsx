import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LyricsView } from "@/components/player/lyrics-view.client";

const seek = vi.fn();

vi.mock("@/components/player/player-provider.client", () => ({ usePlayer: () => ({ time: 3.5, seek }) }));

const singers = [{ label: "Ph", name: "Philip" }, { label: "Ph/Pa", name: "Philip & Pamela" }];
const track = { id: "1", title: "Visan", albumId: "a", albumTitle: "Nobel", durationMs: 10_000 };

describe("the lyrics view", () => {
  it("names the singers of synced lines once per turn", () => {
    Element.prototype.scrollIntoView = vi.fn();
    render(<LyricsView singers={singers} track={{ ...track, lyricsSynced: true,
      lyrics: "[00:01.00]Ph: Här står jag\n[00:02.00]Ph: och sjunger\n[00:03.00]Ph/Pa: och vi med\n[00:04.00]Kör: Alla!" }} />);
    expect(screen.getAllByText("Philip")).toHaveLength(1);
    expect(screen.getByText("Philip & Pamela")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "och vi med" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kör: Alla!" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Här står jag" }));
    expect(seek).toHaveBeenCalledWith(1);
  });

  it("names the singers of plain lyrics", () => {
    render(<LyricsView singers={singers} track={{ ...track, lyrics: "Ph: Här står jag\n\nen rad" }} />);
    expect(screen.getByText("Philip")).toBeInTheDocument();
    expect(screen.getByText("en rad")).toBeInTheDocument();
  });
});
