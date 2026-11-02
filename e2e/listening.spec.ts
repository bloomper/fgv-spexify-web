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
        await page.getByLabel("Sök spex på titel eller år").fill("Nob");
        await page.getByRole("button", {name: /Nobel 1975/}).click();
        await page.getByRole("button", {name: "Skapa"}).click();
        await expect(page).toHaveURL(/\/manage\/albums\/[0-9a-f-]{36}$/);
        await expect(page.getByRole("switch").first()).not.toBeChecked();

        // The next new album starts without the previous one's spex, although the page stayed mounted
        await page.goBack();
        await expect(page).toHaveURL(/\/manage\/albums\/new$/);
        await expect(page.getByLabel("Sök spex på titel eller år").filter({visible: true})).toHaveValue("");
        await expect(page.getByRole("list", {name: "Valda spex"}).filter({visible: true})).toHaveCount(0);
    });

    test("creates an album about an original and its revival, shown together, and one about no spex", async ({page, loginAs}) => {
        await loginAs("editor");
        await page.goto("/manage/albums/new");
        await page.getByLabel("Sök spex på titel eller år").fill("Nob");
        await page.getByRole("button", {name: /Nobel 2026 \(nyuppsättning\)/}).click();
        await page.getByLabel("Lägg till fler spex, t.ex. för en samling").fill("Nob");
        await expect(page.getByRole("button", {name: /Nobel 2026/}).filter({hasText: "vald"})).toBeDisabled();
        await page.getByRole("button", {name: /Nobel 1975/}).click();
        await page.getByRole("button", {name: "Gör Nobel 1975 till huvudspex"}).click();
        await expect(page.getByRole("list", {name: "Valda spex"}).getByRole("listitem").first()).toContainText("Huvudspex");
        await page.getByLabel("Titel").fill("Nobel genom tiderna");
        await page.getByRole("button", {name: "Skapa"}).click();
        await expect(page).toHaveURL(/\/manage\/albums\/[0-9a-f-]{36}$/);
        await page.getByRole("switch").first().click();
        await expect(page.getByRole("switch").first()).toBeChecked();

        await page.goto(`/albums/${uuidOf(1)}`);
        const same = page.getByRole("region", {name: "Mer från samma spex"});
        await expect(same.getByRole("link", {name: /Nobel genom tiderna/})).toBeVisible();
        await page.getByRole("link", {name: "Alla album från Nobel"}).click();
        await expect(page.getByText("Album från Nobel, med nyuppsättningar")).toBeVisible();
        await expect(page.getByRole("link", {name: /Nobel genom tiderna/})).toBeVisible();

        await page.goto("/manage/albums/new");
        await expect(page.getByRole("button", {name: "Skapa"}).filter({visible: true})).toBeDisabled();
        await page.getByRole("checkbox", {name: "Inte kopplat till något spex"}).filter({visible: true}).click();
        await page.getByLabel("Titel").filter({visible: true}).fill("Jubileumskonserten");
        await page.getByRole("button", {name: "Skapa"}).filter({visible: true}).click();
        await expect(page.getByRole("heading", {level: 1, name: "Jubileumskonserten"})).toBeVisible();
        await expect(page.getByRole("checkbox", {name: "Inte kopplat till något spex"})).toBeChecked();
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

test.describe("Ratings and starred albums", () => {
    test("rates an album and a track, and the album is listed as highest rated", async ({page, loginAs, mock}) => {
        await loginAs("listener");
        await page.goto(`/albums/${uuidOf(1)}`);

        await page.getByRole("radiogroup", {name: "Ditt betyg för albumet"}).getByRole("radio", {name: "4 stjärnor"}).click();
        await expect.poll(async () => (await mock.state()).ratings["al-1"]).toBe(4);

        await page.getByRole("button", {name: "Mer för Ouvertyr"}).click();
        await page.getByRole("radiogroup", {name: "Betyg för Ouvertyr"}).getByRole("radio", {name: "5 stjärnor"}).click();
        await expect.poll(async () => (await mock.state()).ratings[`nd-${uuidOf(11)}`]).toBe(5);
        await page.keyboard.press("Escape");

        await page.goto("/");
        const highest = page.getByRole("region", {name: "Högst betyg av dig"});

        await expect(highest.getByRole("link", {name: /Nobel/})).toBeVisible();
        await expect(highest.getByText("Betyg: 4 stjärnor")).toBeVisible();

        await page.goto(`/albums/${uuidOf(1)}`);
        await expect(page.getByRole("radiogroup", {name: "Ditt betyg för albumet"}).getByRole("radio", {name: "4 stjärnor"}))
            .toHaveAttribute("aria-checked", "true");
        await expect(page.getByRole("listitem").filter({hasText: "Ouvertyr"}).getByRole("img", {name: "Betyg: 5 stjärnor"})).toBeVisible();
    });

    test("stars an album and finds it under Starred", async ({page, loginAs, mock}) => {
        await loginAs("listener");
        await page.goto(`/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Stjärnmärk albumet"}).click();
        await expect(page.getByRole("button", {name: "Ta bort albumets stjärna"})).toBeVisible();
        await expect.poll(async () => (await mock.state()).starredAlbums).toEqual(["al-1"]);

        await page.goto("/starred");
        await expect(page.getByRole("region", {name: "Album"}).getByRole("link", {name: /Nobel/})).toBeVisible();
    });
});

test.describe("The play queue", () => {
    test("takes up the queue saved by an app, paused where it was left", async ({page, loginAs, mock}) => {
        await mock.playQueue({ids: [`nd-${uuidOf(11)}`, `nd-${uuidOf(12)}`], current: `nd-${uuidOf(12)}`, position: 30_000});
        await loginAs("listener");

        const player = page.getByRole("region", {name: "Spelare"});

        await expect(player).toContainText("Kärleksduetten");
        // Paused: the mock's audio cannot be decoded, so the button may offer to retry, but never to pause
        await expect(player.getByRole("button", {name: "Pausa", exact: true})).toHaveCount(0);
        await expect(player).toContainText("0:30");
    });

    test("saves the queue for the listener's apps", async ({page, loginAs, mock}) => {
        await loginAs("listener");
        await page.goto(`/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Spela Kärleksduetten"}).click();

        await expect.poll(async () => (await mock.state()).playQueue)
            .toMatchObject({ids: [`nd-${uuidOf(11)}`, `nd-${uuidOf(12)}`], current: `nd-${uuidOf(12)}`});
    });
});

test.describe("Playing more", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("listener");
    });

    test("edits the queue, sets the volume and plays with the keyboard", async ({page}) => {
        await page.goto(`/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Spela allt"}).click();

        const player = page.getByRole("region", {name: "Spelare"});

        await expect(player).toContainText("Ouvertyr");
        await player.getByRole("button", {name: "Kö"}).click();
        const queue = page.getByRole("dialog");

        await expect(queue.getByRole("listitem")).toHaveCount(2);
        await queue.getByRole("button", {name: "Flytta ner Ouvertyr"}).click();
        await expect(queue.getByRole("listitem").first()).toContainText("Kärleksduetten");
        await queue.getByRole("button", {name: "Ta bort Kärleksduetten ur kön"}).click();
        await expect(queue.getByRole("listitem")).toHaveCount(1);
        await page.keyboard.press("Escape");
        await expect(player).toContainText("Ouvertyr");

        await player.getByRole("button", {name: "Stäng av ljudet"}).click();
        await expect(player.getByRole("button", {name: "Slå på ljudet"})).toBeVisible();
        await page.reload();
        await page.getByRole("button", {name: "Spela allt"}).click();
        await expect(page.getByRole("region", {name: "Spelare"}).getByRole("button", {name: "Slå på ljudet"})).toBeVisible();

        await page.keyboard.press("?");
        await expect(page.getByRole("dialog", {name: "Kortkommandon"})).toBeVisible();
        await page.keyboard.press("Escape");

        await page.getByRole("region", {name: "Spelare"}).getByRole("button", {name: "Uppspelning"}).click();
        await page.getByRole("menuitemradio", {name: "Per album"}).click();
        await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("spexify.player") ?? "{}").replayGain)).toBe("album");
    });

    test("starts radio from a track and browses credits", async ({page}) => {
        await page.goto(`/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Mer för Kärleksduetten"}).click();
        await page.getByRole("menuitem", {name: "Starta radio"}).click();
        await expect(page.getByRole("region", {name: "Spelare"})).toContainText("Kärleksduetten");

        await page.getByRole("link", {name: "Drottningen"}).first().click();
        await expect(page.getByRole("heading", {level: 1, name: "Drottningen"})).toBeVisible();
        await expect(page.getByText("Ouvertyr").filter({visible: true})).toBeVisible();

        await page.getByRole("link", {name: "Sångare"}).click();
        await page.getByRole("link", {name: "Originalartister"}).click();
        await expect(page.getByRole("link", {name: /ABBA/})).toBeVisible();
    });
});
