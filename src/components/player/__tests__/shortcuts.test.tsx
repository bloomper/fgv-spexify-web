import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ownsKeys, PlayerShortcuts } from "@/components/player/shortcuts.client";

const player = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));

vi.mock("@/components/player/player-provider.client", () => ({ usePlayer: () => player.state }));

describe("PlayerShortcuts", () => {
  beforeEach(() => {
    player.state = {
      current: { id: "1" }, time: 30, duration: 120, volume: 0.5, shuffle: false,
      toggle: vi.fn(), seek: vi.fn(), next: vi.fn(), previous: vi.fn(), setVolume: vi.fn(), toggleMute: vi.fn(),
      setShuffle: vi.fn(), cycleRepeat: vi.fn(),
    };
  });

  it("plays, seeks, skips and changes the volume from the keyboard", () => {
    render(<PlayerShortcuts />);

    fireEvent.keyDown(document.body, { key: " " });
    expect(player.state.toggle).toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    expect(player.state.seek).toHaveBeenCalledWith(40);
    fireEvent.keyDown(document.body, { key: "ArrowLeft", shiftKey: true });
    expect(player.state.previous).toHaveBeenCalled();
    fireEvent.keyDown(document.body, { key: "+" });
    expect(player.state.setVolume).toHaveBeenCalledWith(0.55);
    fireEvent.keyDown(document.body, { key: "m" });
    expect(player.state.toggleMute).toHaveBeenCalled();
  });

  it("shows the list of shortcuts on ?", async () => {
    render(<PlayerShortcuts />);

    fireEvent.keyDown(document.body, { key: "?" });
    expect(await screen.findByRole("dialog", { name: "title" })).toBeInTheDocument();
  });

  it("leaves keys to what uses them", () => {
    const input = document.createElement("input");
    const button = document.createElement("button");
    const range = Object.assign(document.createElement("input"), { type: "range" });

    expect(ownsKeys(input, "k")).toBe(true);
    expect(ownsKeys(button, " ")).toBe(true);
    expect(ownsKeys(button, "?")).toBe(false);
    expect(ownsKeys(range, "ArrowLeft")).toBe(true);
    expect(ownsKeys(range, "m")).toBe(false);
    expect(ownsKeys(document.body, " ")).toBe(false);
  });

  it("does nothing with modifier keys", () => {
    render(<PlayerShortcuts />);

    fireEvent.keyDown(document.body, { key: "k", ctrlKey: true });
    expect(player.state.toggle).not.toHaveBeenCalled();
  });
});
