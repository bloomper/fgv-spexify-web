import {expect, type Page, test as base} from "@playwright/test";
import {MOCK_URL} from "./constants";

type Persona = "admin" | "editor" | "listener" | "noaccess";

export const test = base.extend<{ resetBackend: void; loginAs: (persona: Persona) => Promise<void>; mock: Mock }>({
    resetBackend: [async ({request}, provide) => {
        await request.post(`${MOCK_URL}/__reset`);
        await provide();
    }, {auto: true}],
    loginAs: async ({page, request}, provide) => {
        await provide(async (persona: Persona) => {
            await request.post(`${MOCK_URL}/__persona`, {data: {persona}});
            // A second login in one test starts afresh too: c15t also remembers the dismissed notice in local storage
            if (page.url().startsWith("http")) {
                await page.evaluate(() => localStorage.clear());
            }
            await page.context().clearCookies();
            await page.goto("/api/auth/login");
            await page.waitForURL(url => !url.pathname.startsWith("/api/auth"));
            await page.getByRole("button", {name: "Jag förstår"}).click();
            await consentStored(page);
        });
    },
    mock: async ({request}, provide) => {
        await provide({
            spexregister: async (up: boolean) => {
                await request.post(`${MOCK_URL}/__spexregister`, {data: {up}});
            },
            navidrome: async (up: boolean) => {
                await request.post(`${MOCK_URL}/__navidrome`, {data: {up}});
            },
            failNext: async (operation: string, classification: string) => {
                await request.post(`${MOCK_URL}/__fail`, {data: {operation, classification}});
            },
            state: async () => (await request.get(`${MOCK_URL}/__state`)).json() as Promise<MockState>,
        });
    },
});

type MockState = {
    uploads: number;
    scanRequested: boolean;
    tracks: { id: string; albumId: string; title: string; trackNumber: number; published: boolean; listed: boolean; trashedAt: string | null }[];
    albums: { id: string; title: string; published: boolean; hasCover: boolean; trashedAt: string | null }[];
};

type Mock = {
    /** Spexregister up or down: down makes spex searches fail with SPEXREGISTER_UNAVAILABLE. */
    spexregister: (up: boolean) => Promise<void>;
    /** Navidrome up or down: down makes the Subsonic endpoints (stars, playlists) answer 503. */
    navidrome: (up: boolean) => Promise<void>;
    /** Makes the next call of a GraphQL operation, e.g. "AlbumUpdate", fail with the classification, e.g. "CONFLICT". */
    failNext: (operation: string, classification: string) => Promise<void>;
    /** What the backend holds, for checking what the web sent. */
    state: () => Promise<MockState>;
};

/**
 * c15t stores the dismissed cookie notice after the click, so a page opened right away would show the banner again,
 * over the bottom right corner where sheets have their buttons.
 */
export async function consentStored(page: Page) {
    await expect.poll(async () => (await page.context().cookies()).some(cookie => cookie.name === "c15t-notice")).toBe(true);
}

/**
 * Waits until React has hydrated the element: a file chosen with {@code setInputFiles} before that is lost, since the
 * browser's change event fires before React listens.
 */
export async function hydrated(page: Page, selector: string) {
    await page.waitForFunction(css => {
        const element = document.querySelector(css);

        return element !== null && Object.keys(element).some(key => key.startsWith("__reactProps"));
    }, selector);
}

export {expect} from "@playwright/test";
