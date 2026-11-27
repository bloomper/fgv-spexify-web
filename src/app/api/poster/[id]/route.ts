import { NextRequest } from "next/server";
import { ID, invalid, streamFromApi } from "@/lib/http/proxy.server";

/**
 * The poster of an album's spex, even when the album has a cover of its own, for the album page's backdrop; 404 when
 * there is none. Sandboxed, like the covers.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return ID.test(id)
    ? streamFromApi(request, `/api/albums/${id}/poster`, {
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      })
    : invalid();
}
