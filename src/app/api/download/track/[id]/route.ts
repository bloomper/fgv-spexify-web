import {NextRequest} from "next/server";
import {ID, invalid, redirectToLink} from "@/lib/http/proxy.server";

/**
 * A track's file as an attachment.
 */
export async function GET(_request: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    return ID.test(id) ? redirectToLink(`/api/tracks/${id}/download/link`) : invalid();
}
