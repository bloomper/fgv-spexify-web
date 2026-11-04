import { expect, type Page, test as base } from "@playwright/test";
import { MOCK_URL } from "./constants";

type Persona = "admin" | "editor" | "listener" | "noaccess";

let logins = 0;

/** A documentation address (RFC 5737) per login: 192.0.2.1, 192.0.2.2, … */
function nextClientIp() {
  logins = logins % 254 + 1;
  return `192.0.2.${logins}`;
}

export const test = base.extend<{
  resetBackend: void;
  noNativeDialogs: void;
  loginAs: (persona: Persona) => Promise<void>;
  mock: Mock
}>({
  resetBackend: [async ({ request }, provide) => {
    await request.post(`${MOCK_URL}/__reset`);
    await provide();
  }, { auto: true }],
  // The application asks in its own dialogs; a native confirm or prompt fails the test
  noNativeDialogs: [async ({ page }, provide) => {
    const native: string[] = [];

    page.on("dialog", dialog => {
      native.push(`${dialog.type()}: ${dialog.message()}`);
      void dialog.dismiss();
    });
    await provide();
    expect(native, "native dialogs").toEqual([]);
  }, { auto: true }],
  loginAs: async ({ page, request }, provide) => {
    await provide(async (persona: Persona) => {
      await request.post(`${MOCK_URL}/__persona`, { data: { persona } });
      // Better Auth limits requests per client IP. Every test comes from the same machine, so without an address
      // of its own each login would count against one shared limit, and a busy run gets "Too many requests"
      await page.setExtraHTTPHeaders({ "x-forwarded-for": nextClientIp() });
      // A second login in one test starts afresh too: c15t also remembers the dismissed notice in local storage
      if (page.url().startsWith("http")) {
        await page.evaluate(() => localStorage.clear());
      }
      await page.context().clearCookies();
      await page.goto("/api/auth/login");
      await page.waitForURL(url => !url.pathname.startsWith("/api/auth"));
      await page.getByRole("button", { name: "Jag förstår" }).click();
      await consentStored(page);
    });
  },
  mock: async ({ request }, provide) => {
    await provide({
      spexregister: async (up: boolean) => {
        await request.post(`${MOCK_URL}/__spexregister`, { data: { up } });
      },
      navidrome: async (up: boolean) => {
        await request.post(`${MOCK_URL}/__navidrome`, { data: { up } });
      },
      plays: async (plays: Record<string, { playCount: number; played: string }>) => {
        await request.post(`${MOCK_URL}/__plays`, { data: { plays } });
      },
      playQueue: async (playQueue: { ids: string[]; current: string | null; position: number } | null) => {
        await request.post(`${MOCK_URL}/__playQueue`, { data: { playQueue } });
      },
      failNext: async (operation: string, classification: string) => {
        await request.post(`${MOCK_URL}/__fail`, { data: { operation, classification } });
      },
      state: async () => (await request.get(`${MOCK_URL}/__state`)).json() as Promise<MockState>,
    });
  },
});

type MockState = {
  uploads: number;
  scanRequested: boolean;
  /** Navidrome ids of the songs starred through the Subsonic gateway. */
  starred: string[];
  /** Play counts by Navidrome id of song or album, from scrobbles. */
  plays: Record<string, { playCount: number; played: string }>;
  kinds: { id: string; nameSv: string; nameEn: string; position: number }[];
  /** The listener's ratings by Navidrome id of song or album. */
  ratings: Record<string, number>;
  starredAlbums: string[];
  playlists: { id: string; name: string; entries: string[]; public?: boolean; comment?: string }[];
  playQueue: { ids: string[]; current: string | null; position: number } | null;
  tracks: {
    id: string;
    albumId: string;
    title: string;
    trackNumber: number;
    published: boolean;
    listed: boolean;
    trashedAt: string | null
  }[];
  albums: { id: string; title: string; published: boolean; hasCover: boolean; trashedAt: string | null }[];
};

type Mock = {
  /** Spexregister up or down: down makes spex searches fail with SPEXREGISTER_UNAVAILABLE. */
  spexregister: (up: boolean) => Promise<void>;
  /** Navidrome up or down: down makes the Subsonic endpoints (stars, playlists) answer 503. */
  navidrome: (up: boolean) => Promise<void>;
  /** Sets how often the listener played songs or albums, by Navidrome id ("nd-…" songs, "al-1" the album Nobel). */
  plays: (plays: Record<string, { playCount: number; played: string }>) => Promise<void>;
  /** Sets the play queue the listener's apps saved in Navidrome; null for none. */
  playQueue: (playQueue: { ids: string[]; current: string | null; position: number } | null) => Promise<void>;
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

/**
 * Answers the application's own confirm or prompt dialog: fills the text, if any, and clicks the button.
 */
export async function answerDialog(page: Page, button: string, text?: string) {
  const dialog = page.getByRole("dialog");

  if (text !== undefined) {
    await dialog.getByRole("textbox").fill(text);
  }
  await dialog.getByRole("button", { name: button, exact: true }).click();
  await expect(dialog).toBeHidden();
}

export { expect } from "@playwright/test";
