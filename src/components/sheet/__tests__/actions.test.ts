import { beforeEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({
  getTrackStudio: vi.fn(),
  scoreSyncSave: vi.fn(),
  scoreSyncDelete: vi.fn(),
  scoreAlign: vi.fn(),
}));

vi.mock("@/lib/catalog/sheet-music.server", () => server);
vi.mock("@/utils/auth.server", () => ({ getSessionContext: async () => ({ roles: ["USER", "EDITOR"] }) }));
vi.mock("@/utils/route.server", () => ({ withPolicyAction: (_: unknown, handler: () => unknown) => handler() }));
vi.mock("@/utils/policy.server", () => ({ Policies: { app: {}, editor: {} } }));

const { alignScoreAction, deleteScoreSyncAction, saveScoreSyncAction, trackStudioAction } =
  await import("@/components/sheet/actions.server");

const TRACK = "01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e";
const FILE = "01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9f";

describe("the sheet music actions", () => {
  beforeEach(() => Object.values(server).forEach((fn) => fn.mockReset()));

  it("fetches a track's studio and says whether the caller edits", async () => {
    server.getTrackStudio.mockResolvedValue({ id: TRACK, sheetMusic: null, scoreSyncs: [], singers: [] });
    expect(await trackStudioAction(TRACK)).toMatchObject({ id: TRACK, editor: true });
    server.getTrackStudio.mockRejectedValue(new Error("down"));
    expect(await trackStudioAction(TRACK)).toBeNull();
    await expect(trackStudioAction("../x")).rejects.toThrow();
  });

  it("saves, removes and aligns maps", async () => {
    server.scoreSyncSave.mockResolvedValue({ fileId: FILE });
    server.scoreSyncDelete.mockResolvedValue(true);
    server.scoreAlign.mockResolvedValue({ fileId: FILE, status: "PENDING" });
    expect(await saveScoreSyncAction(TRACK, FILE, { points: [] }, 2)).toEqual({ ok: true, data: { fileId: FILE } });
    expect(server.scoreSyncSave).toHaveBeenCalledWith(TRACK, FILE, { points: [] }, 2);
    expect(await deleteScoreSyncAction(TRACK, FILE)).toEqual({ ok: true, data: true });
    expect(await alignScoreAction(TRACK, FILE)).toMatchObject({ ok: true });
  });
});
