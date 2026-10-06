import { findShortlistedTeam } from "@/lib/findShortlistedTeam";
import { RESULTS_UNLOCK_AT } from "@/lib/results";

export const runtime = "nodejs";

const MAX_LENGTH = 60;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20;
const hitsByIp = new Map();

function clientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function allowRequest(ip) {
  const now = Date.now();
  const recent = (hitsByIp.get(ip) || []).filter((stamp) => now - stamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hitsByIp.set(ip, recent);
    return false;
  }
  recent.push(now);
  hitsByIp.set(ip, recent);
  return true;
}

function readField(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function POST(request) {
  if (!allowRequest(clientIp(request))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  // Remove the preview override before launch.
  const preview = body?.preview === true;
  const unlocked = preview || Date.now() >= Date.parse(RESULTS_UNLOCK_AT);
  if (!unlocked) {
    return Response.json({ error: "locked" }, { status: 403 });
  }

  const teamName = readField(body?.teamName);
  const teamLeadName = readField(body?.teamLeadName);
  const errors = {};

  if (!teamName) errors.teamName = "Team name is required.";
  else if (teamName.length > MAX_LENGTH) errors.teamName = "Team name must be 60 characters or fewer.";

  if (!teamLeadName) errors.teamLeadName = "Team lead name is required.";
  else if (teamLeadName.length > MAX_LENGTH) errors.teamLeadName = "Team lead name must be 60 characters or fewer.";

  if (Object.keys(errors).length > 0) {
    return Response.json({ error: "invalid", errors }, { status: 400 });
  }

  const match = findShortlistedTeam(teamName, teamLeadName);

  // Never return member lists or which field failed — only status + a display name.
  if (match) {
    return Response.json({ status: "selected", teamName: match.name });
  }

  return Response.json({ status: "not_selected", teamName });
}
