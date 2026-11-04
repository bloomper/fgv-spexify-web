import { uuidOf } from "./constants";
import { expect, test } from "./fixtures";

test.describe("When something is unavailable", () => {
  test("a new album cannot pick a spex while Spexregister is down, but the catalogue works", async ({
                                                                                                      page,
                                                                                                      loginAs,
                                                                                                      mock,
                                                                                                    }) => {
    await mock.spexregister(false);
    await loginAs("editor");
    await page.goto("/manage/albums/new");
    await page.getByLabel("Sök spex på titel eller år").fill("Nob");

    await expect(page.getByText("Spexregistret går inte att nå just nu. Försök igen om en stund.")).toBeVisible();
    await page.goto(`/albums/${uuidOf(1)}`);
    await expect(page.getByRole("heading", { level: 1, name: "Nobel" })).toBeVisible();
  });

  test("a failed server call is shown, and the page keeps working", async ({ page, loginAs, mock }) => {
    await mock.failNext("AlbumPublish", "INTERNAL_ERROR");
    await loginAs("editor");
    await page.goto(`/manage/albums/${uuidOf(2)}`);
    await page.getByRole("switch").first().click();

    await expect(page.getByText("Något gick fel.")).toBeVisible();
    await expect(page.getByRole("switch").first()).not.toBeChecked();
    await page.getByRole("switch").first().click();
    await expect(page.getByRole("switch").first()).toBeChecked();
  });

  test("an album that does not exist is not found", async ({ page, loginAs }) => {
    await loginAs("listener");
    await page.goto(`/albums/${uuidOf(999)}`);
    await expect(page.getByRole("heading", { name: "Sidan finns inte" })).toBeVisible();
  });
});
