import {expect, test} from "./fixtures";

test.describe("Language", () => {
    test("switches to English and back, and remembers it", async ({page, loginAs}) => {
        await loginAs("admin");
        await page.getByRole("button", {name: "Byt språk"}).click();
        await page.getByRole("menuitem", {name: "English"}).click();

        await expect(page.getByRole("link", {name: "Albums", exact: true}).first()).toBeVisible();
        await expect(page.getByRole("link", {name: "My apps"})).toBeVisible();
        await page.goto("/albums/1");
        await expect(page.getByRole("button", {name: "Play all"})).toBeVisible();

        await page.getByRole("button", {name: "Change language"}).click();
        await page.getByRole("menuitem", {name: "Svenska"}).click();
        await expect(page.getByRole("button", {name: "Spela allt"})).toBeVisible();
    });
});

test.describe("Visitor statistics", () => {
    test("no tracker is loaded without Umami's address and website", async ({page, loginAs}) => {
        await loginAs("listener");
        await expect(page.locator("script[src='/stats/script.js']")).toHaveCount(0);
    });
});
