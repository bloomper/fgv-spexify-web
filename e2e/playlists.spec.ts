import {uuidOf} from "./constants";
import {answerDialog, expect, test} from "./fixtures";

test.describe("Playlists", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("listener");
    });

    test("lists the playlists and plays one", async ({page}) => {
        await page.goto("/playlists");
        await expect(page.getByText("1 låt")).toBeVisible();
        await page.getByRole("link", {name: /Favoriter/}).click();

        await expect(page.getByRole("heading", {level: 1, name: "Favoriter"})).toBeVisible();
        await expect(page.getByText("Ouvertyr")).toBeVisible();
    });

    test("adds a track to a playlist and to a new one, and removes it again", async ({page}) => {
        await page.goto(`/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Mer för Kärleksduetten"}).click();
        await page.getByRole("menuitem", {name: "Lägg till i Favoriter"}).click();
        await expect(page.getByText("Tillagd i spellistan")).toBeVisible();

        await page.getByRole("button", {name: "Mer för Kärleksduetten"}).click();
        await page.getByRole("menuitem", {name: "Ny spellista…"}).click();
        await expect(page.getByRole("dialog", {name: "Ny spellista"})).toBeVisible();
        await answerDialog(page, "Skapa", "Duetter");
        await expect(page.getByText("Tillagd i spellistan")).toHaveCount(2);

        await page.goto("/playlists");
        await expect(page.getByRole("link", {name: /Duetter/})).toBeVisible();
        await page.getByRole("link", {name: /Favoriter/}).click();
        await expect(page.getByText("Kärleksduetten")).toBeVisible();
        await page.getByRole("button", {name: "Mer för Kärleksduetten"}).click();
        await page.getByRole("menuitem", {name: "Ta bort ur spellistan"}).click();
        await expect(page.getByText("Kärleksduetten")).toHaveCount(0);
    });

    test("deletes a playlist", async ({page}) => {
        await page.goto("/playlists");
        await page.getByRole("link", {name: /Favoriter/}).click();
        await page.getByRole("button", {name: "Radera spellistan"}).click();
        await answerDialog(page, "Radera spellistan");

        await expect(page).toHaveURL(/\/playlists$/);
        await expect(page.getByText("Du har inga spellistor ännu.")).toBeVisible();
    });

    test("says so when the music server does not answer, and the albums still play", async ({page, mock}) => {
        await mock.navidrome(false);
        await page.goto("/playlists");
        await expect(page.getByText("Musikservern svarar inte just nu.")).toBeVisible();

        await page.goto(`/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Spela allt"}).click();
        await expect(page.getByRole("region", {name: "Spelare"})).toContainText("Ouvertyr");
    });

    test("renames a playlist, makes it public and moves its tracks", async ({page, mock}) => {
        await page.goto(`/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Mer för Kärleksduetten"}).click();
        await page.getByRole("menuitem", {name: "Lägg till i Favoriter"}).click();
        await expect(page.getByText("Tillagd i spellistan")).toBeVisible();

        await page.goto("/playlists/pl-1");
        await page.getByRole("button", {name: "Byt namn"}).click();
        await answerDialog(page, "Spara", "Bästa låtarna");
        await expect(page.getByRole("heading", {level: 1, name: "Bästa låtarna"})).toBeVisible();

        await page.getByRole("button", {name: "Gör offentlig"}).click();
        await expect(page.getByText("Offentlig", {exact: true})).toBeVisible();

        await page.getByRole("button", {name: "Mer för Kärleksduetten"}).click();
        await page.getByRole("menuitem", {name: "Flytta upp"}).click();
        await expect.poll(async () => (await mock.state()).playlists[0].entries).toEqual([`nd-${uuidOf(12)}`, `nd-${uuidOf(11)}`]);
    });
});
