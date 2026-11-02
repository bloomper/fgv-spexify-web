import {uuidOf} from "./constants";
import {answerDialog, expect, test} from "./fixtures";

test.describe("Album kinds", () => {
    test("an admin adds, renames and reorders kinds, and an editor picks one for an album", async ({page, loginAs, mock}) => {
        await loginAs("admin");
        await page.goto("/admin/kinds");
        await expect(page.getByRole("heading", {level: 1, name: "Albumsorter"})).toBeVisible();

        await page.getByLabel("Namn på svenska").last().fill("Trailer");
        await page.getByLabel("Namn på engelska").last().fill("Trailers");
        await page.getByRole("button", {name: "Lägg till sort"}).click();
        await expect(page.getByText("Sorten är tillagd")).toBeVisible();

        await page.getByRole("button", {name: "Ändra Trailer"}).click();
        await page.getByLabel("Namn på engelska").first().fill("Trailer");
        await page.getByRole("button", {name: "Spara"}).click();
        await expect(page.getByText("/ Trailer")).toBeVisible();

        await page.getByRole("button", {name: "Flytta upp Studio"}).click();
        await expect.poll(async () => (await mock.state()).kinds.find(kind => kind.nameSv === "Studio")?.position).toBe(1);
        await expect(page.getByRole("listitem").filter({hasText: "Studio"}).getByText("Förvald")).toBeVisible();

        await page.goto("/manage/albums/new");
        // The first kind is preselected
        await expect(page.getByLabel("Sort")).toHaveValue(uuidOf(902));
        await page.getByRole("checkbox", {name: "Inte kopplat till något spex"}).click();
        await page.getByLabel("Titel", {exact: true}).fill("Trailers 2026");
        await page.getByLabel("Sort").selectOption({label: "Trailer"});
        await page.getByRole("button", {name: "Skapa"}).click();
        await expect(page).toHaveURL(/\/manage\/albums\/[0-9a-f-]{36}$/);
        await expect(page.getByLabel("Sort").locator("option:checked")).toHaveText("Trailer");
    });

    test("a kind albums use cannot be deleted, an unused one can", async ({page, loginAs}) => {
        await loginAs("admin");
        await page.goto("/admin/kinds");

        await expect(page.getByRole("button", {name: "Radera Föreställning"})).toBeDisabled();
        await page.getByRole("button", {name: "Radera Övrigt"}).click();
        await answerDialog(page, "Radera");
        await expect(page.getByText("Sorten är raderad")).toBeVisible();
        await expect(page.getByRole("button", {name: "Radera Övrigt"})).toHaveCount(0);
    });

    test("albums show their kind by name, and the default kind is not shown as a badge", async ({page, loginAs}) => {
        await loginAs("editor");
        await page.goto("/manage/albums");

        const unpublished = page.getByRole("row", {name: /Opublicerat album/});

        await expect(unpublished.getByText("Studio")).toBeVisible();
        await expect(page.getByRole("row", {name: /Nobel/}).getByText("Föreställning")).toHaveCount(0);
        await expect(page.getByRole("link", {name: "Albumsorter"})).toHaveCount(0);
    });
});
