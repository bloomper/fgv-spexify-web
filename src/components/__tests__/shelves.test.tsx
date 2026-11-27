import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Shelf, ShelfItem } from "@/components/shelf";
import { AlbumCard } from "@/components/album/album-card";
import { AlbumBackdrop } from "@/components/album/album-backdrop.client";
import { colourOf, NumberKindIcon } from "@/components/album/number-kind-icon";
import { TrackShelfItems } from "@/components/player/track-shelf.client";
import { RadioShelfItems } from "@/components/player/radio-shelf.client";
import { BottomDock, MobileTabBar } from "@/components/bottom-dock.client";
import type { PlayerTrack } from "@/components/player/player-provider.client";

const player = vi.hoisted(() => ({
  current: null as null | { id: string },
  playing: false,
  playQueue: vi.fn(),
  toggle: vi.fn(),
}));
const radio = vi.hoisted(() => ({ start: vi.fn(), pending: false }));
const albumTracksAction = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => ({ error: vi.fn() }));
let pathname = "/";

vi.mock("@/components/player/player-provider.client", () => ({ usePlayer: () => player }));
vi.mock("@/components/player/radio.client", () => ({ useRadio: () => radio }));
vi.mock("@/components/player/actions.server", () => ({ albumTracksAction }));
vi.mock("@/components/player/player-bar.client", () => ({ PlayerBar: () => <div>player</div> }));
vi.mock("sonner", () => ({ toast }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children?: ReactNode; href: string }) => (
    <a
      href={href}
      {...rest}
    >
      {children}
    </a>
  ),
}));

const album = {
  id: "a1",
  title: "Nobel",
  year: 1975,
  trackCount: 3,
  kind: { nameSv: "Skiva", nameEn: "Record", isDefault: false },
  spex: [{ categoryName: "Chalmersspexet", revival: true }],
};
const tracks: PlayerTrack[] = [
  { id: "t1", title: "Final", albumId: "a1", albumTitle: "Nobel", durationMs: 1000 },
  { id: "t2", title: "Slutsång", albumId: "a2", albumTitle: "Cleopatra", durationMs: 1000 },
];

describe("the start page's shelves", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    player.current = null;
    player.playing = false;
    pathname = "/";
  });

  it("is a heading, a link to everything and a row that scrolls with its arrows", () => {
    const scrollBy = vi.fn();

    Element.prototype.scrollBy = scrollBy;
    render(
      <Shelf
        id="s"
        title="Nytt"
        more={{ href: "/albums", label: "Alla" }}
      >
        <ShelfItem>x</ShelfItem>
      </Shelf>
    );

    expect(screen.getByRole("heading", { name: "Nytt" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Alla" })).toHaveAttribute("href", "/albums");
    expect(screen.getByRole("list", { name: "Nytt" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /scrollOn/ }));
    fireEvent.click(screen.getByRole("button", { name: /scrollBack/ }));
    expect(scrollBy).toHaveBeenCalledTimes(2);
    expect(scrollBy.mock.calls[1][0].left).toBeLessThan(0);
  });

  it("shows an album with its kind and plays it from its cover", async () => {
    albumTracksAction.mockResolvedValue(tracks);
    render(<AlbumCard album={album} />);

    expect(screen.getByText("1975 · Chalmersspexet")).toBeInTheDocument();
    expect(screen.getByText("Skiva")).toBeInTheDocument();
    expect(screen.getByText("revival")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /playAlbum/ }));
    await waitFor(() => expect(player.playQueue).toHaveBeenCalledWith(tracks, 0));
  });

  it("says when an album cannot be played, and offers no play button without tracks", async () => {
    albumTracksAction.mockResolvedValue(null);
    const { rerender } = render(
      <AlbumCard
        album={album}
        label="Spelat igår"
      />
    );

    expect(screen.getByText("Spelat igår")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /playAlbum/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("playFailed"));

    albumTracksAction.mockResolvedValue([]);
    fireEvent.click(screen.getByRole("button", { name: /playAlbum/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("noTracks"));

    rerender(<AlbumCard album={{ ...album, trackCount: 0 }} />);
    expect(screen.queryByRole("button", { name: /playAlbum/ })).not.toBeInTheDocument();
  });

  it("plays a shelf of songs from the chosen one, and pauses the playing one", () => {
    const { rerender } = render(
      <ul>
        <TrackShelfItems tracks={tracks} />
      </ul>
    );

    fireEvent.click(screen.getByRole("button", { name: /play:.*Slutsång/ }));
    expect(player.playQueue).toHaveBeenCalledWith(tracks, 1);
    expect(screen.getByRole("link", { name: "Cleopatra" })).toHaveAttribute("href", "/albums/a2");

    player.current = { id: "t1" };
    player.playing = true;
    rerender(
      <ul>
        <TrackShelfItems tracks={tracks} />
      </ul>
    );
    fireEvent.click(screen.getByRole("button", { name: /pause:.*Final/ }));
    expect(player.toggle).toHaveBeenCalled();
  });

  it("starts radio at random or from an album", () => {
    render(
      <ul>
        <RadioShelfItems albums={[{ id: "a1", title: "Nobel" }]} />
      </ul>
    );

    fireEvent.click(screen.getByRole("button", { name: /randomRadio/ }));
    fireEvent.click(screen.getByRole("button", { name: /radioFrom/ }));
    expect(radio.start).toHaveBeenNthCalledWith(1, {});
    expect(radio.start).toHaveBeenNthCalledWith(2, { albumId: "a1" });
  });

  it("shows a number kind by its initial in a colour of its own", () => {
    render(
      <NumberKindIcon
        kind={{ id: "k1", nameSv: "Ouvertyr", nameEn: "Overture" }}
        locale="en"
      />
    );

    expect(screen.getByRole("img", { name: "Overture" })).toHaveTextContent("O");
    expect(colourOf("k1")).toBe(colourOf("k1"));
    expect(new Set(["a", "b", "c", "d", "e", "f"].map(colourOf)).size).toBeGreaterThan(1);
  });
});

describe("the album page's backdrop", () => {
  it("shows the spex poster, else the cover, else nothing", () => {
    const { container } = render(<AlbumBackdrop albumId="a1" />);

    expect(container.querySelector("img")).toHaveAttribute("src", "/api/poster/a1");
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toHaveAttribute("src", "/api/cover/a1");
    fireEvent.error(container.querySelector("img")!);
    expect(container.querySelector("img")).toBeNull();
  });
});

describe("the bottom of the page", () => {
  it("has the library as tabs, the current one marked", () => {
    pathname = "/albums/1";
    render(<MobileTabBar />);

    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Nav.albums" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Nav.home" })).not.toHaveAttribute("aria-current");
  });

  it("holds the player and the tabs and tells the page its height", () => {
    vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(120);
    const { unmount } = render(<BottomDock />);

    expect(screen.getByText("player")).toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue("--player-height")).toBe("120px");
    act(() => unmount());
    expect(document.documentElement.style.getPropertyValue("--player-height")).toBe("");
    vi.restoreAllMocks();
  });
});
