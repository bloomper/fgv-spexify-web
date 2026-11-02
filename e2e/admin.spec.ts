import {answerDialog, expect, test} from "./fixtures";

test.describe("Administration", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("admin");
    });

    test("shows the music server and asks it to read the music folder again", async ({page, mock}) => {
        await page.goto("/admin/library");
        await expect(page.getByText("Svarar", {exact: true})).toBeVisible();
        await expect(page.getByText("2 publicerade av 3")).toBeVisible();

        await page.getByRole("button", {name: "Läs in igen"}).click();
        await expect(page.getByText("Inläsningen startar inom tio sekunder")).toBeVisible();
        expect((await mock.state()).scanRequested).toBe(true);
        await expect(page.getByText("Väntar", {exact: true})).toBeVisible();
    });

    test("shows when the music server does not answer", async ({page, mock}) => {
        await mock.navidrome(false);
        await page.goto("/admin/library");
        await expect(page.getByText("Svarar inte", {exact: true})).toBeVisible();
    });

    test("lifts a lock-out and revokes a user's app passwords", async ({page}) => {
        await page.goto("/admin/users");
        const olle = page.getByRole("row", {name: /Olle Spärrad/});
        const lisa = page.getByRole("row", {name: /Lisa Lyssnare/});

        await expect(olle.getByText("Spärrad", {exact: true})).toBeVisible();
        await olle.getByRole("button", {name: "Häv spärren"}).click();
        await expect(page.getByText("Spärren är hävd")).toBeVisible();
        await expect(olle.getByRole("button", {name: "Häv spärren"})).toHaveCount(0);

        await lisa.getByRole("button", {name: "Återkalla allt"}).click();
        await answerDialog(page, "Återkalla allt");
        await expect(page.getByText("Återkallat", {exact: true})).toBeVisible();
        await expect(lisa.getByRole("button", {name: "Återkalla allt"})).toHaveCount(0);
    });

    test("changes the settings, and the welcome text is shown on the start page", async ({page}) => {
        await page.goto("/admin/settings");
        await page.getByLabel("Välkomsttext (svenska)").fill("Välkommen till spexens musik!");
        await page.getByLabel("Misslyckade inloggningar före spärr").fill("5");
        await page.getByRole("button", {name: "Spara"}).click();
        await expect(page.getByText("Sparat")).toBeVisible();

        await page.goto("/");
        await expect(page.getByText("Välkommen till spexens musik!")).toBeVisible();
    });

    test("is not for editors", async ({page, loginAs}) => {
        await loginAs("editor");
        for (const path of ["/admin/library", "/admin/users", "/admin/settings"]) {
            await page.goto(path);
            await expect(page.getByRole("heading", {level: 1, name: /Musikservern|Användare|Inställningar/})).toHaveCount(0);
        }
    });
});
