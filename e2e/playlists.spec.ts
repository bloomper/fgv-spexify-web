import {expect, test} from "./fixtures";

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
        await page.goto("/albums/1");
        await page.getByRole("button", {name: "Mer för Kärleksduetten"}).click();
        await page.getByRole("menuitem", {name: "Lägg till i Favoriter"}).click();
        await expect(page.getByText("Tillagd i spellistan")).toBeVisible();

        page.once("dialog", dialog => dialog.accept("Duetter"));
        await page.getByRole("button", {name: "Mer för Kärleksduetten"}).click();
        await page.getByRole("menuitem", {name: "Ny spellista…"}).click();
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
        page.once("dialog", dialog => dialog.accept());
        await page.getByRole("button", {name: "Radera spellistan"}).click();

        await expect(page).toHaveURL(/\/playlists$/);
        await expect(page.getByText("Du har inga spellistor ännu.")).toBeVisible();
    });

    test("says so when the music server does not answer, and the albums still play", async ({page, mock}) => {
        await mock.navidrome(false);
        await page.goto("/playlists");
        await expect(page.getByText("Musikservern svarar inte just nu.")).toBeVisible();

        await page.goto("/albums/1");
        await page.getByRole("button", {name: "Spela allt"}).click();
        await expect(page.getByRole("region", {name: "Spelare"})).toContainText("Ouvertyr");
    });
});
