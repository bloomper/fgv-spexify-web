import {expect, test} from "./fixtures";

test.describe("The application shell", () => {
    test("shows listening, editing and administration to an admin", async ({page, loginAs}) => {
        await loginAs("admin");

        const sidebar = page.locator('[data-slot="sidebar"]:visible');
        await expect(sidebar.getByRole("link", {name: "Hem"})).toHaveAttribute("href", "/");
        await expect(sidebar.getByRole("link", {name: "Album"}).first()).toHaveAttribute("href", "/albums");
        await expect(sidebar.getByRole("link", {name: "Mina appar"})).toBeVisible();
        await expect(sidebar.getByRole("link", {name: "Redigera"})).toBeVisible();
        await expect(sidebar.getByRole("link", {name: "Administration"})).toBeVisible();
    });

    test("hides editing and administration from a listener", async ({page, loginAs}) => {
        await loginAs("listener");

        const sidebar = page.locator('[data-slot="sidebar"]:visible');
        await expect(sidebar.getByRole("link", {name: "Stjärnmärkt"})).toBeVisible();
        await expect(sidebar.getByRole("link", {name: "Redigera"})).toHaveCount(0);
        await expect(sidebar.getByRole("link", {name: "Administration"})).toHaveCount(0);
        await page.goto("/admin/library");
        await expect(page.getByRole("heading", {name: "Du har inte behörighet"})).toBeVisible();
    });

    test("greets the user and lists the recently published albums", async ({page, loginAs}) => {
        await loginAs("listener");

        await expect(page.getByRole("heading", {level: 1, name: "Hej Lisa Lyssnare!"})).toBeVisible();
        await expect(page.getByRole("link", {name: /Nobel/})).toBeVisible();
        await expect(page.getByText("Opublicerat album")).toHaveCount(0);
    });
});
