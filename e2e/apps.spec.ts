import {expect, test} from "./fixtures";

test.describe("My apps", () => {
    test("creates an app password, shows it once and revokes it", async ({page, loginAs}) => {
        await loginAs("listener");
        await page.goto("/apps");

        await expect(page.getByLabel("Användarnamn", {exact: true})).toHaveValue("lisa@example.org");
        await page.getByLabel("Namn", {exact: true}).first().fill("Telefon, Symfonium");
        await page.getByRole("button", {name: "Skapa applösenord"}).click();
        await expect(page.getByText("Applösenordet är skapat")).toBeVisible();
        await expect(page.getByLabel("Lösenord", {exact: true})).toHaveValue("abcd-efgh-ijkm-npqr-stuv-wxyz");
        await page.getByRole("button", {name: "Klar"}).click();
        await expect(page.getByText("Telefon, Symfonium")).toBeVisible();

        page.once("dialog", dialog => dialog.accept());
        await page.getByRole("button", {name: "Återkalla"}).click();
        await expect(page.getByText("Telefon, Symfonium")).toHaveCount(0);
    });

    test("creates an API key, shows it once and revokes it", async ({page, loginAs}) => {
        await loginAs("listener");
        await page.goto("/apps");

        await page.getByLabel("Namn", {exact: true}).last().fill("Feishin");
        await page.getByRole("button", {name: "Skapa API-nyckel"}).click();
        await expect(page.getByText("API-nyckeln är skapad")).toBeVisible();
        await expect(page.getByLabel("API-nyckel", {exact: true})).toHaveValue("e2e-api-key-0123456789abcdef");
        await page.getByRole("button", {name: "Klar"}).click();
        await expect(page.getByText("Feishin")).toBeVisible();

        page.once("dialog", dialog => dialog.accept());
        await page.getByRole("button", {name: "Återkalla"}).click();
        await expect(page.getByText("Feishin")).toHaveCount(0);
    });
});
