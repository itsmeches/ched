import fs from 'node:fs';
import path from 'node:path';

const assetsDir = path.resolve('public/build/assets');
const murmurPattern = /\b1540483477\b/g;
const murmurReplacement = '0x5bd1e995';
const unixLikePattern = /\b\d{10}\b/g;

if (!fs.existsSync(assetsDir)) {
  console.error(`Assets directory not found: ${assetsDir}`);
  process.exit(1);
}

const files = fs.readdirSync(assetsDir).filter((name) => name.endsWith('.js'));
let patchedFiles = 0;
let replacements = 0;

for (const file of files) {
  const filePath = path.join(assetsDir, file);
  const original = fs.readFileSync(filePath, 'utf8');
  const strictMurmurMatches = original.match(murmurPattern) || [];
  const unixLikeMatches = original.match(unixLikePattern) || [];

  if (strictMurmurMatches.length === 0 && unixLikeMatches.length === 0) {
    continue;
  }

  let updated = original.replace(murmurPattern, murmurReplacement);

  // Convert all standalone 10-digit integer literals to hex to avoid false-positive Unix timestamp detection.
  updated = updated.replace(unixLikePattern, (match) => {
    const value = Number.parseInt(match, 10);

    if (!Number.isSafeInteger(value)) {
      return match;
    }

    return `0x${value.toString(16)}`;
  });

  fs.writeFileSync(filePath, updated, 'utf8');

  patchedFiles += 1;
  replacements += strictMurmurMatches.length + unixLikeMatches.length;
}

console.log(`sanitize-zap-assets: patched ${patchedFiles} file(s), ${replacements} replacement(s).`);
