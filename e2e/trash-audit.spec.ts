import {uuidOf} from "./constants";
import {expect, test} from "./fixtures";

test.describe("The trash", () => {
    test("an editor trashes an album and a track and restores them, but cannot delete", async ({page, loginAs, mock}) => {
        await loginAs("editor");
        await page.goto(`/manage/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Mer för Kärleksduetten"}).click();
        await page.getByRole("menuitem", {name: "Lägg i papperskorgen"}).click();
        await expect(page.getByText("Lagt i papperskorgen")).toBeVisible();

        page.once("dialog", dialog => dialog.accept());
        await page.getByRole("button", {name: "Lägg i papperskorgen"}).click();
        await expect(page).toHaveURL(/\/manage\/albums$/);

        await page.goto("/manage/trash");
        await expect(page.getByText("Nobel", {exact: true})).toBeVisible();
        await expect(page.getByRole("button", {name: "Radera"})).toHaveCount(0);
        await page.getByRole("button", {name: "Återställ"}).first().click();
        await expect(page.getByText("Nobel", {exact: true})).toHaveCount(0);
        expect((await mock.state()).albums.find(album => album.id === uuidOf(1))?.trashedAt).toBeNull();
    });

    test("an admin deletes from the trash and empties it", async ({page, loginAs, mock}) => {
        await loginAs("admin");
        await page.goto(`/manage/albums/${uuidOf(2)}`);
        page.on("dialog", dialog => dialog.accept());
        await page.getByRole("button", {name: "Lägg i papperskorgen"}).click();
        await page.goto(`/manage/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Mer för Ouvertyr"}).click();
        await page.getByRole("menuitem", {name: "Lägg i papperskorgen"}).click();
        await expect(page.getByText("Lagt i papperskorgen")).toBeVisible();

        await page.goto("/manage/trash");
        await page.getByRole("listitem").filter({hasText: "Opublicerat album"}).getByRole("button", {name: "Radera"}).click();
        await expect(page.getByText("Opublicerat album")).toHaveCount(0);
        await page.getByRole("button", {name: "Töm papperskorgen"}).click();
        await expect(page.getByText("Papperskorgen är tom.")).toBeVisible();
        expect((await mock.state()).tracks.map(track => track.title)).toEqual(["Kärleksduetten"]);
    });
});

test.describe("The change log", () => {
    test("shows editors their own changes and admins everyone's", async ({page, loginAs}) => {
        await loginAs("editor");
        await page.goto(`/manage/albums/${uuidOf(2)}`);
        await page.getByRole("switch").first().click();
        await expect(page.getByText("Publicerat", {exact: true})).toBeVisible();

        await page.goto("/manage/audit");
        await expect(page.getByText("Publicerade albumet Opublicerat album")).toBeVisible();
        await expect(page.getByText("Erik Redaktör").first()).toBeVisible();

        await loginAs("admin");
        await page.goto(`/manage/albums/${uuidOf(1)}`);
        await page.getByRole("switch").first().click();
        await expect(page.getByText("Opublicerat", {exact: true}).first()).toBeVisible();
        await page.goto("/manage/audit");
        await expect(page.getByText("Avpublicerade albumet Nobel")).toBeVisible();
        await expect(page.getByText("Publicerade albumet Opublicerat album")).toBeVisible();
    });

    test("is not for listeners", async ({page, loginAs}) => {
        await loginAs("listener");
        await page.goto("/manage/audit");
        await expect(page.getByRole("heading", {name: "Ändringslogg"})).toHaveCount(0);
    });
});
