import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ScoreView } from "@/components/sheet/score-view.client";
import type { ScoreSync } from "@/components/sheet/actions.server";
import { FakeAudioContext } from "@/lib/score/__tests__/fake-audio";

const actions = vi.hoisted(() => ({
  saveScoreSyncAction: vi.fn(),
  deleteScoreSyncAction: vi.fn(),
  alignScoreAction: vi.fn(),
}));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const player = vi.hoisted(() => ({ state: {} as Record<string, unknown> }));
const osmd = vi.hoisted(() => ({ instances: [] as { cursor: { show: ReturnType<typeof vi.fn> } }[] }));

vi.mock("@/components/sheet/actions.server", () => actions);
vi.mock("sonner", () => ({ toast }));
vi.mock("@/components/player/player-provider.client", () => ({ usePlayer: () => player.state }));
vi.mock("opensheetmusicdisplay", () => {
  class OpenSheetMusicDisplay {
    zoom = 1;
    position = 0;
    cursor = {
      show: vi.fn(),
      hide: vi.fn(),
      update: vi.fn(),
      cursorElement: document.createElement("img"),
      reset: () => {
        this.position = 0;
      },
      Iterator: {} as Record<string, unknown>,
    };
    // Three measures of one cursor step each, side by side
    GraphicSheet = {
      MeasureList: [0, 1, 2].map((m) => [
        {
          PositionAndShape: {
            AbsolutePosition: { x: m * 10, y: 0 },
            BorderLeft: 0,
            BorderRight: 10,
            BorderTop: 0,
            BorderBottom: 10,
          },
        },
      ]),
    };

    constructor() {
      Object.defineProperties(this.cursor.Iterator, {
        EndReached: { get: () => this.position >= 3 },
        CurrentMeasureIndex: { get: () => this.position },
        currentTimeStamp: { get: () => ({ RealValue: this.position }) },
        CurrentMeasure: { get: () => ({ AbsoluteTimestamp: { RealValue: this.position } }) },
      });
      this.cursor.Iterator.moveToNext = () => {
        this.position++;
      };
      osmd.instances.push(this);
    }

    load = vi.fn(async () => undefined);
    render = vi.fn();
    clear = vi.fn();
  }

  return { OpenSheetMusicDisplay };
});

const XML = `<score-partwise><part-list><score-part id="P1"><part-name>Sång</part-name></score-part><score-part id="P2"><part-name>Bas</part-name></score-part></part-list>
  <part id="P1">${[60, 62, 64]
    .map(
      (midi, i) => `<measure>${i === 0 ? '<attributes><divisions>1</divisions></attributes><sound tempo="120"/>' : ""}
    <note><pitch><step>${["C", "D", "E"][i]}</step><octave>4</octave></pitch><duration>4</duration></note></measure>`
    )
    .join("")}</part>
  <part id="P2">${[0, 1, 2].map((i) => `<measure>${i === 0 ? "<attributes><divisions>1</divisions></attributes>" : ""}<note><rest/><duration>4</duration></note></measure>`).join("")}</part>
</score-partwise>`;

const sync = (method: "MANUAL" | "AUTOMATIC", extra: Partial<ScoreSync> = {}): ScoreSync => ({
  fileId: "f",
  method,
  status: "DONE",
  quality: 1,
  error: null,
  stale: false,
  updatedAt: null,
  version: 3,
  jumps: [],
  points: [
    { seconds: 1, measure: 0, beat: 0 },
    { seconds: 3, measure: 1, beat: 0 },
    { seconds: 5, measure: 2, beat: 0 },
    { seconds: 7, measure: 2, beat: 4 },
  ],
  ...extra,
});

function view(props: Partial<Parameters<typeof ScoreView>[0]> = {}) {
  const onChanged = vi.fn(async () => undefined);

  render(
    <ScoreView
      trackId="t"
      fileId="f"
      title="Partitur"
      midi={false}
      syncs={[]}
      editor={false}
      onChanged={onChanged}
      {...props}
    />
  );
  return onChanged;
}

