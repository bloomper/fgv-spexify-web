import {beforeEach, describe, expect, it, vi} from "vitest";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AlbumForm} from "@/components/album/album-form.client";

const searchSpexAction = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => ({error: vi.fn()}));

vi.mock("@/app/(app)/manage/actions.server", () => ({searchSpexAction}));
vi.mock("sonner", () => ({toast}));

const KINDS = [
    {id: "k-show", nameSv: "Föreställning", nameEn: "Show"},
    {id: "k-studio", nameSv: "Studio", nameEn: "Studio"},
    {id: "k-compilation", nameSv: "Samling", nameEn: "Compilation"},
];
const NOBEL = {id: "6", title: "Nobel", year: 1975, revival: false, parentId: null, categoryName: "Chalmersspexet"};
const NOBEL_REVIVAL = {id: "7", title: "Nobel", year: 1992, revival: true, parentId: "6", categoryName: "Chalmersspexet"};
const CLEOPATRA = {id: "8", title: "Cleopatra", year: 2024, revival: false, parentId: null, categoryName: "Chalmersspexet"};

describe("AlbumForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        searchSpexAction.mockResolvedValue({ok: true, data: [NOBEL, NOBEL_REVIVAL]});
    });

    it("needs a spex, or no spex marked and a title, before it can be saved, and sends empty fields as null", async () => {
        const onSubmit = vi.fn().mockResolvedValue(true);

        render(<AlbumForm kinds={KINDS} submitLabel="Spara" onSubmit={onSubmit}/>);
        expect(screen.getByRole("button", {name: "Spara"})).toBeDisabled();

        await userEvent.type(screen.getByLabelText("title"), "  Blandade visor ");
        expect(screen.getByRole("button", {name: "Spara"})).toBeDisabled();

        await userEvent.click(screen.getByRole("checkbox", {name: "none"}));
        expect(screen.queryByLabelText("search")).not.toBeInTheDocument();
        expect(screen.getByText("noneHint")).toBeInTheDocument();
        expect(screen.getByLabelText("title")).toBeRequired();
        await userEvent.selectOptions(screen.getByLabelText("kind"), "Samling");
        await userEvent.click(screen.getByRole("button", {name: "Spara"}));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
            spexIds: [], title: "Blandade visor", year: null, kindId: "k-compilation", description: null,
        }));
    });

    it("searches Spexregister after two letters and picks a spex", async () => {
        const onSubmit = vi.fn().mockResolvedValue(true);

        render(<AlbumForm kinds={KINDS} submitLabel="Spara" onSubmit={onSubmit}/>);
        await userEvent.type(screen.getByLabelText("search"), "N");
        await new Promise(resolve => setTimeout(resolve, 350));
        expect(searchSpexAction).not.toHaveBeenCalled();

        await userEvent.type(screen.getByLabelText("search"), "o");
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
            spexIds: ["7"], title: null, year: 1993, kindId: "k-show", description: "Inspelad live",
        }));
    });

    it("tells when the search fails", async () => {
        searchSpexAction.mockResolvedValue({ok: false, code: "UNAVAILABLE", message: "Spexregister svarar inte"});

        render(<AlbumForm kinds={KINDS} submitLabel="Spara" onSubmit={vi.fn()}/>);
        await userEvent.type(screen.getByLabelText("search"), "Ali");

        await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Spexregister svarar inte"));
    });

    it("starts from an album's values, adds more spex and makes another the main one", async () => {
        const onSubmit = vi.fn().mockResolvedValue(true);

        searchSpexAction.mockResolvedValue({ok: true, data: [CLEOPATRA]});
        render(<AlbumForm kinds={KINDS} submitLabel="Spara" onSubmit={onSubmit} initial={{
            spex: [NOBEL_REVIVAL], title: "Nobel – live", year: 1992, kindId: "k-studio", description: "Text",
        }}/>);

        expect(screen.getByLabelText("title")).toHaveValue("Nobel – live");
        expect(screen.getByLabelText("year")).toHaveValue("1992");
        expect(screen.getByLabelText("kind")).toHaveValue("k-studio");
        expect(screen.getByRole("checkbox", {name: "none"})).not.toBeChecked();
        expect(screen.getByRole("list", {name: "picked"})).toHaveTextContent(/Nobel 1992/);

        await userEvent.type(screen.getByLabelText("searchMore"), "Cleo");
        await userEvent.click(await screen.findByRole("button", {name: /Cleopatra 2024/}));
        const picked = screen.getByRole("list", {name: "picked"});

        expect(within(picked).getAllByRole("listitem")[0]).toHaveTextContent("main");
        await userEvent.click(within(picked).getByRole("button", {name: /makeMainOf.*Cleopatra 2024/}));
        expect(within(picked).getAllByRole("listitem")[0]).toHaveTextContent(/Cleopatra 2024/);
        expect(screen.getByLabelText("title")).toHaveAttribute("placeholder", "Cleopatra");
        await userEvent.click(screen.getByRole("button", {name: "Spara"}));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({spexIds: ["8", "7"]})));
    });

    it("starts with no spex marked for an album without spex", () => {
        render(<AlbumForm kinds={KINDS} submitLabel="Spara" onSubmit={vi.fn()} initial={{
            spex: [], title: "Jubileum", year: 2023, kindId: "k-compilation",
        }}/>);

        expect(screen.getByRole("checkbox", {name: "none"})).toBeChecked();
        expect(screen.getByRole("button", {name: "Spara"})).toBeEnabled();
    });
});
