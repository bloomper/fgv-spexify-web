import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api.server";
import { crossSite, ID, invalid, sameOrigin } from "@/lib/http/proxy.server";

/**
 * Sets an album's cover from an uploaded image. The server checks the role, the size and that it is an image.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!ID.test(id)) {
    return invalid();
  }
  if (!sameOrigin(request)) {
    return crossSite();
  }

  const form = await request.formData();
  const upstream = await apiFetch(`/api/albums/${id}/cover`, { method: "POST", body: form });

  if (!upstream.ok) {
    const body = await upstream.json().catch(() => ({})) as { code?: string; message?: string };

    return NextResponse.json({ code: body.code ?? null, message: body.message ?? null }, { status: upstream.status });
  }
  return NextResponse.json({ ok: true });
}
