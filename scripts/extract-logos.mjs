import fs from 'fs';
import path from 'path';

const outDir = './public/sponsors';
fs.mkdirSync(outDir, { recursive: true });

// Read the transcript to get the base64 from the prompt or write the exact files
const transcriptPath = 'C:\\Users\\waste\\.gemini\\antigravity\\brain\\1a7e216b-28e6-481a-ac6c-a5125f134fd1\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
let fullText = '';
for (const line of lines) {
  if (line.includes('qpiai.tech') || line.includes('codecrafters.io')) {
    fullText += line;
  }
}

// Regex match the data URLs
const qpiMatch = fullText.match(/https:\/\/www\.qpiai\.tech\/.*?src=\\?"data:image\/png;base64,([^"'\\]+)/);
if (qpiMatch) {
  fs.writeFileSync(path.join(outDir, 'qpiai.png'), Buffer.from(qpiMatch[1], 'base64'));
  console.log('Saved qpiai.png');
}

const growthMatch = fullText.match(/https:\/\/www\.growth-sense\.com\/.*?src=\\?"data:image\/png;base64,([^"'\\]+)/);
if (growthMatch) {
  fs.writeFileSync(path.join(outDir, 'growth-sense.png'), Buffer.from(growthMatch[1], 'base64'));
  console.log('Saved growth-sense.png');
}

const hydMatch = fullText.match(/https:\/\/hyderabadangels\.in\/.*?src=\\?"data:image\/png;base64,([^"'\\]+)/);
if (hydMatch) {
  fs.writeFileSync(path.join(outDir, 'hyderabad-angels.png'), Buffer.from(hydMatch[1], 'base64'));
  console.log('Saved hyderabad-angels.png');
}

const codeMatch = fullText.match(/https:\/\/codecrafters\.io\/.*?src=\\?"data:image\/png;base64,([^"'\\]+)/);
if (codeMatch) {
  fs.writeFileSync(path.join(outDir, 'codecrafters.png'), Buffer.from(codeMatch[1], 'base64'));
  console.log('Saved codecrafters.png');
}
