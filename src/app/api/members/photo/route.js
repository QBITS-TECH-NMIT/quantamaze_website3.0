import { getResultsAdmin } from "@/lib/resultsAdmin";
import {
  PHOTO_BUCKET,
  authResponse,
  errorResponse,
  jsonResponse,
} from "@/lib/membersApi";

export const runtime = "nodejs";

// Vercel request bodies are capped at ~4.5 MB, so keep uploads under 4 MB.
const MAX_BYTES = 4 * 1024 * 1024;
const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function POST(request) {
  try {
    const admin = await getResultsAdmin(request);
    if (admin.error) return authResponse(admin.error);

    let form;
    try {
      form = await request.formData();
    } catch {
      return jsonResponse({ error: "Upload must be a form with a file." }, { status: 400 });
    }
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return jsonResponse({ error: "Choose an image file to upload." }, { status: 400 });
    }
    const extension = EXTENSIONS[file.type];
    if (!extension) {
      return jsonResponse({ error: "Photo must be a JPG, PNG or WebP image." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return jsonResponse({ error: "Photo must be smaller than 4 MB." }, { status: 400 });
    }

    const path = `${crypto.randomUUID()}.${extension}`;
    const { error } = await admin.supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });
    if (error) {
      console.error("Member photo upload error:", error);
      return jsonResponse({
        error: "Could not upload the photo. Run supabase/members-admin.sql so the team-photos bucket exists.",
      }, { status: 502 });
    }

    const { data } = admin.supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    return jsonResponse({ url: data.publicUrl }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
