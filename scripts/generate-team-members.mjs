/**
 * generate-team-members.mjs
 *
 * Robust, future-proof photo matching system for Q-Bits team members.
 * Scans "q-bits team/<DomainFolder>/" for image files, fuzzy-matches each file's
 * embedded name against roster members in that domain, and automatically:
 *  1. Copies matched images to public/team-photos/<safe-slug>
 *  2. Writes src/lib/teamMembers.js with resolved photo and photoUrl fields
 *  3. Outputs a clear match / pending / unmatched-file report to the terminal
 *
 * Runs automatically on `npm run dev` / `npm run build` via package.json pre-hooks.
 *
 * HOW TO ADD PHOTOS:
 *  Simply drop image files (e.g. Full_Name_Domain.jpg or Full_Name.png) into the
 *  appropriate subfolder under "q-bits team/".
 *  Accepted formats: .jpg, .jpeg, .png, .webp, .gif, .avif
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PHOTOS_SRC = path.join(ROOT, 'q-bits team');
const PHOTOS_DEST = path.join(ROOT, 'public', 'team-photos');
const OUTPUT_FILE = path.join(ROOT, 'src', 'lib', 'teamMembers.js');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const MATCH_THRESHOLD = 0.65;
const MANUAL_PHOTO_OVERRIDES = {
  'AD-01': { sourceFolder: 'Events', file: 'Akshata_C_Events.jpg' },
  'EV-01': { sourceFolder: 'Administration', file: 'Haseena.jpg' },
};

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL ROSTER DATA
// ─────────────────────────────────────────────────────────────────────────────

const FACULTY_DATA = [
  { name: 'Dr N Samanvita', role: 'Head Of Department', code: 'FA-01' },
  { name: 'Dr Lakshmanan M', role: 'Faculty', code: 'FA-02' },
  { name: 'Dr Amruth Ramesh', role: 'Faculty', code: 'FA-03' },
  { name: 'Mr Melam Thirupathaiah', role: 'Faculty', code: 'FA-04' },
];

const LEADERSHIP_DATA = [
  { name: 'ML Shikhar', role: 'President', code: 'LE-01', isTopLeadership: true },
  { name: 'Shreya Rotti', role: 'Vice President', code: 'LE-02', isTopLeadership: true },
];

const DOMAINS_DATA = [
  {
    id: 'technical',
    index: '01',
    name: 'Technical',
    folderNames: ['Techie', 'Technical'],
    tagline: 'Architecture, Systems & Quantum Computing',
    members: [
      { name: 'Syed Maaz', role: 'Head', code: 'TC-01', isHead: true },
      { name: 'Jadyn', role: 'Lead', code: 'TC-02' },
      { name: 'Janvika Malapati', role: 'Member', code: 'TC-03' },
      { name: 'Prisha Ruturaj C', role: 'Member', code: 'TC-04' },
      { name: 'Vemala Prajwal', role: 'Member', code: 'TC-05' },
      { name: 'Haripriya Katabathina', role: 'Member', code: 'TC-06' },
      { name: 'Hiranmayi', role: 'Member', code: 'TC-07' },
      { name: 'Pranav Rohan', role: 'Member', code: 'TC-08' },
      { name: 'Farhan Akhtar', role: 'Member', code: 'TC-09' },
      { name: 'Arnav Raj Karn', role: 'Member', code: 'TC-10' },
    ],
  },
  {
    id: 'administration',
    index: '02',
    name: 'Administration',
    folderNames: ['Administration', 'Admin'],
    tagline: 'Governance, Strategy & Internal Operations',
    members: [
      { name: 'Akshata Choudi', role: 'Head', code: 'AD-01', isHead: true },
      { name: 'Raksha P', role: 'Member', code: 'AD-02' },
      { name: 'Rifa Anjum', role: 'Member', code: 'AD-03' },
      { name: 'LD Sai Charan', role: 'Member', code: 'AD-04', imagePosition: '50% 18%' },
      { name: 'Abhianv Deo', role: 'Member', code: 'AD-05' },
      { name: 'Karthik S Rao', role: 'Member', code: 'AD-06' },
      { name: 'Keerthana Bhat', role: 'Member', code: 'AD-07' },
      { name: 'D Ganesh', role: 'Member', code: 'AD-08' },

    ],
  },
  {
    id: 'design',
    index: '03',
    name: 'Design',
    folderNames: ['Design'],
    tagline: 'Visual Identity, UI/UX & Creative Media',
    members: [
      { name: 'Maaz', role: 'Head', code: 'DS-01', isHead: true },
      { name: 'Vaibhavi', role: 'Head', code: 'DS-02', isHead: true },
      { name: 'Kulsum', role: 'Lead', code: 'DS-03' },
      { name: 'Dheshna M', role: 'Co Lead', code: 'DS-04' },
      { name: 'Melisha Dsouza', role: 'Member', code: 'DS-05' },
      { name: 'Anupriya Kumari', role: 'Member', code: 'DS-06' },
      { name: 'Swasti Jain', role: 'Member', code: 'DS-07' },
      { name: 'Shanmukhi Vytlaa', role: 'Member', code: 'DS-08' },
      { name: 'Adhya', role: 'Member', code: 'DS-09' },
      { name: 'Arpita Thakur', role: 'Member', code: 'DS-10' },
    ],
  },
  {
    id: 'events',
    index: '04',
    name: 'Events',
    folderNames: ['Events', 'Event'],
    tagline: 'Hackathon Execution, Logistics & Stage Management',
    members: [
      { name: 'Haseena Tawfeeqa', role: 'Head', code: 'EV-01', isHead: true },
      { name: 'Raksha Jagadeesha', role: 'Member', code: 'EV-02' },
      { name: 'Soham N Jain', role: 'Member', code: 'EV-03' },
      { name: 'Shreyas S Patil', role: 'Member', code: 'EV-04' },
      { name: 'Keerthana', role: 'Member', code: 'EV-05' },
      { name: 'Anya Miryam Camoens', role: 'Member', code: 'EV-06' },
      { name: 'M Hemanth Reddy', role: 'Member', code: 'EV-07' },
      { name: 'V Jayanth', role: 'Member', code: 'EV-08' },
    ],
  },
  {
    id: 'hospitality',
    index: '05',
    name: 'Hospitality',
    folderNames: ['Hospitality'],
    tagline: 'Guest Relations, Accommodations & VIP Care',
    members: [
      { name: 'Deepthi M', role: 'Head', code: 'HS-01', isHead: true },
      { name: 'Akshay', role: 'Member', code: 'HS-02' },
      { name: 'Harshith D Raj', role: 'Member', code: 'HS-03' },
    ],
  },
  {
    id: 'marketing-and-sponsorship',
    index: '06',
    name: 'Marketing And Sponsorship',
    folderNames: ['Marketing and sponsorship', 'Marketing', 'Sponsorship'],
    tagline: 'Corporate Partnerships, Outreach & Brand Growth',
    members: [
      { name: 'Kotresh', role: 'Head', code: 'MK-01', isHead: true },
      { name: 'Zainaba', role: 'Lead', code: 'MK-02' },
      { name: 'Rishiman Dadwal', role: 'Member', code: 'MK-03' },
      { name: 'T Lokeshwar Reddy', role: 'Member', code: 'MK-04' },
      { name: 'Varsha Sanjay', role: 'Member', code: 'MK-05' },
      { name: 'Baibhav Kumar', role: 'Member', code: 'MK-06' },
      { name: 'Ankit', role: 'Member', code: 'MK-07' },
      { name: 'Veeksha Reddy', role: 'Member', code: 'MK-08' },
      
    ],
  },
  {
    id: 'operations',
    index: '07',
    name: 'Operations',
    folderNames: ['Operations', 'Ops'],
    tagline: 'Resource Planning, Security & Venue Setup',
    members: [
      { name: 'Vaibhavi L', role: 'Head', code: 'OP-01', isHead: true },
      { name: 'Dhruvisha', role: 'Member', code: 'OP-02' },
      { name: 'Sanjana N', role: 'Member', code: 'OP-03' },
      { name: 'Sri Charan', role: 'Member', code: 'OP-04' },
      { name: 'Mohammed Sohail Hussain', role: 'Member', code: 'OP-05' },
      { name: 'Manas Reddy', role: 'Member', code: 'OP-06' },
      { name: 'Aditi', role: 'Member', code: 'OP-07' },
      { name: 'Ritik Kumar Tiwary', role: 'Member', code: 'OP-08' },
    ],
  },
  {
    id: 'rnd',
    index: '08',
    name: 'R&D',
    folderNames: ['R&D', 'RnD', 'RD', 'Research and Development'],
    tagline: 'Quantum Research, Whitepapers & Experimental Circuits',
    members: [
      { name: 'Hari Narayan', role: 'Head', code: 'RD-01', isHead: true },
      { name: 'Dhruvajyoti Malik', role: 'Member', code: 'RD-02' },
      { name: 'Hana Fathima Ameen', role: 'Member', code: 'RD-04' },
      { name: 'Neha', role: 'Member', code: 'RD-05' },
      { name: 'Sharanya', role: 'Member', code: 'RD-06' },
      { name: 'Nanditha', role: 'Member', code: 'RD-07' },
      { name: 'A S Harish', role: 'Member', code: 'RD-08' },
      { name: 'Shreeya Attri', role: 'Member', code: 'RD-09' },
      { name: 'Kunal Kulkarni', role: 'Member', code: 'RD-10' },
    ],
  },
  {
    id: 'social-media',
    index: '09',
    name: 'Social Media',
    folderNames: ['Social Media', 'SocialMedia', 'Social'],
    tagline: 'Digital Campaigns, Content Creation & Community',
    members: [
      { name: 'Harshitha S', role: 'Head', code: 'SM-01', isHead: true },
      { name: 'Lingala Hasini Reddy', role: 'Member', code: 'SM-02' },
      { name: 'Haniel J Josephus', role: 'Member', code: 'SM-03' },
      { name: 'Varun Sharma', role: 'Member', code: 'SM-04' },
      { name: 'Tejas S Reddy', role: 'Member', code: 'SM-05' },
      { name: 'Mradul', role: 'Member', code: 'SM-06' },
      { name: 'Varsha R', role: 'Member', code: 'SM-07' },
      { name: 'Gayatri', role: 'Member', code: 'SM-08' },
    ],
  },
];

// Optional Leadership / Faculty folder configurations (if folders exist)
const SPECIAL_GROUPS = [
  {
    id: 'leadership',
    name: 'Leadership',
    folderNames: ['Leadership', 'Core', 'Presidents'],
    members: LEADERSHIP_DATA,
  },
  {
    id: 'faculty',
    name: 'Faculty',
    folderNames: ['Faculty', 'Advisors', 'Mentors'],
    members: FACULTY_DATA,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STRING NORMALIZATION & TOKENIZATION
// ─────────────────────────────────────────────────────────────────────────────

function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[_\-\.]+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTokens(str) {
  return normalizeText(str)
    .split(' ')
    .filter(Boolean);
}

// ─────────────────────────────────────────────────────────────────────────────
// FUZZY STRING & TOKEN SIMILARITY
// ─────────────────────────────────────────────────────────────────────────────

function levenshteinDistance(s1, s2) {
  if (s1 === s2) return 0;
  if (!s1.length) return s2.length;
  if (!s2.length) return s1.length;

  const v0 = new Array(s2.length + 1);
  const v1 = new Array(s2.length + 1);

  for (let i = 0; i <= s2.length; i++) v0[i] = i;

  for (let i = 0; i < s1.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < s2.length; j++) {
      const cost = s1[i] === s2[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= s2.length; j++) v0[j] = v1[j];
  }
  return v1[s2.length];
}

function stringSimilarity(s1, s2) {
  const n1 = normalizeText(s1);
  const n2 = normalizeText(s2);
  if (n1 === n2) return 1.0;
  if (!n1.length || !n2.length) return 0.0;
  const maxLen = Math.max(n1.length, n2.length);
  const dist = levenshteinDistance(n1, n2);
  return 1 - dist / maxLen;
}

/**
 * Computes a smart similarity score between extracted candidate name and roster member name:
 * 1. Exact string match = 1.0
 * 2. Token-level soft alignment (handles name subsets, transposed letters, initials)
 */
