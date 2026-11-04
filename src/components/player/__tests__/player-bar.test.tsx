import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { PlayerBar } from "@/components/player/player-bar.client";
import type { PlayerTrack } from "@/components/player/player-provider.client";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children?: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const track = (id: string, extra: Partial<PlayerTrack> = {}): PlayerTrack =>
  ({ id, title: `Låt ${id}`, albumId: "7", albumTitle: "Nobel", durationMs: 125_000, ...extra });

const player = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));

vi.mock("@/components/player/player-provider.client", () => ({ usePlayer: () => player.state }));

function playing(overrides: Record<string, unknown> = {}) {
  const queue = [track("1", { performers: "Kören" }), track("2")];

  player.state = {
    queue,
    index: 0,
    current: queue[0],
    playing: false,
    failed: false,
    time: 0,
    duration: 0,
    shuffle: false,
    repeat: "off",
    playQueue: vi.fn(),
    enqueue: vi.fn(),
    toggle: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    seek: vi.fn(),
    jump: vi.fn(),
    setShuffle: vi.fn(),
    cycleRepeat: vi.fn(),
    volume: 0.8,
    muted: false,
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    replayGain: "track",
    setReplayGain: vi.fn(),
    remove: vi.fn(),
    move: vi.fn(),
    clear: vi.fn(),
    plays: {},
    ...overrides,
  };
  return player.state as Record<string, ReturnType<typeof vi.fn>>;
}

const bar = () => screen.getByRole("region", { name: "label" });

describe("PlayerBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows nothing before anything is played", () => {
    playing({ current: null });
    const { container } = render(<PlayerBar />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the track and hands the controls to the player", () => {
    const state = playing({ time: 30 });

    render(<PlayerBar />);

    expect(within(bar()).getByText("Låt 1")).toBeInTheDocument();
    expect(within(bar()).getByText("Kören · Nobel")).toBeInTheDocument();
    expect(within(bar()).getByRole("link")).toHaveAttribute("href", "/albums/7");
    // Until the audio knows its duration, the track's own is used
    expect(within(bar()).getByText("0:30 / 2:05")).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "seek" })).toHaveAttribute("max", "125");

    fireEvent.click(screen.getByRole("button", { name: "play" }));
    fireEvent.click(screen.getByRole("button", { name: "next" }));
    fireEvent.click(screen.getByRole("button", { name: "previous" }));
    fireEvent.click(screen.getByRole("button", { name: "shuffle" }));
    fireEvent.click(screen.getByRole("button", { name: "repeat.off" }));
    fireEvent.change(screen.getByRole("slider", { name: "seek" }), { target: { value: "60" } });

    expect(state.toggle).toHaveBeenCalled();
    expect(state.next).toHaveBeenCalled();
    expect(state.previous).toHaveBeenCalled();
    expect(state.setShuffle).toHaveBeenCalledWith(true);
    expect(state.cycleRepeat).toHaveBeenCalled();
    expect(state.seek).toHaveBeenCalledWith(60);
  });

  it("shows playing, shuffling and repeating", () => {
    playing({ playing: true, shuffle: true, repeat: "one", duration: 90, current: track("2") });
    const { rerender } = render(<PlayerBar />);

    expect(screen.getByRole("button", { name: "pause" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "shuffle" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "repeat.one" })).toBeInTheDocument();
    expect(within(bar()).getByText("0:00 / 1:30")).toBeInTheDocument();
    expect(within(bar()).getByText("Nobel")).toBeInTheDocument();

    playing({ repeat: "all" });
    rerender(<PlayerBar />);
    expect(screen.getByRole("button", { name: "repeat.all" })).toBeInTheDocument();
  });

  it("says when the track cannot be played and offers to try again", () => {
    const state = playing({ failed: true });

    render(<PlayerBar />);

    expect(screen.getByRole("alert")).toHaveTextContent("error");
    expect(within(bar()).queryByText("Kören · Nobel")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "retry" }));
    expect(state.toggle).toHaveBeenCalled();
  });

  it("lists the queue, jumps in it, and offers shuffle and repeat there", () => {
    const state = playing({ shuffle: true, repeat: "all" });

    render(<PlayerBar />);
    fireEvent.click(screen.getByRole("button", { name: "queue" }));

    const panel = screen.getByRole("dialog");
    const items = within(panel).getAllByRole("listitem");

    expect(items).toHaveLength(2);
    expect(within(items[0]).getAllByRole("button")[0]).toHaveAttribute("aria-current", "true");
    expect(within(items[1]).getByText("2:05")).toBeInTheDocument();

    fireEvent.click(within(items[1]).getAllByRole("button")[0]);
    expect(state.jump).toHaveBeenCalledWith(1);

    expect(within(items[0]).getByRole("button", { name: /moveUp/ })).toBeDisabled();
    fireEvent.click(within(items[0]).getByRole("button", { name: /moveDown/ }));
    expect(state.move).toHaveBeenCalledWith(0, 1);
    fireEvent.click(within(items[1]).getByRole("button", { name: /removeFromQueue/ }));
    expect(state.remove).toHaveBeenCalledWith(1);

    fireEvent.click(within(panel).getByRole("button", { name: /shuffle/ }));
    expect(state.setShuffle).toHaveBeenCalledWith(false);
    fireEvent.click(within(panel).getByRole("button", { name: /repeat.all/ }));
    expect(state.cycleRepeat).toHaveBeenCalled();
  });

  it("follows synced lyrics and seeks to a line", () => {
    const lyrics = "[00:01.00]Första raden\n[00:05.00]\n[00:09.00]Tredje raden";
    const state = playing({ current: track("1", { lyrics, lyricsSynced: true }), time: 6 });

    render(<PlayerBar />);
    fireEvent.click(screen.getByRole("button", { name: "lyrics" }));

    const panel = screen.getByRole("dialog");

    expect(within(panel).getByText("lyrics: Låt 1")).toBeInTheDocument();
    expect(within(panel).getByText("♪").closest("li")).toHaveClass("font-semibold");
    expect(within(panel).getByText("Första raden").closest("li")).not.toHaveClass("font-semibold");

    fireEvent.click(within(panel).getByText("Tredje raden"));
    expect(state.seek).toHaveBeenCalledWith(9);
  });

  it("shows plain lyrics as text, and no lyrics button without lyrics", () => {
    playing({ current: track("1", { lyrics: "Rad ett\nRad två", lyricsSynced: false }) });
    const { rerender } = render(<PlayerBar />);

    fireEvent.click(screen.getByRole("button", { name: "lyrics" }));
    expect(within(screen.getByRole("dialog")).getByText(/Rad ett/)).toBeInTheDocument();

    playing();
    rerender(<PlayerBar />);
    expect(screen.queryByRole("button", { name: "lyrics" })).not.toBeInTheDocument();
  });

  it("clears the queue from its panel", () => {
    const state = playing();

    render(<PlayerBar />);
    fireEvent.click(screen.getByRole("button", { name: "queue" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: /clearQueue/ }));
    expect(state.clear).toHaveBeenCalled();
  });

  it("sets the volume and mutes", () => {
    const state = playing();

    render(<PlayerBar />);
    fireEvent.change(screen.getByRole("slider", { name: "volume" }), { target: { value: "0.3" } });
    expect(state.setVolume).toHaveBeenCalledWith(0.3);
    fireEvent.click(screen.getByRole("button", { name: "mute" }));
    expect(state.toggleMute).toHaveBeenCalled();
  });
});
