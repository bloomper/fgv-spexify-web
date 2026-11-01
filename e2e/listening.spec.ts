import {expect, test} from "./fixtures";

test.describe("Listening", () => {
    test("plays an album and shows what plays in the player", async ({page, loginAs}) => {
        await loginAs("listener");
        await page.goto("/albums/1");

        await expect(page.getByRole("heading", {level: 1, name: "Nobel"})).toBeVisible();
        await expect(page.getByText("Melodi: Dancing Queen (ABBA)").first()).toBeVisible();
        await page.getByRole("button", {name: "Spela allt"}).click();

        const player = page.getByRole("region", {name: "Spelare"});

        await expect(player).toContainText("Ouvertyr");
        await player.getByRole("button", {name: "Nästa"}).click();
        await expect(player).toContainText("Kärleksduetten");
        await player.getByRole("button", {name: "Text"}).click();
        await expect(page.getByText("Här står vi nu på scenen")).toBeVisible();
    });

    test("stars a track and finds it under Starred", async ({page, loginAs, mock}) => {
        await loginAs("listener");
        await page.goto("/albums/1");
        await page.getByRole("button", {name: "Stjärnmärk Kärleksduetten"}).click();
        await expect(page.getByRole("button", {name: "Ta bort stjärnan från Kärleksduetten"})).toBeVisible();
        // The star shows at once and is saved in the background; leaving the page before that would cancel it
        await expect.poll(async () => (await mock.state()).starred).toHaveLength(1);

        await page.goto("/starred");
        await expect(page.getByText("Kärleksduetten")).toBeVisible();
    });

    test("searches tracks", async ({page, loginAs}) => {
        await loginAs("listener");
        await page.getByRole("searchbox", {name: "Sök låt, spex, melodi…"}).fill("duett");
        await page.keyboard.press("Enter");

        await expect(page.getByRole("heading", {name: "Sökresultat för ”duett”"})).toBeVisible();
        await expect(page.getByText("Kärleksduetten")).toBeVisible();
    });
});

test.describe("Editing", () => {
    test("shows unpublished albums to editors and creates an album from a spex", async ({page, loginAs}) => {
        await loginAs("editor");
        await page.goto("/manage/albums");
        await expect(page.getByRole("link", {name: "Opublicerat album"})).toBeVisible();

        await page.getByText("Nytt album").click();
        await page.getByLabel("Spex", {exact: true}).fill("Nob");
        await page.getByRole("button", {name: /Nobel 1975/}).click();
        await page.getByRole("button", {name: "Skapa"}).click();
        await expect(page).toHaveURL(/\/manage\/albums\/\d+$/);
        await expect(page.getByRole("switch").first()).not.toBeChecked();
    });
});
