import { ResultsConfigurationError } from "@/lib/resultsAdmin";
import { MEMBER_GROUP_IDS } from "@/lib/memberGroups";

export const MEMBERS_TABLE = "team_members";
export const PHOTO_BUCKET = "team-photos";
export const PUBLIC_COLUMNS =
  "id, group_id, name, role, code, photo_url, is_head, is_top_leadership, image_position, sort_order";
export const ADMIN_COLUMNS = `${PUBLIC_COLUMNS}, active, created_at`;

export function jsonResponse(body, init = {}, cacheControl = "no-store") {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", cacheControl);
  return Response.json(body, { ...init, headers });
}

export function authResponse(error) {
  if (error === "unauthorized") {
    return jsonResponse({ error: "Please sign in with an authorized admin account." }, { status: 401 });
  }
  if (error === "forbidden") {
    return jsonResponse({ error: "This account is not authorized to manage members." }, { status: 403 });
  }
  return null;
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

export function errorResponse(error) {
  if (error instanceof ResultsConfigurationError) {
    return jsonResponse({ error: error.message }, { status: 503 });
  }
  console.error("Members API error:", error);
  if (isSchemaMismatch(error)) {
    return jsonResponse({
      error: "The members database is not set up yet. Run supabase/members-admin.sql in the Supabase SQL Editor.",
    }, { status: 503 });
  }
  if (error?.code === "42501") {
    return jsonResponse({
      error: "Supabase denied access to the members table. Run supabase/members-admin.sql and verify the service-role key is configured.",
    }, { status: 503 });
  }
  return jsonResponse({
    error: "Could not access members right now. Check the server configuration and try again.",
  }, { status: 500 });
}

// A photo is either a site-relative path ("/team-photos/x.jpg") or an http(s) URL.
function isSafePhotoUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return false;
  if (value.startsWith("/")) return !value.startsWith("//") && !value.includes("..");
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function optionalText(value, max) {
  if (value === null || value === undefined) return { value: null };
  if (typeof value !== "string") return { error: true };
  const trimmed = value.trim();
  if (trimmed.length > max) return { error: true };
  return { value: trimmed || null };
}

// Validates a create (partial = false) or update (partial = true) body.
export function parseMemberInput(body, { partial = false } = {}) {
  if (!body || typeof body !== "object") return { error: "Request body must be a JSON object." };
  const out = {};
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);

  if (!partial || has("name")) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 100) return { error: "Name is required and must be 100 characters or fewer." };
    out.name = name;
  }
  if (!partial || has("group_id")) {
    if (!MEMBER_GROUP_IDS.has(body.group_id)) return { error: "Choose a valid group." };
    out.group_id = body.group_id;
  }
  if (!partial || has("role")) {
    const role = typeof body.role === "string" && body.role.trim() ? body.role.trim() : "Member";
    if (role.length > 80) return { error: "Role must be 80 characters or fewer." };
    out.role = role;
  }
  if (has("code")) {
    const code = optionalText(body.code, 20);
    if (code.error) return { error: "Code must be 20 characters or fewer." };
    out.code = code.value;
  }
  if (has("photo_url")) {
    const photo = optionalText(body.photo_url, 2048);
    if (photo.error) return { error: "Photo URL is too long." };
    if (photo.value && !isSafePhotoUrl(photo.value)) {
      return { error: "Photo must be a /site-path or a valid http(s) image URL." };
    }
    out.photo_url = photo.value;
  }
  if (has("image_position")) {
    const position = optionalText(body.image_position, 40);
    if (position.error || (position.value && !/^[0-9a-z%.\s-]+$/i.test(position.value))) {
      return { error: "Image position looks invalid (example: 50% 18%)." };
    }
    out.image_position = position.value;
  }
  for (const key of ["is_head", "is_top_leadership", "active"]) {
    if (has(key)) {
      if (typeof body[key] !== "boolean") return { error: `${key} must be true or false.` };
      out[key] = body[key];
    }
  }
  if (has("sort_order")) {
    if (!Number.isInteger(body.sort_order)) return { error: "sort_order must be a whole number." };
    out.sort_order = body.sort_order;
  }
  if (partial && Object.keys(out).length === 0) return { error: "Nothing to update." };
  return { value: out };
}
