import {expect, test} from "./fixtures";

const WIDTH = 375;

test.describe("Phone width: no page scrolls sideways", () => {
    test.beforeEach(async ({page}) => {
        await page.setViewportSize({width: WIDTH, height: 812});
    });

    test("the listening pages fit the screen, with the player open", async ({page, loginAs}) => {
        await loginAs("listener");
        await page.goto("/albums/1");
        await page.getByRole("button", {name: "Spela allt"}).click();

        for (const path of ["/", "/albums", "/albums/1", "/apps", "/starred", "/search?q=duett"]) {
            await page.goto(path);
            await page.getByRole("heading", {level: 1}).first().waitFor();
            expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(WIDTH);
        }
    });

    test("the editing and admin pages fit the screen", async ({page, loginAs}) => {
        await page.setViewportSize({width: WIDTH, height: 812});
        await loginAs("admin");

        for (const path of ["/manage/albums", "/manage/albums/1", "/manage/trash", "/manage/audit", "/admin/users", "/admin/library", "/admin/settings"]) {
            await page.goto(path);
            await page.getByRole("heading", {level: 1}).first().waitFor();
            expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBeLessThanOrEqual(WIDTH);
            // Tables may scroll inside their frame, but not so far that their last column is out of sight
            for (const table of await page.locator("table").all()) {
                expect(await table.evaluate(element => element.scrollWidth), path).toBeLessThanOrEqual(WIDTH);
            }
        }
    });
});
