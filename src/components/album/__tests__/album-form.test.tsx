import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AlbumForm} from "@/components/album/album-form.client";

const searchSpexAction = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => ({error: vi.fn()}));

vi.mock("@/app/(app)/manage/actions.server", () => ({searchSpexAction}));
vi.mock("sonner", () => ({toast}));

const NOBEL = {id: "7", title: "Nobel", year: 1992, revival: true, categoryName: "Chalmersspexet"};

describe("AlbumForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        searchSpexAction.mockResolvedValue({ok: true, data: [NOBEL]});
    });

    it("needs a spex or a title before it can be saved, and sends empty fields as null", async () => {
        const onSubmit = vi.fn().mockResolvedValue(true);

        render(<AlbumForm submitLabel="Spara" onSubmit={onSubmit}/>);
        expect(screen.getByRole("button", {name: "Spara"})).toBeDisabled();

        await userEvent.type(screen.getByLabelText("title"), "  Blandade visor ");
        await userEvent.selectOptions(screen.getByLabelText("kind"), "COMPILATION");
        await userEvent.click(screen.getByRole("button", {name: "Spara"}));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
            spexId: null, title: "Blandade visor", year: null, kind: "COMPILATION", description: null,
        }));
    });

    it("searches Spexregister after two letters and picks a spex", async () => {
        const onSubmit = vi.fn().mockResolvedValue(true);

        render(<AlbumForm submitLabel="Spara" onSubmit={onSubmit}/>);
        await userEvent.type(screen.getByLabelText("spex"), "N");
        await new Promise(resolve => setTimeout(resolve, 350));
        expect(searchSpexAction).not.toHaveBeenCalled();

        await userEvent.type(screen.getByLabelText("spex"), "o");
        const result = await screen.findByRole("button", {name: /Nobel 1992/});

        expect(searchSpexAction).toHaveBeenCalledWith("No");
        expect(result).toHaveTextContent("(revival)");
        expect(result).toHaveTextContent("Chalmersspexet");

        await userEvent.click(result);
        expect(screen.getByLabelText("title")).toHaveAttribute("placeholder", "Nobel");
        expect(screen.getByLabelText("year")).toHaveAttribute("placeholder", "1992");

        await userEvent.type(screen.getByLabelText("year"), "1993");
        await userEvent.type(screen.getByLabelText("description"), "Inspelad live");
        await userEvent.click(screen.getByRole("button", {name: "Spara"}));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
            spexId: "7", title: null, year: 1993, kind: "SHOW", description: "Inspelad live",
        }));
    });

    it("tells when the search fails", async () => {
        searchSpexAction.mockResolvedValue({ok: false, code: "UNAVAILABLE", message: "Spexregister svarar inte"});

        render(<AlbumForm submitLabel="Spara" onSubmit={vi.fn()}/>);
        await userEvent.type(screen.getByLabelText("spex"), "Ali");

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Spexregister svarar inte"));
    });

    it("starts from an album's values and lets the spex be changed", async () => {
        render(<AlbumForm submitLabel="Spara" onSubmit={vi.fn()} initial={{
            spex: NOBEL, title: "Nobel – live", year: 1992, kind: "STUDIO", description: "Text",
        }}/>);

        expect(screen.getByLabelText("title")).toHaveValue("Nobel – live");
        expect(screen.getByLabelText("year")).toHaveValue("1992");
        expect(screen.getByLabelText("kind")).toHaveValue("STUDIO");
        expect(screen.getByText(/Nobel 1992/)).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", {name: "change"}));
        expect(screen.getByLabelText("spex")).toHaveValue("");
    });
});
