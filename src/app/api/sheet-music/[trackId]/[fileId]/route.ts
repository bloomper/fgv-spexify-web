import { NextRequest } from "next/server";
import { ID, invalid, streamFromApi } from "@/lib/http/proxy.server";

/**
 * A file of a track's sheet music from Spexarkivet, for the score reader or, with {@code download=true}, as an
 * attachment. Sandboxed, since a file opened on its own could otherwise run script. The server decides who may see it.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ trackId: string; fileId: string }> }) {
  const { trackId, fileId } = await params;
  const download = request.nextUrl.searchParams.get("download") === "true";

  return ID.test(trackId) && ID.test(fileId)
    ? streamFromApi(request, `/api/tracks/${trackId}/sheet-music/${fileId}${download ? "?download=true" : ""}`, {
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      })
    : invalid();
}
