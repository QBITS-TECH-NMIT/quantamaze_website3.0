import {
  getResultsAdmin,
  getResultsServiceClient,
  RESULTS_TABLE_NAME,
  ResultsConfigurationError,
} from "@/lib/resultsAdmin";
import { revalidateTag, unstable_cache } from "next/cache";
import { RESULT_TRACKS } from "@/lib/resultTracks";

export const runtime = "nodejs";

const MAX_LENGTH = 60;
const MAX_RESULT_RANK = 15;
const VALID_STATUSES = new Set(["selected", "waiting_list"]);
const PUBLIC_RESULTS_CACHE_TAG = "phase-one-public-results";

function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(body, { ...init, headers });
}

function isResultsSchemaMismatch(error) {
  return error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    error?.code === "42703" ||
    error?.code === "PGRST204" ||
    /column .* does not exist|could not find the .* column/i.test(
      `${error?.message || ""} ${error?.details || ""}`
    );
}

function withLegacyTrackAndRankFields(teams) {
  return teams.map((team, index) => ({
    ...team,
    track: null,
    result_rank: index + 1,
  }));
}

async function selectTeamsWithLegacyFallback(supabase) {
  const buildQuery = (legacySchema) => {
    const query = supabase
      .from(RESULTS_TABLE_NAME)
      .select(legacySchema
        ? "id, name, team_lead_name, status, created_at"
        : "id, name, team_lead_name, track, result_rank, status, created_at");
    if (legacySchema) {
      return query.order("created_at", { ascending: true }).order("id", { ascending: true });
    }
    return query
      .order("track", { ascending: true, nullsFirst: false })
      .order("result_rank", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });
  };

  const { data, error } = await buildQuery(false);
  if (!error) return { data, error: null, legacySchema: false };
  if (!isResultsSchemaMismatch(error)) return { data: null, error, legacySchema: false };

  const legacyResult = await buildQuery(true);
  if (legacyResult.error) return { data: null, error: legacyResult.error, legacySchema: true };
  return {
    data: withLegacyTrackAndRankFields(legacyResult.data),
    error: null,
    legacySchema: true,
  };
}

const getCachedPublicTeams = unstable_cache(
  async () => {
    const supabase = getResultsServiceClient();
    const { data, error, legacySchema } = await selectTeamsWithLegacyFallback(supabase);
    if (error) throw error;
    if (legacySchema) {
      console.warn("Results database is using the legacy schema; run supabase/results-admin.sql to enable track and rank assignments.");
    }
    return data;
  },
  ["phase-one-public-results"],
  { revalidate: 60, tags: [PUBLIC_RESULTS_CACHE_TAG] },
);

function invalidatePublicResultsCache() {
  revalidateTag(PUBLIC_RESULTS_CACHE_TAG, { expire: 0 });
}

function errorResponse(error, exposeDetails = false) {
  if (error instanceof ResultsConfigurationError) {
    return jsonResponse({ error: error.message }, { status: 503 });
  }
  console.error("Results API error:", error);
  if (isResultsSchemaMismatch(error)) {
    return jsonResponse({
      error: "The Phase 1 results database is missing required columns. Run the latest supabase/results-admin.sql in the Supabase SQL Editor.",
    }, { status: 503 });
  }
  if (error?.code === "42501") {
    return jsonResponse({
      error: "Supabase denied access to the results table. Run the latest supabase/results-admin.sql and verify the service-role key is configured in the deployment.",
    }, { status: 503 });
  }
  if (exposeDetails && error?.message) {
    const code = typeof error.code === "string" ? ` (${error.code})` : "";
    return jsonResponse({ error: `Could not access results right now${code}: ${error.message}` }, { status: 500 });
  }
  return jsonResponse({ error: "Could not access results right now. Check the server configuration and try again." }, { status: 500 });
}

function authResponse(error) {
  if (error === "unauthorized") {
    return jsonResponse({ error: "Please sign in with an authorized admin account." }, { status: 401 });
  }
  if (error === "forbidden") {
    return jsonResponse({ error: "This account is not authorized to manage results." }, { status: 403 });
  }
  return null;
}

