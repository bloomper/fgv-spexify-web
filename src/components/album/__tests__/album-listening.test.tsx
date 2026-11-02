import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AlbumListening} from "@/components/album/album-listening.client";

const actions = vi.hoisted(() => ({starAlbumAction: vi.fn(), rateAction: vi.fn()}));
const toast = vi.hoisted(() => ({error: vi.fn()}));

vi.mock("@/app/(app)/actions.server", () => actions);
vi.mock("sonner", () => ({toast}));

describe("AlbumListening", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        actions.starAlbumAction.mockResolvedValue({ok: true});
        actions.rateAction.mockResolvedValue({ok: true});
    });

    it("stars and rates the album in Navidrome", async () => {
        render(<AlbumListening navidromeId="al-1" starred={false} rating={0}/>);

        await userEvent.click(screen.getByRole("button", {name: "starAlbum"}));
        expect(actions.starAlbumAction).toHaveBeenCalledWith("al-1", true);
        expect(await screen.findByRole("button", {name: "unstarAlbum"})).toHaveAttribute("aria-pressed", "true");

        await userEvent.click(within(screen.getByRole("radiogroup", {name: "rateAlbum"})).getByRole("radio", {name: /"count":3/}));
        expect(actions.rateAction).toHaveBeenCalledWith("al-1", 3);
    });

    it("takes the star back when it cannot be saved", async () => {
        actions.starAlbumAction.mockResolvedValue({ok: false, message: "nej"});
        render(<AlbumListening navidromeId="al-1" starred rating={2}/>);

        await userEvent.click(screen.getByRole("button", {name: "unstarAlbum"}));

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("starFailed"));
        expect(screen.getByRole("button", {name: "unstarAlbum"})).toBeInTheDocument();
    });
});
