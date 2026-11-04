import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addToPlaylist,
  createPlaylist,
  getAlbumList,
  getAlbumSongs,
  getAlbumWithSongs,
  getPlaylist,
  getPlaylists,
  getPlayQueue,
  getStarred,
  playsOf,
  removeFromPlaylist,
  savePlayQueue,
  scrobble,
  setRating,
  star,
  starAlbum,
} from "@/lib/subsonic.server";

const apiFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({ apiFetch }));

const answer = (payload: object, status = "ok") =>
  apiFetch.mockResolvedValueOnce(new Response(JSON.stringify({
    "subsonic-response": {
      status,
      version: "1.16.1", ...payload,
    },
  })));
const calledWith = () => new URL(`http://x${apiFetch.mock.calls.at(-1)?.[0]}`);

describe("the Subsonic client", () => {
  beforeEach(() => {
    apiFetch.mockReset();
  });

  it("asks for JSON as spexify-web and repeats list parameters", async () => {
    answer({});
    await createPlaylist("Duetter", ["nd-1", "nd-2"]);

    const url = calledWith();

    expect(url.pathname).toBe("/rest/createPlaylist");
    expect(url.searchParams.get("f")).toBe("json");
    expect(url.searchParams.get("c")).toBe("spexify-web");
    expect(url.searchParams.getAll("songId")).toEqual(["nd-1", "nd-2"]);
  });

  it("reads stars and playlists, also when there are none", async () => {
    answer({ starred2: {} });
    expect(await getStarred()).toEqual([]);

    answer({ playlists: { playlist: [{ id: "pl-1", name: "Favoriter", songCount: 1, duration: 61 }] } });
    expect((await getPlaylists())[0].name).toBe("Favoriter");

    answer({ playlist: { id: "pl-1", name: "Favoriter", songCount: 0, duration: 0 } });
    expect((await getPlaylist("pl-1")).entry).toEqual([]);
  });

  it("stars, unstars, scrobbles and edits playlists with the right endpoints", async () => {
    for (let i = 0; i < 5; i++) {
      answer({});
    }
    await star("nd-1", true);
    expect(calledWith().pathname).toBe("/rest/star");
    await star("nd-1", false);
    expect(calledWith().pathname).toBe("/rest/unstar");
    await scrobble("nd-1", true);
    expect(calledWith().searchParams.get("submission")).toBe("true");
    await addToPlaylist("pl-1", ["nd-2"]);
    expect(calledWith().searchParams.getAll("songIdToAdd")).toEqual(["nd-2"]);
    await removeFromPlaylist("pl-1", 3);
    expect(calledWith().searchParams.get("songIndexToRemove")).toBe("3");
  });

  it("throws Navidrome's error message", async () => {
    answer({ error: { code: 70, message: "Playlist not found" } }, "failed");

    await expect(getPlaylist("x")).rejects.toThrow("Playlist not found");
  });

  it("reads play counts of an album's songs and the recently and most played albums", async () => {
    answer({
      album: {
        id: "al-1",
        song: [{ id: "nd-1", title: "Ouvertyr", playCount: 3, played: "2026-10-31T18:00:00Z" }, {
          id: "nd-2",
          title: "Final",
        }],
      },
    });
    const songs = await getAlbumSongs("al-1");

    expect(calledWith().pathname).toBe("/rest/getAlbum");
    expect(playsOf(songs)).toEqual({
      "nd-1": { playCount: 3, played: "2026-10-31T18:00:00Z", rating: 0 },
      "nd-2": { playCount: 0, played: null, rating: 0 },
    });

    answer({ albumList2: { album: [{ id: "al-1", name: "Nobel", playCount: 7 }] } });
    expect(await getAlbumList("frequent", 6)).toEqual([{ id: "al-1", name: "Nobel", playCount: 7 }]);
    expect(calledWith().pathname).toBe("/rest/getAlbumList2");
    expect(calledWith().searchParams.get("type")).toBe("frequent");
    expect(calledWith().searchParams.get("size")).toBe("6");

    answer({ albumList2: {} });
    expect(await getAlbumList("recent", 6)).toEqual([]);
  });

  it("rates, stars albums and reads an album's rating and star", async () => {
    answer({});
    await setRating("nd-1", 4);
    expect(calledWith().pathname).toBe("/rest/setRating");
    expect(calledWith().searchParams.get("rating")).toBe("4");

    answer({});
    await starAlbum("al-1", true);
    expect(calledWith().pathname).toBe("/rest/star");
    expect(calledWith().searchParams.get("albumId")).toBe("al-1");
    expect(calledWith().searchParams.has("id")).toBe(false);

    answer({
      album: {
        id: "al-1",
        userRating: 5,
        starred: "2026-10-31T18:00:00Z",
        song: [{ id: "nd-1", title: "Ouvertyr", userRating: 2 }],
      },
    });
    const album = await getAlbumWithSongs("al-1");

    expect(album.rating).toBe(5);
    expect(album.starred).toBe(true);
    expect(playsOf(album.songs)["nd-1"].rating).toBe(2);
  });

  it("saves and reads the play queue, also when there is none", async () => {
    answer({});
    await savePlayQueue(["nd-1", "nd-2"], "nd-2", 12345.6);
    expect(calledWith().pathname).toBe("/rest/savePlayQueue");
    expect(calledWith().searchParams.getAll("id")).toEqual(["nd-1", "nd-2"]);
    expect(calledWith().searchParams.get("current")).toBe("nd-2");
    expect(calledWith().searchParams.get("position")).toBe("12346");

    answer({ playQueue: { current: "nd-2", position: 5000, entry: [{ id: "nd-1" }, { id: "nd-2" }] } });
    expect(await getPlayQueue()).toEqual({ ids: ["nd-1", "nd-2"], current: "nd-2", positionMs: 5000 });

    answer({});
    expect(await getPlayQueue()).toBeNull();
  });
});
