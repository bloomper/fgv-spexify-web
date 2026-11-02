import {uuidOf} from "./constants";
import {expect, test} from "./fixtures";

test.describe("Listening", () => {
    test("plays an album and shows what plays in the player", async ({page, loginAs}) => {
        await loginAs("listener");
        await page.goto(`/albums/${uuidOf(1)}`);

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
        await page.goto(`/albums/${uuidOf(1)}`);
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
        await expect(page).toHaveURL(/\/manage\/albums\/[0-9a-f-]{36}$/);
        await expect(page.getByRole("switch").first()).not.toBeChecked();
    });
});

test.describe("What the listener played", () => {
    test("the start page shows recently and most played albums, and the album how often each track was played", async ({page, loginAs, mock}) => {
        await mock.plays({
            "al-1": {playCount: 5, played: "2026-10-31T18:00:00Z"},
            [`nd-${uuidOf(11)}`]: {playCount: 3, played: "2026-10-31T18:00:00Z"},
        });
        await loginAs("listener");

        const recently = page.getByRole("region", {name: "Senast spelat av dig"});
        const most = page.getByRole("region", {name: "Mest spelat av dig"});

        await expect(recently.getByRole("link", {name: /Nobel/})).toBeVisible();
        await expect(recently.getByText("Spelat 2026-10-31")).toBeVisible();
        await expect(most.getByText("5 spelningar")).toBeVisible();

        await page.goto(`/albums/${uuidOf(1)}`);
        const ouvertyr = page.getByRole("listitem").filter({hasText: "Ouvertyr"});

        await expect(ouvertyr.getByText("Spelad 3 gånger")).toBeVisible();
        await expect(ouvertyr.getByText("2026-10-31")).toBeVisible();
        await expect(page.getByRole("listitem").filter({hasText: "Kärleksduetten"}).getByText("Inte spelad")).toBeVisible();
    });

    test("without plays the start page has no played rows", async ({page, loginAs}) => {
        await loginAs("listener");

        await expect(page.getByRole("heading", {name: "Senast publicerat"})).toBeVisible();
        await expect(page.getByRole("heading", {name: "Senast spelat av dig"})).toHaveCount(0);
    });

    test("hovering a track shows a play button in place of its number", async ({page, loginAs}) => {
        await loginAs("listener");
        await page.goto(`/albums/${uuidOf(1)}`);

        const row = page.getByRole("listitem").filter({hasText: "Kärleksduetten"});
        const play = row.getByRole("button", {name: "Spela Kärleksduetten"});

        await expect(play.getByText("2", {exact: true})).toBeVisible();
        await expect(play.getByTestId("hover-play")).toBeHidden();
        await row.hover();
        await expect(play.getByTestId("hover-play")).toBeVisible();
        await expect(play.getByText("2", {exact: true})).toBeHidden();
    });

    test("with the player open, the account menu and logout are still reachable", async ({page, loginAs}) => {
        await page.setViewportSize({width: 1280, height: 720});
        await loginAs("listener");
        await page.goto(`/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Spela allt"}).click();

        const player = page.getByRole("region", {name: "Spelare"});

        await expect(player).toContainText("Ouvertyr");

        const account = page.locator("[data-sidebar=footer]").getByRole("button").first();
        const accountBox = await account.boundingBox();
        const playerBox = await player.boundingBox();

        expect(accountBox!.y + accountBox!.height).toBeLessThanOrEqual(playerBox!.y);
        await account.click();
        await expect(page.getByRole("menuitem", {name: "Logga ut"})).toBeVisible();
    });
});
