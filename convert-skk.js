const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

const inputPath = path.join(__dirname, "SKK-JISYO.L");
const outputPath = path.join(__dirname, "dictionary.json");

const buffer = fs.readFileSync(inputPath);
const raw = iconv.decode(buffer, "euc-jp");
const lines = raw.split(/\r?\n/);

const dict = {};

for (const line of lines) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith(";;")) continue;

  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) continue;

  const key = trimmed.slice(0, firstSpace).trim();
  const rest = trimmed.slice(firstSpace).trim();

  if (!key || !rest.startsWith("/")) continue;

  const rawCandidates = rest.split("/").filter(Boolean);
  const cleanedCandidates = [];

  for (let candidate of rawCandidates) {
    candidate = candidate.split(";")[0].trim();
    candidate = candidate.replace(/\[[^\]]*\]/g, "").trim();

    if (!candidate) continue;
    if (!cleanedCandidates.includes(candidate)) {
      cleanedCandidates.push(candidate);
    }
  }

  if (cleanedCandidates.length > 0) {
    dict[key] = cleanedCandidates;
  }
}

fs.writeFileSync(outputPath, JSON.stringify(dict, null, 2), "utf8");
console.log(`Done. Wrote ${Object.keys(dict).length} entries to ${outputPath}`);