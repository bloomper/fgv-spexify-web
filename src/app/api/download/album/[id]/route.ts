import {NextRequest} from "next/server";
import {ID, invalid, streamFromApi} from "@/lib/http/proxy.server";

/**
 * An album's tracks as a zip, streamed as the server writes it.
 */
export async function GET(request: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return ID.test(id) ? streamFromApi(request, `/api/albums/${id}/download`) : invalid();
}
