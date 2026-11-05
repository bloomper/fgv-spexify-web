import { uuidOf } from "./constants";
import { expect, test } from "./fixtures";

test.describe("Collections and the top list", () => {
  test("an editor gathers albums in a collection that listeners find from the album", async ({ page, loginAs }) => {
    await loginAs("editor");
    await page.goto("/manage/collections/new");
    await page.getByLabel("Titel").fill("Nobel genom åren");
    await page.getByLabel("Lägg till album").selectOption({ label: "Nobel, 1975" });
    await page.getByRole("button", { name: "Lägg till", exact: true }).click();
    await page.getByRole("button", { name: "Skapa" }).click();
    await expect(page).toHaveURL(/\/manage\/collections\/[0-9a-f-]{36}$/);

    await loginAs("listener");
    await page.goto(`/albums/${uuidOf(1)}`);
    await page.getByRole("link", { name: "Nobel genom åren" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Nobel genom åren" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Nobel/ }).last()).toBeVisible();
    await page.goto("/collections");
    await expect(page.getByText("1 album")).toBeVisible();
  });

  test("the top list ranks by tabs, switches between songs and albums and says each number", async ({ page, loginAs }) => {
    await loginAs("listener");
    // Something liked, as the mock starts with nobody having done anything
    await page.goto(`/albums/${uuidOf(1)}`);
    await page.getByRole("button", { name: "Gilla Ouvertyr" }).click();
    await expect(page.getByRole("button", { name: "Sluta gilla Ouvertyr" })).toBeVisible();
    await page.goto("/top");

    const ranking = page.getByRole("navigation", { name: "Rangordna efter" });

    await expect(ranking.getByRole("link", { name: "Högst betyg" })).toHaveAttribute("aria-current", "page");
    await ranking.getByRole("link", { name: "Mest gillat" }).click();
    await expect(page).toHaveURL(/by=LIKED/);
    await expect(page.getByRole("listitem").filter({ hasText: "Ouvertyr" })).toContainText("1 gillar");
    // Songs from many albums show the album's cover and title, not a track number
    await expect(page.getByRole("listitem").filter({ hasText: "Ouvertyr" }).getByRole("link", { name: "Nobel" })).toBeVisible();

    await page.getByRole("navigation", { name: "Visa" }).getByRole("link", { name: "Album" }).click();
    await expect(page).toHaveURL(/what=albums/);
    await expect(page).toHaveURL(/by=LIKED/);
  });
});