function computeNameScore(candidateName, rosterName) {
  const cNorm = normalizeText(candidateName);
  const rNorm = normalizeText(rosterName);

  if (cNorm === rNorm) return 1.0;

  const cTokens = getTokens(candidateName);
  const rTokens = getTokens(rosterName);

  if (!cTokens.length || !rTokens.length) return 0.0;

  // Direct whole-string similarity
  const directScore = stringSimilarity(cNorm, rNorm);

  // Soft token bipartite matching
  let rTokenMatchesSum = 0;
  for (const rTok of rTokens) {
    let bestTokScore = 0;
    for (const cTok of cTokens) {
      let tokSim = stringSimilarity(rTok, cTok);
      // Check if one is an initial of the other
      if ((cTok.length === 1 && rTok.startsWith(cTok)) || (rTok.length === 1 && cTok.startsWith(rTok))) {
        tokSim = Math.max(tokSim, 0.90);
      }
      if (tokSim > bestTokScore) bestTokScore = tokSim;
    }
    rTokenMatchesSum += bestTokScore;
  }
  const rCoverage = rTokenMatchesSum / rTokens.length;

  let cTokenMatchesSum = 0;
  for (const cTok of cTokens) {
    let bestTokScore = 0;
    for (const rTok of rTokens) {
      let tokSim = stringSimilarity(cTok, rTok);
      if ((cTok.length === 1 && rTok.startsWith(cTok)) || (rTok.length === 1 && cTok.startsWith(rTok))) {
        tokSim = Math.max(tokSim, 0.90);
      }
      if (tokSim > bestTokScore) bestTokScore = tokSim;
    }
    cTokenMatchesSum += bestTokScore;
  }
  const cCoverage = cTokenMatchesSum / cTokens.length;

  // Candidate is a single name / first name matching roster first name (e.g. "karthik" vs "Karthik S Rao")
  let prefixBonus = 0;
  const firstTokSim = stringSimilarity(cTokens[0], rTokens[0]);
  if (firstTokSim >= 0.85) {
    if (cTokens.length === 1) {
      prefixBonus = 0.85 * firstTokSim;
    } else if (cTokens.length === 2 && cTokens[1].length === 1 && rTokens.length >= 2 && rTokens[1].startsWith(cTokens[1])) {
      prefixBonus = 0.92 * firstTokSim;
    }
  }

  const tokenBlendScore = rCoverage * 0.6 + cCoverage * 0.4;
  return Math.max(directScore, tokenBlendScore, prefixBonus);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTRACT CLEAN PERSON NAME FROM FILENAME
// ─────────────────────────────────────────────────────────────────────────────

const COMMON_DOMAIN_KEYWORDS = new Set([
  'technical', 'techie', 'tech',
  'administration', 'admin',
  'design', 'designing',
  'events', 'event',
  'hospitality',
  'marketing', 'sponsorship', 'sponsors', 'market',
  'operations', 'ops',
  'rnd', 'rd', 'research', 'development',
  'social', 'media',
  'leadership', 'faculty', 'president', 'vice',
  '2yr', 'yr', 'pdf', 'img', 'photo', 'picture', 'pic', 'final', 'copy',
]);

function extractPersonName(filename, domainFolderNames = []) {
  // Strip file extension
  const stem = path.basename(filename, path.extname(filename));

  // Build full set of domain synonyms to strip
  const domainWords = new Set([...COMMON_DOMAIN_KEYWORDS]);
  for (const folder of domainFolderNames) {
    for (const word of getTokens(folder)) {
      domainWords.add(word);
    }
  }

  // Split stem into raw tokens by underscores, hyphens, spaces, dots
  const rawTokens = stem
    .replace(/[_\-\.]+/g, ' ')
    .split(' ')
    .filter(Boolean);

  // Filter out trailing domain words or noise words from the end of the filename
  const cleanTokens = [...rawTokens];
  while (cleanTokens.length > 1) {
    const lastNorm = normalizeText(cleanTokens[cleanTokens.length - 1]);
    if (domainWords.has(lastNorm)) {
      cleanTokens.pop();
    } else {
      break;
    }
  }

  // Also filter any leading domain words if present
  while (cleanTokens.length > 1) {
    const firstNorm = normalizeText(cleanTokens[0]);
    if (domainWords.has(firstNorm)) {
      cleanTokens.shift();
    } else {
      break;
    }
  }

  return cleanTokens.join(' ');
}

function isUsableImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXTS.has(ext)) return false;

  // Detect and skip HEIC/ISOBMFF containers that have .jpg/.png extension or raw format
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);
    fs.closeSync(fd);
    if (buf.slice(4, 8).toString('ascii') === 'ftyp') {
      const brand = buf.slice(8, 12).toString('ascii').toLowerCase();
      if (['heic', 'heis', 'mif1', 'msf1', 'avci', 'avcs'].includes(brand)) {
        return false;
      }
    }
  } catch {
    // Proceed if file read is not possible
  }
  return true;
}

