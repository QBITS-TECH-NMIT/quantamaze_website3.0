import {
  getResultsAdmin,
  getResultsServiceClient,
  RESULTS_TABLE_NAME,
  ResultsConfigurationError,
} from "@/lib/resultsAdmin";
import { RESULTS_UNLOCK_AT } from "@/lib/results";
import { RESULT_TRACKS } from "@/lib/resultTracks";

export const runtime = "nodejs";

const MAX_LENGTH = 60;
const MAX_MEMBERS = 4;
const VALID_STATUSES = new Set(["selected", "waiting_list"]);

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

function withLegacyTeamFields(teams) {
  return teams.map((team) => ({
    ...team,
    members: [{ name: team.team_lead_name, role: "Team Lead" }],
    track: null,
  }));
}

async function selectTeamsWithLegacyFallback(supabase, isAdmin) {
  const buildQuery = (legacySchema) => {
    let query = supabase
      .from(RESULTS_TABLE_NAME)
      .select(legacySchema
        ? "id, name, team_lead_name, status, created_at"
        : "id, name, team_lead_name, members, track, status, created_at");
    if (!isAdmin) query = query.eq("status", "selected");
    return query.order(isAdmin ? "created_at" : "name", { ascending: isAdmin ? false : true });
  };

  const { data, error } = await buildQuery(false);
  if (!error) return { data, error: null, legacySchema: false };
  if (!isResultsSchemaMismatch(error)) return { data: null, error, legacySchema: false };

  const legacyResult = await buildQuery(true);
  if (legacyResult.error) return { data: null, error: legacyResult.error, legacySchema: true };
  return {
    data: withLegacyTeamFields(legacyResult.data),
    error: null,
    legacySchema: true,
  };
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

      const { data, error, legacySchema } = await selectTeamsWithLegacyFallback(admin.supabase, true);
      if (error) throw error;
      if (legacySchema) {
        console.warn("Results database is using the legacy schema; run supabase/results-admin.sql to enable full team editing.");
      }
      return jsonResponse({ teams: data });
    }

    if (Date.now() < Date.parse(RESULTS_UNLOCK_AT)) {
      return jsonResponse({ teams: [] });
    }

    const supabase = getResultsServiceClient();
    const { data, error, legacySchema } = await selectTeamsWithLegacyFallback(supabase, false);
    if (error) throw error;
    if (legacySchema) {
      console.warn("Results database is using the legacy schema; run supabase/results-admin.sql to enable full team results.");
    }
    return jsonResponse({ teams: data });
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
    const track = typeof body?.track === "string" ? body.track : "";
    const status = body?.status;
    const members = Array.isArray(body?.members)
      ? body.members.map((member) => typeof member === "string" ? member.trim() : "")
      : [];

    if (!name || name.length > MAX_LENGTH) {
      return jsonResponse({ error: "Team name is required and must be 60 characters or fewer." }, { status: 400 });
    }
    if (members.length < 2 || members.length > MAX_MEMBERS || members.some((member) => !member || member.length > MAX_LENGTH)) {
      return jsonResponse({ error: `Enter a name for each team member (2–${MAX_MEMBERS} members, 60 characters per name).` }, { status: 400 });
    }
    if (!VALID_STATUSES.has(status)) {
      return jsonResponse({ error: "Choose Selected or Waiting list." }, { status: 400 });
    }
    if (!RESULT_TRACKS.includes(track)) {
      return jsonResponse({ error: "Choose a valid track." }, { status: 400 });
    }

    const memberRecords = members.map((member, index) => ({
      name: member,
      role: index === 0 ? "Team Lead" : "Member",
    }));
    const teamLeadName = members[0];
    const { data, error } = await admin.supabase
      .from(RESULTS_TABLE_NAME)
      .insert({ name, team_lead_name: teamLeadName, members: memberRecords, track, status })
      .select("id, name, team_lead_name, members, track, status, created_at")
      .single();
    if (error?.code === "23505") {
      return jsonResponse({ error: "A result for this team already exists." }, { status: 409 });
    }
    if (error) throw error;
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
    const track = typeof body?.track === "string" ? body.track : "";
    const status = body?.status;
    const members = Array.isArray(body?.members)
      ? body.members.map((member) => typeof member === "string" ? member.trim() : "")
      : [];

    if (!name || name.length > MAX_LENGTH) {
      return jsonResponse({ error: "Team name is required and must be 60 characters or fewer." }, { status: 400 });
    }
    if (members.length < 2 || members.length > MAX_MEMBERS || members.some((member) => !member || member.length > MAX_LENGTH)) {
      return jsonResponse({ error: `Enter a name for each team member (2–${MAX_MEMBERS} members, 60 characters per name).` }, { status: 400 });
    }
    if (!VALID_STATUSES.has(status)) {
      return jsonResponse({ error: "Choose Selected or Waiting list." }, { status: 400 });
    }
    if (!RESULT_TRACKS.includes(track)) {
      return jsonResponse({ error: "Choose a valid track." }, { status: 400 });
    }

    const memberRecords = members.map((member, index) => ({
      name: member,
      role: index === 0 ? "Team Lead" : "Member",
    }));
    const { data, error } = await admin.supabase
      .from(RESULTS_TABLE_NAME)
      .update({
        name,
        team_lead_name: members[0],
        members: memberRecords,
        track,
        status,
      })
      .eq("id", id)
      .select("id, name, team_lead_name, members, track, status, created_at")
      .maybeSingle();
    if (error?.code === "23505") {
      return jsonResponse({ error: "A result for this team already exists." }, { status: 409 });
    }
    if (error) throw error;
    if (!data) return jsonResponse({ error: "That team result no longer exists." }, { status: 404 });
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
    return jsonResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error, true);
  }
}
