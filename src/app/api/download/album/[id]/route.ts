import {NextRequest} from "next/server";
import {ID, invalid, redirectToLink} from "@/lib/http/proxy.server";

/**
 * An album's tracks as a zip: a redirect to a signed link on the API's address, which streams it as it is written.
 */
export async function GET(_request: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return ID.test(id) ? redirectToLink(`/api/albums/${id}/download/link`) : invalid();
}
