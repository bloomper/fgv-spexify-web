import {expect, test} from "./fixtures";

test.describe("Maintenance", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("admin");
    });

    test("lists the jobs and runs one", async ({page}) => {
        await page.goto("/admin/maintenance");
        await expect(page.getByRole("heading", {level: 1, name: "Underhåll"})).toBeVisible();

        const refresh = page.getByRole("listitem").filter({hasText: "Uppdatering av spex"});

        await expect(refresh.getByText("0 15 3 * * *")).toBeVisible();
        await expect(refresh.getByText("Inte sedan servern startade")).toBeVisible();

        await refresh.getByRole("button", {name: "Kör nu"}).click();
        await expect(page.getByText("Uppdatering av spex har startat. Det körs i bakgrunden.")).toBeVisible();
        await expect(refresh.getByText(/^Lyckades/)).toBeVisible();
    });

    test("a running job cannot be started again", async ({page}) => {
        await page.goto("/admin/maintenance");

        const cleanup = page.getByRole("listitem").filter({hasText: "Städning av uppladdningar"});

        await expect(cleanup.getByText("Körs", {exact: true})).toBeVisible();
        await expect(cleanup.getByRole("button", {name: "Kör nu"})).toBeDisabled();
    });
});
