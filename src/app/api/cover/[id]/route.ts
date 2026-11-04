import { NextRequest } from "next/server";
import { ID, invalid, streamFromApi } from "@/lib/http/proxy.server";

/**
 * An album's cover, or its spex poster; 404 when it has neither, so that the card shows its placeholder. Sandboxed,
 * since an image opened on its own could otherwise run script.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return ID.test(id)
    ? streamFromApi(request, `/api/albums/${id}/cover`, { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" })
    : invalid();
}
