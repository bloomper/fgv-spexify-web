import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/sheet-music/[trackId]/[fileId]/route";

const apiFetch = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api.server", () => ({ apiFetch }));

const TRACK = "01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9e";
const FILE = "01933f2a-7c3e-7b1a-9d2e-4f5a6b7c8d9f";
const params = (trackId: string, fileId: string) => ({ params: Promise.resolve({ trackId, fileId }) });

describe("the sheet music route", () => {
  beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockResolvedValue(new Response("%PDF", { status: 200, headers: { "content-type": "application/pdf" } }));
  });

  it("passes a file of the track's sheet music on, sandboxed", async () => {
    const response = await GET(new NextRequest(`http://spexify.test/api/sheet-music/${TRACK}/${FILE}`), params(TRACK, FILE));

    expect(apiFetch.mock.calls[0][0]).toBe(`/api/tracks/${TRACK}/sheet-music/${FILE}`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("content-security-policy")).toContain("sandbox");
  });

  it("asks for an attachment when downloading", async () => {
    await GET(new NextRequest(`http://spexify.test/api/sheet-music/${TRACK}/${FILE}?download=true`), params(TRACK, FILE));

    expect(apiFetch.mock.calls[0][0]).toBe(`/api/tracks/${TRACK}/sheet-music/${FILE}?download=true`);
  });

  it("refuses what is not an id", async () => {
    const response = await GET(new NextRequest("http://spexify.test/api/sheet-music/x/y"), params("../x", FILE));

    expect(response.status).toBe(400);
    expect(apiFetch).not.toHaveBeenCalled();
  });
});
