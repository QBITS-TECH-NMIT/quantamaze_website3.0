import { getResultsAdmin, getResultsServiceClient } from "@/lib/resultsAdmin";
import {
  ADMIN_COLUMNS,
  MEMBERS_TABLE,
  PUBLIC_COLUMNS,
  authResponse,
  errorResponse,
  jsonResponse,
  parseMemberInput,
} from "@/lib/membersApi";

export const runtime = "nodejs";

export async function GET(request) {
  try {
    const isAdminRequest = request.headers.has("authorization");
    let supabase;
    if (isAdminRequest) {
      const admin = await getResultsAdmin(request);
      if (admin.error) return authResponse(admin.error);
      supabase = admin.supabase;
    } else {
      supabase = getResultsServiceClient();
    }

    let query = supabase
      .from(MEMBERS_TABLE)
      .select(isAdminRequest ? ADMIN_COLUMNS : PUBLIC_COLUMNS)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (!isAdminRequest) query = query.eq("active", true);

    const { data, error } = await query;
    if (error) throw error;

    // Public visitors get a short edge cache; the admin always sees live data.
    return jsonResponse(
      { members: data },
      {},
      isAdminRequest ? "no-store" : "public, s-maxage=60, stale-while-revalidate=300"
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const admin = await getResultsAdmin(request);
    if (admin.error) return authResponse(admin.error);

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const parsed = parseMemberInput(body);
    if (parsed.error) return jsonResponse({ error: parsed.error }, { status: 400 });

    // Append to the end of the group.
    const { data: last, error: lastError } = await admin.supabase
      .from(MEMBERS_TABLE)
      .select("sort_order")
      .eq("group_id", parsed.value.group_id)
      .order("sort_order", { ascending: false })
      .limit(1);
    if (lastError) throw lastError;
    const sortOrder = (last?.[0]?.sort_order ?? 0) + 10;

    const { data, error } = await admin.supabase
      .from(MEMBERS_TABLE)
      .insert({ ...parsed.value, sort_order: sortOrder })
      .select(ADMIN_COLUMNS)
      .single();
    if (error) throw error;
    return jsonResponse({ member: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
