import {NextRequest} from "next/server";
import {ID, invalid, redirectToLink} from "@/lib/http/proxy.server";

/**
 * A track's audio for the player: a redirect to a signed link on the API's address, which serves byte ranges. The
 * server decides who may hear it.
 */
export async function GET(_request: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return ID.test(id) ? redirectToLink(`/api/tracks/${id}/audio/link`) : invalid();
}
