import { getResultsAdmin } from "@/lib/resultsAdmin";
import {
  ADMIN_COLUMNS,
  MEMBERS_TABLE,
  authResponse,
  errorResponse,
  jsonResponse,
  parseMemberInput,
} from "@/lib/membersApi";

export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getId(params) {
  const { id } = await params;
  return UUID.test(id || "") ? id : null;
}

export async function PATCH(request, { params }) {
  try {
    const admin = await getResultsAdmin(request);
    if (admin.error) return authResponse(admin.error);
    const id = await getId(params);
    if (!id) return jsonResponse({ error: "Invalid member id." }, { status: 400 });

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON." }, { status: 400 });
    }
    const parsed = parseMemberInput(body, { partial: true });
    if (parsed.error) return jsonResponse({ error: parsed.error }, { status: 400 });

    const { data, error } = await admin.supabase
      .from(MEMBERS_TABLE)
      .update(parsed.value)
      .eq("id", id)
      .select(ADMIN_COLUMNS)
      .maybeSingle();
    if (error) throw error;
    if (!data) return jsonResponse({ error: "Member not found." }, { status: 404 });
    return jsonResponse({ member: data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await getResultsAdmin(request);
    if (admin.error) return authResponse(admin.error);
    const id = await getId(params);
    if (!id) return jsonResponse({ error: "Invalid member id." }, { status: 400 });

    const { data, error } = await admin.supabase
      .from(MEMBERS_TABLE)
      .delete()
      .eq("id", id)
      .select("id");
    if (error) throw error;
    if (!data?.length) return jsonResponse({ error: "Member not found." }, { status: 404 });
    return jsonResponse({ deleted: id });
  } catch (error) {
    return errorResponse(error);
  }
}
