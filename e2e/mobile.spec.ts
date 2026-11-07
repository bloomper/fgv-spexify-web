import type { Page } from "@playwright/test";
import { uuidOf } from "./constants";
import { expect, test } from "./fixtures";

/** A small phone, a common phone and a tablet held upright. */
const WIDTHS = [360, 390, 768];

const LISTENING = ["/", "/albums", `/albums/${uuidOf(1)}`, "/apps", "/starred", "/top", "/top?what=albums", "/search",
  "/search?q=duett"];
const EDITING = ["/manage/albums", `/manage/albums/${uuidOf(1)}`, "/manage/trash", "/manage/audit", "/admin/users",
  "/admin/library", "/admin/kinds", "/admin/settings"];

async function fits(page: Page, path: string, width: number) {
  await page.goto(path);
  await page.getByRole("heading", { level: 1 }).first().waitFor();
  expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path} at ${width} px`).toBeLessThanOrEqual(width);
  // Tables may scroll inside their frame, but not so far that their last column is out of sight
  for (const table of await page.locator("table").all()) {
    expect(await table.evaluate(element => element.scrollWidth), `${path} at ${width} px`).toBeLessThanOrEqual(width);
  }
}

test.describe("Phones and tablets: no page scrolls sideways", () => {
  for (const width of WIDTHS) {
    test.describe(`${width} px`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
      });

      test("the listening pages fit the screen, with the player open", async ({ page, loginAs }) => {
        await loginAs("listener");
        await page.goto(`/albums/${uuidOf(1)}`);
        await page.getByRole("button", { name: "Spela allt" }).click();

        for (const path of LISTENING) {
          await fits(page, path, width);
        }
      });

      test("the editing and admin pages fit the screen", async ({ page, loginAs }) => {
        await loginAs("admin");

        for (const path of EDITING) {
          await fits(page, path, width);
        }
      });
    });
  }
});

test.describe("The header on a phone", () => {
  test("shows the application's whole name, every control on screen, and search as a button to the search page", async ({ page, loginAs }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await loginAs("listener");

    const header = page.locator("header").first();
    const name = header.getByText("Spexify", { exact: true });

    await expect(name).toBeVisible();
    expect(await name.evaluate(element => element.scrollWidth <= element.clientWidth), "the name is not cut off").toBe(true);
    await expect(header.getByRole("searchbox")).toBeHidden();
    await expect(header.getByRole("button", { name: "Visa eller dölj menyn" })).toBeVisible();

    // The sidebar button, the name, search, language and theme: all on screen, none on top of another
    const boxes: { x: number; width: number }[] = [];

    for (const control of [...await header.getByRole("button").all(), ...await header.getByRole("link").all(), name]) {
      if (await control.isVisible()) {
        boxes.push((await control.boundingBox())!);
      }
    }
    expect(boxes.length).toBeGreaterThanOrEqual(5);
    for (const box of boxes) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(360);
    }
    for (const [i, a] of boxes.entries()) {
      for (const b of boxes.slice(i + 1)) {
        const apart = a.x + a.width <= b.x + 0.5 || b.x + b.width <= a.x + 0.5;

        expect(apart, "two controls overlap").toBe(true);
      }
    }

    await header.getByRole("link", { name: "Sök", exact: true }).click();
    await expect(page).toHaveURL(/\/search$/);
    await page.getByRole("searchbox", { name: "Sökord" }).fill("duett");
    await page.getByRole("searchbox", { name: "Sökord" }).press("Enter");
    await expect(page.getByRole("heading", { name: "Sökresultat för ”duett”" })).toBeVisible();
  });
});
