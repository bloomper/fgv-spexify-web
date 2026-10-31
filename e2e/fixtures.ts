import {expect, type Page, test as base} from "@playwright/test";
import {MOCK_URL} from "./constants";

type Persona = "admin" | "editor" | "listener" | "noaccess";

export const test = base.extend<{ resetBackend: void; loginAs: (persona: Persona) => Promise<void> }>({
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
});

/**
 * c15t stores the dismissed cookie notice after the click, so a page opened right away would show the banner again,
 * over the bottom right corner where sheets have their buttons.
 */
export async function consentStored(page: Page) {
    await expect.poll(async () => (await page.context().cookies()).some(cookie => cookie.name === "c15t-notice")).toBe(true);
}

export {expect} from "@playwright/test";
