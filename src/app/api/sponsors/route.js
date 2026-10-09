import {
  getResultsAdmin,
  getResultsServiceClient,
  ResultsConfigurationError,
} from "@/lib/resultsAdmin";
import { SPONSOR_TIER_OPTIONS } from "@/lib/sponsorTiers";

export const runtime = "nodejs";

const TABLE_NAME = "site_sponsors";
const MAX_NAME_LENGTH = 100;
const MAX_URL_LENGTH = 2048;
const VALID_TIER_IDS = new Set(SPONSOR_TIER_OPTIONS.map(({ id }) => id));

function jsonResponse(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(body, { ...init, headers });
}

function isSchemaMismatch(error) {
  return error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    error?.code === "42703" ||
    error?.code === "PGRST204" ||
    /column .* does not exist|could not find the .* column/i.test(
      `${error?.message || ""} ${error?.details || ""}`
    );
}

function authResponse(error) {
  if (error === "unauthorized") {
    return jsonResponse({ error: "Please sign in with an authorized admin account." }, { status: 401 });
  }
  if (error === "forbidden") {
    return jsonResponse({ error: "This account is not authorized to manage sponsors." }, { status: 403 });
  }
  return null;
}

function errorResponse(error) {
  if (error instanceof ResultsConfigurationError) {
    return jsonResponse({ error: error.message }, { status: 503 });
  }
  console.error("Sponsors API error:", error);
  if (isSchemaMismatch(error)) {
    return jsonResponse({
      error: "The sponsors database is not set up yet. Run supabase/sponsors-admin.sql in the Supabase SQL Editor.",
    }, { status: 503 });
  }
  if (error?.code === "42501") {
    return jsonResponse({
      error: "Supabase denied access to the sponsors table. Run supabase/sponsors-admin.sql and verify the service-role key is configured.",
    }, { status: 503 });
  }
  return jsonResponse({
    error: "Could not access sponsors right now. Check the server configuration and try again.",
  }, { status: 500 });
}

function isWebUrl(value) {
  if (typeof value !== "string" || value.length > MAX_URL_LENGTH) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function selectSponsors(supabase) {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, name, tier_id, url, logo_url, created_at")
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw error;
  return data;
}

export async function GET(request) {
  try {
    let supabase;
    if (request.headers.has("authorization")) {
      const admin = await getResultsAdmin(request);
      if (admin.error) return authResponse(admin.error);
      supabase = admin.supabase;
    } else {
      supabase = getResultsServiceClient();
    }
    return jsonResponse({ sponsors: await selectSponsors(supabase) });
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

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const tierId = typeof body?.tier_id === "string" ? body.tier_id : "";
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    const logoUrl = typeof body?.logo_url === "string" ? body.logo_url.trim() : "";

    if (!name || name.length > MAX_NAME_LENGTH) {
      return jsonResponse({ error: "Sponsor name is required and must be 100 characters or fewer." }, { status: 400 });
    }
    if (!VALID_TIER_IDS.has(tierId)) {
      return jsonResponse({ error: "Choose a valid sponsor tier." }, { status: 400 });
    }
    if (!isWebUrl(url)) {
      return jsonResponse({ error: "Enter a valid sponsor website URL using http or https." }, { status: 400 });
    }
    if (!isWebUrl(logoUrl)) {
      return jsonResponse({ error: "Enter a valid public logo image URL using http or https." }, { status: 400 });
    }

    const { data, error } = await admin.supabase
      .from(TABLE_NAME)
      .insert({ name, tier_id: tierId, url, logo_url: logoUrl })
      .select("id, name, tier_id, url, logo_url, created_at")
      .single();
    if (error) throw error;
    return jsonResponse({ sponsor: data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
