import { createClient } from "@supabase/supabase-js";
import { normalizeMatchName } from "@/lib/normalizeName";

const RESULTS_TABLE = "phase_one_results";

export class ResultsConfigurationError extends Error {}

function getSupabaseUrl() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new ResultsConfigurationError("Supabase URL is not configured.");
  return url;
}

function getAdminEmails() {
  const emails = (process.env.RESULTS_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (emails.length === 0) {
    throw new ResultsConfigurationError("No results admin email is configured.");
  }
  return emails;
}

function getServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new ResultsConfigurationError("Supabase service role key is not configured.");
  }
  return createClient(getSupabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function getBearerToken(request) {
  const authorization = request.headers.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

export async function getResultsAdmin(request) {
  const token = getBearerToken(request);
  if (!token) return { error: "unauthorized" };

  const url = getSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    throw new ResultsConfigurationError("Supabase anon key is not configured.");
  }

  const authClient = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) return { error: "unauthorized" };

  const allowedEmails = getAdminEmails();
  if (!data.user.email || !allowedEmails.includes(data.user.email.toLowerCase())) {
    return { error: "forbidden" };
  }

  return { supabase: getServiceClient() };
}

export function getResultsServiceClient() {
  return getServiceClient();
}

export async function findManagedResult(teamName, teamLeadName) {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from(RESULTS_TABLE)
    .select("name, team_lead_name, status");
  if (error) throw error;

  const normalizedName = normalizeMatchName(teamName);
  const normalizedLead = normalizeMatchName(teamLeadName);
  return data.find((team) => (
    normalizeMatchName(team.name) === normalizedName &&
    normalizeMatchName(team.team_lead_name) === normalizedLead
  )) || null;
}

export const RESULTS_TABLE_NAME = RESULTS_TABLE;
