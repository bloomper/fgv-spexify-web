import {beforeEach, describe, expect, it, vi} from "vitest";
import {addToPlaylist, createPlaylist, getPlaylist, getPlaylists, getStarred, removeFromPlaylist, scrobble, star} from "@/lib/subsonic.server";

const apiFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({apiFetch}));

const answer = (payload: object, status = "ok") =>
    apiFetch.mockResolvedValueOnce(new Response(JSON.stringify({"subsonic-response": {status, version: "1.16.1", ...payload}})));
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
        answer({starred2: {}});
        expect(await getStarred()).toEqual([]);

        answer({playlists: {playlist: [{id: "pl-1", name: "Favoriter", songCount: 1, duration: 61}]}});
        expect((await getPlaylists())[0].name).toBe("Favoriter");

        answer({playlist: {id: "pl-1", name: "Favoriter", songCount: 0, duration: 0}});
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
        answer({error: {code: 70, message: "Playlist not found"}}, "failed");

        await expect(getPlaylist("x")).rejects.toThrow("Playlist not found");
    });
});
