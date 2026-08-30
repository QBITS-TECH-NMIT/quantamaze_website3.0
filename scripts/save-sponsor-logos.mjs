import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SPONSORS_DIR = path.join(ROOT, 'public', 'sponsors');

fs.mkdirSync(SPONSORS_DIR, { recursive: true });

// We will write the script to decode and save the logos
