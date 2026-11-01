import {beforeEach, describe, expect, it, vi} from "vitest";
import {NextRequest} from "next/server";
import {GET as audio} from "@/app/api/audio/[id]/route";
import {GET as trackDownload} from "@/app/api/download/track/[id]/route";
import {GET as albumDownload} from "@/app/api/download/album/[id]/route";
import {GET as cover} from "@/app/api/cover/[id]/route";
import {POST as coverUpload} from "@/app/api/cover-upload/[id]/route";

const apiFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({apiFetch}));

const params = (id: string) => ({params: Promise.resolve({id})});
const get = () => new NextRequest("http://spexify.test/api/x");

describe("the media routes", () => {
    beforeEach(() => {
        apiFetch.mockReset();
        apiFetch.mockResolvedValue(new Response("x", {status: 200, headers: {"content-type": "application/octet-stream"}}));
    });

    it.each([
        ["audio", audio, "/api/tracks/01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e/audio"],
        ["a track download", trackDownload, "/api/tracks/01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e/download"],
        ["an album download", albumDownload, "/api/albums/01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e/download"],
        ["a cover", cover, "/api/albums/01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e/cover"],
    ])("streams %s from the server", async (_, route, path) => {
        const response = await route(get(), params("01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"));

        expect(apiFetch).toHaveBeenCalledWith(path, expect.anything());
        expect(response.status).toBe(200);
    });

    it.each([audio, trackDownload, albumDownload, cover])("refuses an id that is not a number", async route => {
        const response = await route(get(), params("../01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"));

        expect(response.status).toBe(400);
        expect(apiFetch).not.toHaveBeenCalled();
    });

    it("sandboxes a cover", async () => {
        const response = await cover(get(), params("01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"));

        expect(response.headers.get("content-security-policy")).toContain("sandbox");
    });
});

describe("POST /api/cover-upload/[id]", () => {
    const upload = (headers: Record<string, string> = {}) => {
        const form = new FormData();

        form.append("file", new Blob([new Uint8Array([0x89, 0x50])], {type: "image/png"}), "cover.png");
        return new NextRequest("http://spexify.test/api/cover-upload/01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e", {method: "POST", body: form, headers: {host: "spexify.test", ...headers}});
    };

    beforeEach(() => {
        apiFetch.mockReset();
    });

    it("forwards the form to the server", async () => {
        apiFetch.mockResolvedValue(new Response("{}", {status: 200}));

        const response = await coverUpload(upload({origin: "http://spexify.test"}), params("01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"));

        expect(apiFetch).toHaveBeenCalledWith("/api/albums/01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e/cover", expect.objectContaining({method: "POST"}));
        expect(await response.json()).toEqual({ok: true});
    });

    it("passes the server's refusal on with its code and message", async () => {
        apiFetch.mockResolvedValue(new Response(JSON.stringify({code: "BAD_REQUEST", message: "Inte en bild"}), {status: 400}));

        const response = await coverUpload(upload(), params("01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"));

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({code: "BAD_REQUEST", message: "Inte en bild"});
    });

    it("refuses another site and a bad id", async () => {
        expect((await coverUpload(upload({origin: "https://evil.test"}), params("01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e"))).status).toBe(403);
        expect((await coverUpload(upload(), params("x"))).status).toBe(400);
        expect(apiFetch).not.toHaveBeenCalled();
    });
});
