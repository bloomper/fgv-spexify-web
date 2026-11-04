import { beforeEach, describe, expect, it, vi } from "vitest";
import * as catalog from "@/lib/catalog/catalog.server";

const { runQuery, runMutation } = vi.hoisted(() => ({ runQuery: vi.fn(), runMutation: vi.fn() }));

vi.mock("@/lib/graphql.server", () => ({ runQuery, runMutation }));

const variables = (mock: typeof runQuery) => mock.mock.calls.at(-1)?.[1];

describe("the catalog client", () => {
  beforeEach(() => {
    runQuery.mockReset();
    runMutation.mockReset();
  });

  it("unwraps single results and falls back when the server answers nothing", async () => {
    runQuery.mockResolvedValueOnce({ album: { id: "1", title: "Blandat" } });
    expect(await catalog.getAlbum("1")).toEqual({ id: "1", title: "Blandat" });
    expect(variables(runQuery)).toEqual({ id: "1" });

    runQuery.mockResolvedValueOnce(undefined);
    expect(await catalog.getAlbum("2")).toBeNull();

    runQuery.mockResolvedValueOnce(undefined);
    expect(await catalog.searchSpex("Ali")).toEqual([]);

    runQuery.mockResolvedValueOnce({ search: { albums: [], tracks: [] } });
    expect(await catalog.search("vals")).toEqual({ albums: [], tracks: [] });
    expect(variables(runQuery)).toEqual({ q: "vals" });
  });

  it("passes the whole result of the page queries through", async () => {
    runQuery.mockResolvedValue({ me: { username: "user" } });
    expect(await catalog.getMe()).toEqual({ me: { username: "user" } });
    await catalog.getHome();
    await catalog.getAlbums({ year: 1990 });
    expect(variables(runQuery)).toEqual({ filter: { year: 1990 } });
  });

  it("does not ask the server for tracks when there are no ids", async () => {
    expect(await catalog.getTracksByNavidromeIds([])).toEqual([]);
    expect(runQuery).not.toHaveBeenCalled();

    runQuery.mockResolvedValueOnce({ tracksByNavidromeIds: [{ id: "t1" }] });
    expect(await catalog.getTracksByNavidromeIds(["nd-1"])).toEqual([{ id: "t1" }]);
    runQuery.mockResolvedValueOnce(undefined);
    expect(await catalog.getTracksByNavidromeIds(["nd-2"])).toEqual([]);
  });

  it("returns the created album", async () => {
    runMutation.mockResolvedValueOnce({ albumCreate: { id: "9" } });
    expect(await catalog.albumCreate({ title: "Ny" } as never)).toEqual({ id: "9" });
  });

  it.each([
    ["albumUpdate", ["1", { title: "A" }], { id: "1", input: { title: "A" } }],
    ["albumPublish", ["1", true], { id: "1", published: true }],
    ["albumTrash", ["1"], { id: "1" }],
    ["albumRestore", ["1"], { id: "1" }],
    ["albumDelete", ["1"], { id: "1" }],
    ["albumCoverRemove", ["1"], { id: "1" }],
    ["tracksReorder", ["1", ["b", "a"]], { albumId: "1", trackIds: ["b", "a"] }],
    ["trackCreate", ["1", "up-1"], { albumId: "1", uploadId: "up-1" }],
    ["trackUpdate", ["2", { title: "T" }], { id: "2", input: { title: "T" } }],
    ["trackReplaceAudio", ["2", "up-2"], { id: "2", uploadId: "up-2" }],
    ["trackPublish", ["2", false], { id: "2", published: false }],
    ["trackTrash", ["2"], { id: "2" }],
    ["trackRestore", ["2"], { id: "2" }],
    ["trackDelete", ["2"], { id: "2" }],
  ] as const)("%s sends its variables", async (name, args, expected) => {
    runMutation.mockResolvedValueOnce({});
    await (catalog[name] as (...a: unknown[]) => Promise<unknown>)(...args);
    expect(variables(runMutation)).toEqual(expected);
  });
});
