import {NextRequest} from "next/server";
import {ID, invalid, streamFromApi} from "@/lib/http/proxy.server";

/**
 * A track's file as an attachment.
 */
export async function GET(request: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return ID.test(id) ? streamFromApi(request, `/api/tracks/${id}/download`) : invalid();
}
