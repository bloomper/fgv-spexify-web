import type {ReactNode} from "react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {TrackList, type TrackRow} from "@/components/album/track-list.client";
import {DialogsProvider} from "@/components/dialogs.client";

const player = vi.hoisted(() => ({
    current: null as null | { id: string }, playing: false, playQueue: vi.fn(), toggle: vi.fn(), enqueue: vi.fn(),
    plays: {} as Record<string, { count: number; at: string }>,
}));
const radio = vi.hoisted(() => ({start: vi.fn(), pending: false}));
const actions = vi.hoisted(() => ({
    starAction: vi.fn(), addToPlaylistAction: vi.fn(), removeFromPlaylistAction: vi.fn(), rateAction: vi.fn(), reorderPlaylistAction: vi.fn(),
}));
const toast = vi.hoisted(() => ({success: vi.fn(), error: vi.fn()}));

vi.mock("@/components/player/player-provider.client", async importOriginal => ({
    ...await importOriginal<typeof import("@/components/player/player-provider.client")>(),
    usePlayer: () => player,
}));
vi.mock("@/components/player/radio.client", () => ({useRadio: () => radio}));
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
    render(<DialogsProvider>
        <TrackList tracks={tracks} starred={[]} playlists={[{id: "pl-1", name: "Favoriter"}]} spexflixUrl={null} {...props}/>
    </DialogsProvider>);