describe("the score view", () => {
  let position = 0;

  beforeEach(() => {
    osmd.instances.length = 0;
    position = 2;
    player.state = { playing: false, toggle: vi.fn(), seek: vi.fn(), position: () => position };
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = FakeAudioContext;
    globalThis.fetch = vi.fn(async () => new Response(XML));
    Object.values(actions).forEach((action) => action.mockReset());
  });

  const realFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it("follows the recording through its sync map and plays from a tapped measure", async () => {
    view({ syncs: [sync("MANUAL")] });
    await waitFor(() => expect(screen.getByTestId("score")).toBeInTheDocument());
    await waitFor(() => expect(osmd.instances[0]?.cursor.show).toHaveBeenCalled());
    expect(screen.getByRole("radio", { name: "followRecording" })).toHaveAttribute("aria-checked", "true");

    // Measure 3 (x 20–30 units, 8 px each at zoom 0.8) starts five seconds into the recording
    fireEvent.click(screen.getByTestId("score"), { clientX: 200, clientY: 4 });
    expect(player.state.seek).toHaveBeenCalledWith(5);
  });

  it("plays the notes, with tempo and parts", async () => {
    player.state = { ...player.state, playing: true };
    view();
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "playNotes" })).toHaveAttribute("aria-checked", "true")
    );
    expect(screen.getByRole("radio", { name: "followRecording" })).toBeDisabled();
    await waitFor(() => expect(screen.getAllByRole("button", { name: "playNotes" })[0]).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "playNotes" }));
    expect(player.state.toggle).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: 'mute:{"part":"Bas"}' }));
    fireEvent.click(screen.getByRole("button", { name: 'solo:{"part":"Sång"}' }));
    fireEvent.change(screen.getByRole("slider"), { target: { value: "0.5" } });
    expect(screen.getByText('bpm:{"bpm":60}')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("score"), { clientX: 12, clientY: 4 });
    fireEvent.click(screen.getByRole("button", { name: "zoomIn" }));
    fireEvent.click(screen.getByRole("button", { name: "zoomOut" }));
    fireEvent.click(screen.getByRole("button", { name: "pauseNotes" }));
  });

  it("lets an editor tap the measures in and save them", async () => {
    actions.saveScoreSyncAction.mockResolvedValue({ ok: true, data: sync("MANUAL") });

    const onChanged = view({ editor: true, syncs: [sync("AUTOMATIC", { status: "FAILED", error: "too short" })] });

    await waitFor(() => expect(screen.getByRole("button", { name: "start" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "start" }));
    fireEvent.click(screen.getByRole("button", { name: 'tap:{"measure":1}' }));
    position = 4;
    fireEvent.click(screen.getByRole("button", { name: 'tap:{"measure":2}' }));
    position = 3;
    fireEvent.click(screen.getByRole("button", { name: 'tap:{"measure":3}' }));
    expect(toast.error).toHaveBeenCalledWith("sync.tapInOrder");
    position = 6;
    fireEvent.click(screen.getByRole("button", { name: 'tap:{"measure":3}' }));
    fireEvent.click(screen.getByRole("button", { name: "undo" }));
    fireEvent.click(screen.getByTestId("score"), { clientX: 200, clientY: 4 });
    fireEvent.click(screen.getByRole("button", { name: 'tap:{"measure":3}' }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "save" })));
    expect(actions.saveScoreSyncAction).toHaveBeenCalledWith(
      "t",
      "f",
      {
        points: [
          { seconds: 2, measure: 0, beat: 0 },
          { seconds: 4, measure: 1, beat: 0 },
          { seconds: 6, measure: 2, beat: 0 },
        ],
        jumps: [],
      },
      null
    );
    expect(onChanged).toHaveBeenCalled();
  });

  it("lets an editor ask for an automatic sync and remove the manual one", async () => {
    actions.alignScoreAction.mockResolvedValue({ ok: true, data: sync("AUTOMATIC", { status: "PENDING" }) });
    actions.deleteScoreSyncAction.mockResolvedValue({ ok: false, message: "Nej" });
    view({
      editor: true,
      syncs: [sync("MANUAL", { stale: true }), sync("AUTOMATIC", { status: "DONE", quality: 0.72 })],
    });
    await waitFor(() => expect(screen.getByRole("button", { name: "automatic" })).toBeInTheDocument());
    expect(screen.getByText(/manualExists/)).toHaveTextContent('status.DONE:{"quality":72');
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "automatic" })));
    expect(actions.alignScoreAction).toHaveBeenCalledWith("t", "f");
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "remove" })));
    expect(toast.error).toHaveBeenCalledWith("Nej");
    fireEvent.click(screen.getByRole("button", { name: "edit" }));
    fireEvent.click(screen.getByRole("button", { name: "cancel" }));
  });

  it("plays a MIDI file without notes to show", async () => {
    const track = [0x00, 0x90, 60, 100, 0x60, 0x80, 60, 0, 0x00, 0xff, 0x2f, 0x00];

    globalThis.fetch = vi.fn(
      async () =>
        new Response(
          new Uint8Array([
            0x4d,
            0x54,
            0x68,
            0x64,
            0,
            0,
            0,
            6,
            0,
            0,
            0,
            1,
            0,
            96,
            0x4d,
            0x54,
            0x72,
            0x6b,
            0,
            0,
            0,
            track.length,
            ...track,
          ])
        )
    );
    view({ midi: true });
    expect(await screen.findByText(/midiOnly/)).toBeInTheDocument();
  });

  it("says when the score cannot be read", async () => {
    globalThis.fetch = vi.fn(async () => new Response("", { status: 404 }));
    view();
    expect(await screen.findByRole("alert")).toHaveTextContent("couldNotLoad");
  });
});
