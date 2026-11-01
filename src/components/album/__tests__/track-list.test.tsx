import type {ReactNode} from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {TrackList, type TrackRow} from "@/components/album/track-list.client";

const player = vi.hoisted(() => ({current: null as null | { id: string }, playing: false, playQueue: vi.fn(), toggle: vi.fn(), enqueue: vi.fn()}));
const actions = vi.hoisted(() => ({starAction: vi.fn(), addToPlaylistAction: vi.fn(), removeFromPlaylistAction: vi.fn()}));
const toast = vi.hoisted(() => ({success: vi.fn(), error: vi.fn()}));

vi.mock("@/components/player/player-provider.client", () => ({usePlayer: () => player}));
vi.mock("@/app/(app)/actions.server", () => actions);
vi.mock("sonner", () => ({toast}));
vi.mock("next/link", () => ({
    default: ({children, href}: { children?: ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const row = (id: string, extra: Partial<TrackRow> = {}): TrackRow => ({
    id, title: `Låt ${id}`, albumId: "1", albumTitle: "Nobel", durationMs: 61_000, navidromeId: `nd-${id}`,
    discNumber: 1, trackNumber: Number(id), listed: true, fileMissing: false, ...extra,
});

const show = (tracks: TrackRow[], props: Partial<Parameters<typeof TrackList>[0]> = {}) =>
    render(<TrackList tracks={tracks} starred={[]} playlists={[{id: "pl-1", name: "Favoriter"}]} spexflixUrl={null} {...props}/>);

describe("TrackList", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        player.current = null;
        player.playing = false;
        actions.starAction.mockResolvedValue({ok: true});
        actions.addToPlaylistAction.mockResolvedValue({ok: true});
        actions.removeFromPlaylistAction.mockResolvedValue({ok: true});
    });

    it("plays from the chosen track, skipping tracks whose file is missing", async () => {
        show([row("1"), row("2", {fileMissing: true}), row("3")]);

        await userEvent.click(screen.getByRole("button", {name: /play:.*Låt 3/}));

        expect(player.playQueue).toHaveBeenCalledWith([expect.objectContaining({id: "1"}), expect.objectContaining({id: "3"})], 1);
        expect(screen.getByText("fileMissing")).toBeInTheDocument();
    });

    it("pauses the track that is playing", async () => {
        player.current = {id: "1"};
        player.playing = true;
        show([row("1")]);

        await userEvent.click(screen.getByRole("button", {name: /pause/}));

        expect(player.toggle).toHaveBeenCalled();
    });

    it("stars a track at once and takes the star back when it cannot be saved", async () => {
        actions.starAction.mockResolvedValue({ok: false});
        show([row("1")]);

        await userEvent.click(screen.getByRole("button", {name: /star:/}));

        expect(actions.starAction).toHaveBeenCalledWith("nd-1", true);
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("starFailed"));
    });

    it("offers no star for a track Navidrome does not know", () => {
        show([row("1", {navidromeId: null, listed: false})]);

        expect(screen.getByText("unpublished")).toBeInTheDocument();
        expect(screen.queryByRole("button", {name: /star:/})).toBeNull();
    });

    it("adds a track to a playlist or a new one from its menu", async () => {
        vi.spyOn(window, "prompt").mockReturnValue("Duetter");
        show([row("1")]);

        await userEvent.click(screen.getByRole("button", {name: /more/}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /addToPlaylist/}));
        await waitFor(() => expect(actions.addToPlaylistAction).toHaveBeenCalledWith("pl-1", null, ["nd-1"]));

        await userEvent.click(screen.getByRole("button", {name: /more/}));
        await userEvent.click(await screen.findByRole("menuitem", {name: "newPlaylist"}));
        await waitFor(() => expect(actions.addToPlaylistAction).toHaveBeenCalledWith(null, "Duetter", ["nd-1"]));
        expect(toast.success).toHaveBeenCalledWith("addedToPlaylist");
    });

    it("on a playlist removes a track by its position", async () => {
        show([row("1"), row("2")], {playlistId: "pl-1", showAlbum: true});

        await userEvent.click(screen.getAllByRole("button", {name: /more/})[1]);
        await userEvent.click(await screen.findByRole("menuitem", {name: "removeFromPlaylist"}));

        await waitFor(() => expect(actions.removeFromPlaylistAction).toHaveBeenCalledWith("pl-1", 1));
    });

    it("splits discs and links to Spexflix when there are links", () => {
        show([row("1"), row("2", {discNumber: 2, videoLinks: [{videoId: "7", videoTitle: "Nobel", chapterTitle: "Ouvertyr", startSeconds: 42}]})],
            {spexflixUrl: "https://spexflix.test"});

        expect(screen.getByText(/disc:.*"number":2/)).toBeInTheDocument();
        const link = screen.getByRole("link", {name: /watchInSpexflix/});

        expect(link).toHaveAttribute("href", expect.stringContaining("https://spexflix.test/videos/7"));
        expect(link.getAttribute("href")).toContain("t=42");
        expect(within(document.body).queryAllByText(/goToAlbum/)).toHaveLength(0);
    });
});