describe("TrackList", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        player.current = null;
        player.playing = false;
        player.plays = {};
        actions.reorderPlaylistAction.mockResolvedValue({ok: true});
        actions.starAction.mockResolvedValue({ok: true});
        actions.addToPlaylistAction.mockResolvedValue({ok: true});
        actions.removeFromPlaylistAction.mockResolvedValue({ok: true});
        actions.rateAction.mockResolvedValue({ok: true});
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
        const prompt = vi.spyOn(window, "prompt");

        show([row("1")]);

        await userEvent.click(screen.getByRole("button", {name: /more/}));
        await userEvent.click(await screen.findByRole("menuitem", {name: /addToPlaylist/}));
        await waitFor(() => expect(actions.addToPlaylistAction).toHaveBeenCalledWith("pl-1", null, ["nd-1"]));

        await userEvent.click(screen.getByRole("button", {name: /more/}));
        await userEvent.click(await screen.findByRole("menuitem", {name: "newPlaylist"}));
        // An in-app dialog, never the browser's prompt
        const dialog = await screen.findByRole("dialog");

        expect(within(dialog).getByRole("button", {name: "createPlaylist"})).toBeDisabled();
        await userEvent.type(within(dialog).getByLabelText("playlistName"), " Duetter ");
        await userEvent.click(within(dialog).getByRole("button", {name: "createPlaylist"}));
        expect(prompt).not.toHaveBeenCalled();
        await waitFor(() => expect(actions.addToPlaylistAction).toHaveBeenCalledWith(null, "Duetter", ["nd-1"]));
        expect(toast.success).toHaveBeenCalledWith("addedToPlaylist");
    });

    it("on a playlist removes a track by its position", async () => {
        show([row("1"), row("2")], {playlistId: "pl-1", showAlbum: true});

        await userEvent.click(screen.getAllByRole("button", {name: /more/})[1]);
        await userEvent.click(await screen.findByRole("menuitem", {name: "removeFromPlaylist"}));

        await waitFor(() => expect(actions.removeFromPlaylistAction).toHaveBeenCalledWith("pl-1", 1));
    });

    it("on a playlist moves a track by saving the new order", async () => {
        show([row("1"), row("2"), row("3")], {playlistId: "pl-1"});

        await userEvent.click(screen.getAllByRole("button", {name: /more/})[2]);
        await userEvent.click(await screen.findByRole("menuitem", {name: "moveUp"}));

        await waitFor(() => expect(actions.reorderPlaylistAction).toHaveBeenCalledWith("pl-1", ["nd-1", "nd-3", "nd-2"]));
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

    it("shows a play button in place of the number when a row is hovered", () => {
        show([row("1"), row("2", {fileMissing: true})]);

        const [first, missing] = screen.getAllByRole("listitem");

        expect(first).toHaveClass("group/track");
        expect(within(first).getByTestId("hover-play")).toHaveClass("hidden", "group-hover/track:block");
        expect(within(first).getByText("1")).toHaveClass("group-hover/track:hidden");
        expect(within(missing).queryByTestId("hover-play")).toBeNull();
    });

    it("cancelling the new playlist dialog adds nothing", async () => {
        show([row("1")]);

        await userEvent.click(screen.getByRole("button", {name: /more/}));
        await userEvent.click(await screen.findByRole("menuitem", {name: "newPlaylist"}));
        await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", {name: "cancel"}));

        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
        expect(actions.addToPlaylistAction).not.toHaveBeenCalled();
    });

    it("shows how often and when the user played a track", () => {
        show([row("1", {playCount: 3, played: "2026-10-31T18:00:00Z"}), row("2", {playCount: 0, played: null})]);

        expect(screen.getByText(/plays:.*"count":3/)).toBeInTheDocument();
        expect(screen.getByText("2026-10-31")).toBeInTheDocument();
        // On a line of its own, above the stars
        expect(screen.getByText("neverPlayed").tagName).toBe("SPAN");
        expect(screen.getByText("neverPlayed")).toHaveClass("block");
    });

    it("counts a play this session at once, until Navidrome's numbers include it", () => {
        player.plays = {"nd-1": {count: 1, at: "2026-11-02T10:00:00Z"}, "nd-2": {count: 1, at: "2026-11-02T10:00:00Z"}};
        show([row("1", {playCount: 0, played: null}), row("2", {playCount: 5, played: "2026-11-02T10:00:03Z"})]);

        expect(screen.getByText(/plays:.*"count":1/)).toBeInTheDocument();
        expect(screen.getByText(/plays:.*"count":5/)).toBeInTheDocument();
        expect(screen.queryByText("neverPlayed")).not.toBeInTheDocument();
    });

    it("links performers and melodies to their pages and starts radio from a track", async () => {
        show([row("1", {performers: "Kungen, Drottningen", melody: "Dancing Queen (ABBA)"})]);

        expect(screen.getByRole("link", {name: "Drottningen"})).toHaveAttribute("href", "/credits/performers/Drottningen");
        expect(screen.getByRole("link", {name: "Dancing Queen (ABBA)"})).toHaveAttribute("href", "/credits/melodies/Dancing%20Queen%20(ABBA)");

        await userEvent.click(screen.getByRole("button", {name: /more/}));
        await userEvent.click(await screen.findByRole("menuitem", {name: "startRadio"}));
        expect(radio.start).toHaveBeenCalledWith({trackId: "1"});
    });

    it("rates a track from its menu, shows the rating, and takes it back when it cannot be saved", async () => {
        show([row("1", {playCount: 1, played: null, rating: 0})]);

        await userEvent.click(screen.getByRole("button", {name: /more/}));
        const group = await screen.findByRole("radiogroup", {name: /rate:/});

        await userEvent.click(within(group).getByRole("radio", {name: /"count":4/}));
        await waitFor(() => expect(actions.rateAction).toHaveBeenCalledWith("nd-1", 4));
        expect(screen.getByRole("img", {name: /rated:.*"count":4/})).toBeInTheDocument();

        actions.rateAction.mockResolvedValue({ok: false});
        await userEvent.click(within(group).getByRole("radio", {name: /"count":4/}));
        await waitFor(() => expect(actions.rateAction).toHaveBeenLastCalledWith("nd-1", 0));
        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("rateFailed"));
        expect(screen.getByRole("img", {name: /rated:.*"count":4/})).toBeInTheDocument();
    });
});
