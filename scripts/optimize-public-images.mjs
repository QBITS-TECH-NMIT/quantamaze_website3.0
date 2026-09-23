import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function collectImages(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.toLowerCase() === "thumbs") continue;
      collectImages(fullPath, acc);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".heic", ".heif"].includes(ext)) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function canonicalScore(filePath) {
  const relative = path.relative(root, filePath).replaceAll("\\", "/");
  const name = path.basename(filePath).toLowerCase();
  let score = 0;
  if (relative.startsWith("public/team-photos/")) score += 1000;
  if (relative.startsWith("public/images/events/")) score += 500;
  if (relative.startsWith("public/images/team/")) score -= 500;
  if (name.startsWith("copy of")) score -= 300;
  if (/\(\d+\)/.test(name)) score -= 80;
  if (name.endsWith(".webp")) score += 20;
  if (name.endsWith(".heic") || name.endsWith(".heif")) score -= 200;
  score -= name.length * 0.01;
  return score;
}

const groups = new Map();
for (const filePath of [
  ...collectImages(path.join(root, "public/images/events")),
  ...collectImages(path.join(root, "public/images/team")),
  ...collectImages(path.join(root, "public/team-photos")),
]) {
  const hash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
  if (!groups.has(hash)) groups.set(hash, []);
  groups.get(hash).push(filePath);
}

let deleted = 0;
let freed = 0;
for (const files of groups.values()) {
  if (files.length < 2) continue;
  files.sort((left, right) => canonicalScore(right) - canonicalScore(left));
  const [, ...extras] = files;
  for (const extra of extras) {
    freed += fs.statSync(extra).size;
    fs.unlinkSync(extra);
    deleted += 1;
    console.log("deleted duplicate", path.relative(root, extra));
  }
}

const eventsDir = path.join(root, "public/images/events");
for (const name of fs.readdirSync(eventsDir)) {
  if (!name.toLowerCase().endsWith(".heic") && !name.toLowerCase().endsWith(".heif")) continue;
  const fullPath = path.join(eventsDir, name);
  if (!fs.statSync(fullPath).isFile()) continue;
  freed += fs.statSync(fullPath).size;
  fs.unlinkSync(fullPath);
  deleted += 1;
  console.log("deleted unusable heic", name);
}

console.log(`Removed ${deleted} files (${(freed / 1024 / 1024).toFixed(2)} MB).`);
