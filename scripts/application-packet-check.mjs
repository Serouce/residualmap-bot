import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packetPath = join(root, "docs", "APPLICATION_PACKET.md");
const signalsPath = join(root, "docs", "ADOPTION_SIGNALS.md");
const failures = [];
const warnings = [];

if (!existsSync(packetPath)) {
  fail("docs/APPLICATION_PACKET.md is missing.");
  report();
}

const packet = readFileSync(packetPath, "utf8");
const signals = existsSync(signalsPath) ? readFileSync(signalsPath, "utf8") : "";

const fieldChecks = [
  { label: "Describe your role:", max: 500, required: true },
  { label: "Why does this repository qualify? (500 chars max)", max: 500, required: true },
  { label: "How will you use API credits for your project? (500 chars max)", max: 500, required: true },
  { label: "Anything else we should know? (500 chars max)", max: 500, required: true },
  { label: "Why this repository qualifies:", max: 500, required: true },
  { label: "API credits use:", max: 500, required: true },
  { label: "Anything else:", max: 500, required: true }
];

for (const field of fieldChecks) {
  const value = paragraphAfter(packet, field.label);
  if (!value) {
    if (field.required) fail(`Missing application field draft: ${field.label}`);
    continue;
  }
  if (value.length > field.max) {
    fail(`${field.label} is ${value.length} characters; keep it at or below ${field.max}.`);
  }
}

checkHonesty(packet, "docs/APPLICATION_PACKET.md");
if (signals) checkHonesty(signals, "docs/ADOPTION_SIGNALS.md");

if (/Current known blocker:/i.test(packet)) {
  warnings.push("APPLICATION_PACKET still lists current known blockers; do not submit until those are resolved.");
}
if (/Repository visibility \| Private until changed/i.test(signals)) {
  warnings.push("ADOPTION_SIGNALS still records repository visibility as private; update evidence before submitting.");
}
if (!/early public template|early self-hosted OSS template/i.test(packet)) {
  warnings.push("Application packet should keep early-stage wording unless real adoption evidence exists.");
}

report();

function paragraphAfter(text, label) {
  const start = text.indexOf(label);
  if (start === -1) return "";
  const lines = text.slice(start + label.length).split(/\r?\n/);
  const paragraph = [];
  let collecting = false;

  for (const line of lines) {
    if (!collecting && line.trim() === "") continue;
    if (!collecting) collecting = true;
    if (line.trim() === "") break;
    paragraph.push(line.trim());
  }

  return paragraph.join(" ");
}

function checkHonesty(text, source) {
  const avoidSection = source === "docs/ADOPTION_SIGNALS.md";
  const hardOverclaims = [
    /guaranteed approval/i,
    /fully private/i,
    /zero data leaves your infrastructure/i
  ];

  for (const pattern of hardOverclaims) {
    if (pattern.test(text) && !avoidSection) {
      fail(`${source} contains overclaim phrase matching ${pattern}.`);
    }
  }

  if (/widely adopted/i.test(text) && !/not (?:a )?widely adopted|not yet widely adopted|widely adopted.*yet|before evidence/i.test(text)) {
    fail(`${source} may claim wide adoption without qualifying evidence.`);
  }
}

function fail(message) {
  failures.push(message);
}

function report() {
  if (warnings.length > 0) {
    console.log("Application packet warnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
    console.log("");
  }

  if (failures.length > 0) {
    console.error("Application packet check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log("Application packet check passed.");
}