export async function GET(request) {
  try {
    if (request.headers.has("authorization")) {
      const admin = await getResultsAdmin(request);
      if (admin.error) return authResponse(admin.error);

      const { data, error, legacySchema } = await selectTeamsWithLegacyFallback(admin.supabase);
      if (error) throw error;
      if (legacySchema) {
        console.warn("Results database is using the legacy schema; run supabase/results-admin.sql to enable track editing.");
      }
      return jsonResponse({ teams: data });
    }

    return jsonResponse({ teams: await getCachedPublicTeams() });
  } catch (error) {
    return errorResponse(error, request.headers.has("authorization"));
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

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const teamLeadName = typeof body?.team_lead_name === "string" ? body.team_lead_name.trim() : "";
    const track = typeof body?.track === "string" ? body.track : "";
    const status = body?.status;
    const resultRank = Number(body?.result_rank);

    if (!name || name.length > MAX_LENGTH) {
      return jsonResponse({ error: "Team name is required and must be 60 characters or fewer." }, { status: 400 });
    }
    if (!teamLeadName || teamLeadName.length > MAX_LENGTH) {
      return jsonResponse({ error: "Team lead name is required and must be 60 characters or fewer." }, { status: 400 });
    }
    if (!VALID_STATUSES.has(status)) {
      return jsonResponse({ error: "Choose Selected or Waiting list." }, { status: 400 });
    }
    if (!Number.isInteger(resultRank) || resultRank < 1 || resultRank > MAX_RESULT_RANK) {
      return jsonResponse({ error: "Rank must be between 1 and 15 within the selected track." }, { status: 400 });
    }
    if (!RESULT_TRACKS.includes(track)) {
      return jsonResponse({ error: "Choose a valid track." }, { status: 400 });
    }

    const { data, error } = await admin.supabase
      .from(RESULTS_TABLE_NAME)
      .insert({ name, team_lead_name: teamLeadName, track, result_rank: resultRank, status })
      .select("id, name, team_lead_name, track, result_rank, status, created_at")
      .single();
    if (error?.code === "23505") {
      return jsonResponse({ error: "A result for this team already exists." }, { status: 409 });
    }
    if (error) throw error;
    invalidatePublicResultsCache();
    return jsonResponse({ team: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error, true);
  }
}

export async function PUT(request) {
  try {
    const admin = await getResultsAdmin(request);
    if (admin.error) return authResponse(admin.error);

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const id = typeof body?.id === "string" ? body.id : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return jsonResponse({ error: "A valid team ID is required." }, { status: 400 });
    }

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const teamLeadName = typeof body?.team_lead_name === "string" ? body.team_lead_name.trim() : "";
    const track = typeof body?.track === "string" ? body.track : "";
    const status = body?.status;
    const resultRank = Number(body?.result_rank);

    if (!name || name.length > MAX_LENGTH) {
      return jsonResponse({ error: "Team name is required and must be 60 characters or fewer." }, { status: 400 });
    }
    if (!teamLeadName || teamLeadName.length > MAX_LENGTH) {
      return jsonResponse({ error: "Team lead name is required and must be 60 characters or fewer." }, { status: 400 });
    }
    if (!VALID_STATUSES.has(status)) {
      return jsonResponse({ error: "Choose Selected or Waiting list." }, { status: 400 });
    }
    if (!Number.isInteger(resultRank) || resultRank < 1 || resultRank > MAX_RESULT_RANK) {
      return jsonResponse({ error: "Rank must be between 1 and 15 within the selected track." }, { status: 400 });
    }
    if (!RESULT_TRACKS.includes(track)) {
      return jsonResponse({ error: "Choose a valid track." }, { status: 400 });
    }

    const { data, error } = await admin.supabase
      .from(RESULTS_TABLE_NAME)
      .update({
        name,
        team_lead_name: teamLeadName,
        track,
        result_rank: resultRank,
        status,
      })
      .eq("id", id)
      .select("id, name, team_lead_name, track, result_rank, status, created_at")
      .maybeSingle();
    if (error?.code === "23505") {
      return jsonResponse({ error: "A result for this team already exists." }, { status: 409 });
    }
    if (error) throw error;
    if (!data) return jsonResponse({ error: "That team result no longer exists." }, { status: 404 });
    invalidatePublicResultsCache();
    return jsonResponse({ team: data });
  } catch (error) {
    return errorResponse(error, true);
  }
}

export async function DELETE(request) {
  try {
    const admin = await getResultsAdmin(request);
    if (admin.error) return authResponse(admin.error);

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Request body must be valid JSON." }, { status: 400 });
    }

    const id = typeof body?.id === "string" ? body.id : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return jsonResponse({ error: "A valid team ID is required." }, { status: 400 });
    }

    const { data, error } = await admin.supabase
      .from(RESULTS_TABLE_NAME)
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return jsonResponse({ error: "That team result no longer exists." }, { status: 404 });
    invalidatePublicResultsCache();
    return jsonResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error, true);
  }
}
