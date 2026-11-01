import {uuidOf} from "./constants";
import {type Page} from "@playwright/test";
import {expect, hydrated, test} from "./fixtures";

const FLAC = Buffer.concat([Buffer.from("fLaC"), Buffer.alloc(2048)]);

const TRACK_FILES = "input[type=file][multiple]";

async function chooseFile(page: Page, selector: string, name: string, mimeType: string, buffer: Buffer) {
    await hydrated(page, selector);
    await page.locator(selector).setInputFiles({name, mimeType, buffer});
}

test.describe("Editing an album", () => {
    test.beforeEach(async ({loginAs}) => {
        await loginAs("editor");
    });

    test("uploads tracks with tus, and they join the album", async ({page, mock}) => {
        await page.goto(`/manage/albums/${uuidOf(1)}`);
        await chooseFile(page, TRACK_FILES, "03 Finalen.flac", "audio/flac", FLAC);

        await expect(page.getByText("03 Finalen.flac")).toBeVisible();
        await expect(page.getByText("Klar", {exact: true})).toBeVisible();
        await expect(page.getByText("Finalen", {exact: true})).toBeVisible();
        expect((await mock.state()).tracks.filter(track => track.albumId === uuidOf(1)).map(track => track.title))
            .toEqual(["Ouvertyr", "Kärleksduetten", "Finalen"]);
    });

    test("shows why an upload that is not audio fails", async ({page}) => {
        await page.goto(`/manage/albums/${uuidOf(1)}`);
        await chooseFile(page, TRACK_FILES, "affisch.pdf", "application/pdf", Buffer.from("%PDF"));

        await expect(page.getByText("Filen är inte ljud i ett format som stöds.")).toBeVisible();
    });

    test("edits a track's details", async ({page, mock}) => {
        await page.goto(`/manage/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Mer för Ouvertyr"}).click();
        await page.getByRole("menuitem", {name: "Redigera"}).click();

        const dialog = page.getByRole("dialog", {name: "Redigera låten"});

        await dialog.getByLabel("Titel").fill("Uvertyr");
        await dialog.getByLabel("Medverkande").fill("Hela ensemblen");
        await dialog.getByRole("button", {name: "Spara"}).click();

        await expect(dialog).toBeHidden();
        await expect(page.getByText("Uvertyr", {exact: true})).toBeVisible();
        expect((await mock.state()).tracks.find(track => track.id === uuidOf(11))?.title).toBe("Uvertyr");
    });

    test("reorders tracks", async ({page, mock}) => {
        await page.goto(`/manage/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Flytta ner Ouvertyr"}).click();

        await expect(page.getByRole("button", {name: "Flytta upp Ouvertyr"})).toBeEnabled();
        await expect(page.getByRole("button", {name: "Flytta ner Ouvertyr"})).toBeDisabled();
        expect((await mock.state()).tracks.filter(track => track.albumId === uuidOf(1)).sort((a, b) => a.trackNumber - b.trackNumber)
            .map(track => track.title)).toEqual(["Kärleksduetten", "Ouvertyr"]);
    });

    test("unpublishes one track, which listeners then no longer see", async ({page, mock, loginAs}) => {
        await page.goto(`/manage/albums/${uuidOf(1)}`);
        await page.getByRole("switch", {name: "Publicera Kärleksduetten"}).click();
        await expect(page.getByRole("switch", {name: "Publicera Kärleksduetten"})).not.toBeChecked();
        expect((await mock.state()).tracks.find(track => track.id === uuidOf(12))?.listed).toBe(false);

        await loginAs("listener");
        await page.goto(`/albums/${uuidOf(1)}`);
        await expect(page.getByText("Ouvertyr")).toBeVisible();
        await expect(page.getByText("Kärleksduetten")).toHaveCount(0);
    });

    test("publishes an album, which listeners then see", async ({page, loginAs}) => {
        await page.goto(`/manage/albums/${uuidOf(2)}`);
        await page.getByRole("switch").first().click();
        await expect(page.getByText("Publicerat", {exact: true})).toBeVisible();

        await loginAs("listener");
        await page.goto("/albums");
        await expect(page.getByRole("link", {name: /Opublicerat album/})).toBeVisible();
    });

    test("saves the album's details", async ({page}) => {
        await page.goto(`/manage/albums/${uuidOf(1)}`);
        await page.getByLabel("Titel", {exact: true}).fill("Nobel – jubileumsinspelning");
        await page.getByLabel("Beskrivning").fill("Inspelat igen till jubileet.");
        await page.getByRole("button", {name: "Spara"}).click();

        await expect(page.getByText("Sparat")).toBeVisible();
        await page.reload();
        await expect(page.getByLabel("Titel", {exact: true})).toHaveValue("Nobel – jubileumsinspelning");
    });

    test("uploads a cover, which replaces the spex poster", async ({page, mock}) => {
        await page.goto(`/manage/albums/${uuidOf(1)}`);
        await expect(page.getByText("Utan omslag visas spexets affisch.")).toBeVisible();
        await chooseFile(page, "input[type=file][accept^='image']", "omslag.png", "image/png",
            Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));

        await expect(page.getByRole("button", {name: "Byt omslag"})).toBeVisible();
        expect((await mock.state()).albums.find(album => album.id === uuidOf(1))?.hasCover).toBe(true);

        await page.getByRole("button", {name: "Ta bort omslaget"}).click();
        await expect(page.getByRole("button", {name: "Ladda upp omslag"})).toBeVisible();
    });

    test("tells the editor when someone else changed the album", async ({page, mock}) => {
        await mock.failNext("AlbumUpdate", "CONFLICT");
        await page.goto(`/manage/albums/${uuidOf(1)}`);
        await page.getByRole("button", {name: "Spara"}).click();

        await expect(page.getByText("Någon annan har ändrat detta. Ladda om sidan och försök igen.")).toBeVisible();
    });
});