function toSafeSlug(code, originalFilename) {
  const ext = path.extname(originalFilename).toLowerCase();
  const safeCode = code.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `${safeCode}${ext}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MATCHING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function runPhotoMatching() {
  fs.mkdirSync(PHOTOS_DEST, { recursive: true });

  const matchedList = [];
  const pendingList = [];
  const unmatchedFiles = [];
  const photoMap = {};

  const applyManualOverride = (group, matchingFolder, folderPath, files) => {
    const memberCodeToOverride = Object.entries(MANUAL_PHOTO_OVERRIDES).find(([code, override]) => {
      const member = group.members.find((item) => item.code === code);
      if (!member) return false;

      const sourceFolder = override.sourceFolder ?? matchingFolder;
      const sourcePath = path.join(PHOTOS_SRC, sourceFolder, override.file);
      return fs.existsSync(sourcePath);
    });

    if (!memberCodeToOverride) return;

    const [code, override] = memberCodeToOverride;
    const memberIndex = group.members.findIndex((member) => member.code === code);
    if (memberIndex === -1 || group.members[memberIndex].photo) return;

    const sourceFolder = override.sourceFolder ?? matchingFolder;
    const srcPath = path.join(PHOTOS_SRC, sourceFolder, override.file);
    const destSlug = toSafeSlug(code, override.file);
    const destPath = path.join(PHOTOS_DEST, destSlug);
    fs.copyFileSync(srcPath, destPath);
    photoMap[code] = `/team-photos/${destSlug}`;

    matchedList.push({
      code,
      name: group.members[memberIndex].name,
      group: group.name,
      file: override.file,
      destSlug,
      score: '1.00',
    });

    return memberIndex;
  };

  // Find all available domain subfolders inside "q-bits team"
  const availableSubfolders = fs.existsSync(PHOTOS_SRC)
    ? fs.readdirSync(PHOTOS_SRC).filter((item) => {
        try {
          return fs.statSync(path.join(PHOTOS_SRC, item)).isDirectory();
        } catch {
          return false;
        }
      })
    : [];

  const allGroups = [...DOMAINS_DATA, ...SPECIAL_GROUPS];

  for (const group of allGroups) {
    if (!group.members || group.members.length === 0) continue;

    // Find the matching directory for this group
    let matchingFolder = null;
    for (const folderName of group.folderNames) {
      const match = availableSubfolders.find(
        (f) => normalizeText(f) === normalizeText(folderName),
      );
      if (match) {
        matchingFolder = match;
        break;
      }
    }

    if (!matchingFolder) {
      // Group folder not found on disk, mark all members as pending
      for (const member of group.members) {
        pendingList.push({ code: member.code, name: member.name, group: group.name });
      }
      continue;
    }

    const folderPath = path.join(PHOTOS_SRC, matchingFolder);
    const files = fs.readdirSync(folderPath);
    const claimedIndices = new Set();
    const candidateMatches = [];

    const manualOverrideIndex = applyManualOverride(group, matchingFolder, folderPath, files);
    if (manualOverrideIndex !== undefined) {
      claimedIndices.add(manualOverrideIndex);
    }

    for (const file of files) {
      const fullFilePath = path.join(folderPath, file);
      if (fs.statSync(fullFilePath).isDirectory()) continue;

      if (!isUsableImageFile(fullFilePath)) {
        unmatchedFiles.push({
          folder: matchingFolder,
          file,
          reason: 'Unsupported format (PDF / HEIC / document)',
        });
        continue;
      }

      const extractedName = extractPersonName(file, group.folderNames);

      // Score against each roster member in this group
      let bestScore = 0;
      let bestIndex = -1;

      group.members.forEach((member, index) => {
        const score = computeNameScore(extractedName, member.name);
        if (score > bestScore) {
          bestScore = score;
          bestIndex = index;
        }
      });

      if (bestIndex >= 0 && bestScore >= MATCH_THRESHOLD) {
        candidateMatches.push({
          file,
          memberIndex: bestIndex,
          score: bestScore,
          extractedName,
        });
      } else {
        unmatchedFiles.push({
          folder: matchingFolder,
          file,
          reason: `No confident roster match (extracted: "${extractedName}", best score: ${bestScore.toFixed(2)})`,
        });
      }
    }

    const extensionPriority = {
      '.png': 4,
      '.webp': 3,
      '.jpg': 2,
      '.jpeg': 2,
      '.gif': 1,
      '.avif': 1,
    };

    // Sort candidate matches by highest score first, then prefer higher-quality formats
    // for exact same-name duplicates (e.g. Syed_Maaz_Tech.jpg vs Syed_Maaz_tech.png).
    candidateMatches.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;

      const aPriority = extensionPriority[path.extname(a.file).toLowerCase()] ?? 0;
      const bPriority = extensionPriority[path.extname(b.file).toLowerCase()] ?? 0;
      return bPriority - aPriority;
    });

    for (const match of candidateMatches) {
      if (claimedIndices.has(match.memberIndex)) {
        unmatchedFiles.push({
          folder: matchingFolder,
          file: match.file,
          reason: `Duplicate match for "${group.members[match.memberIndex].name}" (already assigned higher scoring photo)`,
        });
        continue;
      }

      claimedIndices.add(match.memberIndex);
      const member = group.members[match.memberIndex];
      const destSlug = toSafeSlug(member.code, match.file);
      const destPath = path.join(PHOTOS_DEST, destSlug);
      const srcPath = path.join(folderPath, match.file);

      fs.copyFileSync(srcPath, destPath);
      const publicUrl = `/team-photos/${destSlug}`;
      photoMap[member.code] = publicUrl;

      matchedList.push({
        code: member.code,
        name: member.name,
        group: group.name,
        file: match.file,
        destSlug,
        score: match.score.toFixed(2),
      });
    }

    // Remaining members in this group have no photo
    group.members.forEach((member, index) => {
      if (!claimedIndices.has(index)) {
        pendingList.push({
          code: member.code,
          name: member.name,
          group: group.name,
        });
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ASSEMBLE OUTPUT DATA & WRITE teamMembers.js
  // ─────────────────────────────────────────────────────────────────────────

  const resolvedFaculty = FACULTY_DATA.map((m) => ({
    ...m,
    photo: photoMap[m.code] ?? null,
    photoUrl: photoMap[m.code] ?? null,
  }));

  const resolvedLeadership = LEADERSHIP_DATA.map((m) => ({
    ...m,
    photo: photoMap[m.code] ?? null,
    photoUrl: photoMap[m.code] ?? null,
  }));

  const resolvedDomains = DOMAINS_DATA.map(({ folderNames: _, ...domain }) => ({
    ...domain,
    members: domain.members.map((m) => ({
      ...m,
      photo: photoMap[m.code] ?? null,
      photoUrl: photoMap[m.code] ?? null,
    })),
  }));

  const fileOutput = [
    `// This file is generated dynamically by scripts/generate-team-members.mjs. Do not edit manually.`,
    `export const FACULTY_DATA = ${JSON.stringify(resolvedFaculty, null, 2)};`,
    ``,
    `export const LEADERSHIP_DATA = ${JSON.stringify(resolvedLeadership, null, 2)};`,
    ``,
    `export const DOMAINS_DATA = ${JSON.stringify(resolvedDomains, null, 2)};`,
    ``,
  ].join('\n');

  fs.writeFileSync(OUTPUT_FILE, fileOutput, 'utf8');

  // ─────────────────────────────────────────────────────────────────────────
  // CLI OUTPUT LOG
  // ─────────────────────────────────────────────────────────────────────────

  const BOLD = '\x1b[1m';
  const GREEN = '\x1b[32m';
  const YELLOW = '\x1b[33m';
  const RED = '\x1b[31m';
  const CYAN = '\x1b[36m';
  const RESET = '\x1b[0m';

  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════════════╗`);
  console.log(`║        Q-Bits Team Photo Matching System (Auto)          ║`);
  console.log(`╚══════════════════════════════════════════════════════════╝${RESET}\n`);

  console.log(`${BOLD}${GREEN}✅ MATCHED PHOTOS (${matchedList.length})${RESET}`);
  if (matchedList.length === 0) {
    console.log(`   (No photos matched yet. Add photos to "q-bits team/<Domain>/")`);
  } else {
    for (const item of matchedList) {
      console.log(
        `   ${GREEN}${item.code}${RESET}  ${item.name.padEnd(26)} ← ${item.file}  [score: ${item.score}]`,
      );
    }
  }

  console.log(`\n${BOLD}${YELLOW}⏳ PHOTO PENDING (${pendingList.length})${RESET}`);
  for (const item of pendingList) {
    console.log(
      `   ${YELLOW}${item.code}${RESET}  ${item.name.padEnd(26)} [${item.group}]`,
    );
  }

  if (unmatchedFiles.length > 0) {
    console.log(`\n${BOLD}${RED}⚠️  UNMATCHED FILES IN FOLDER (${unmatchedFiles.length})${RESET}`);
    for (const item of unmatchedFiles) {
      console.log(`   ${RED}${item.folder}/${item.file}${RESET}`);
      console.log(`      → ${item.reason}`);
    }
  }

  const totalMembers = matchedList.length + pendingList.length;
  console.log(`\n${BOLD}Summary:${RESET} ${matchedList.length}/${totalMembers} members matched. teamMembers.js updated successfully.\n`);
}

runPhotoMatching();
