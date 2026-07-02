import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "LICENSE",
  "README.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SUPPORT.md",
  "SECURITY.md",
  "PRIVACY.md",
  "wrangler.example.toml",
  ".dev.vars.example",
  ".github/workflows/ci.yml",
  ".github/dependabot.yml",
  ".github/PULL_REQUEST_TEMPLATE.md",
  "docs/DEPLOYMENT.md",
  "docs/ARCHITECTURE.md",
  "docs/CODEX_FOR_OSS.md",
  "docs/APPLICATION_PACKET.md",
  "docs/ADOPTION_SIGNALS.md",
  "docs/PUBLISHING_CHECKLIST.md",
  "docs/PUBLICATION_RUNBOOK.md",
  "docs/ROADMAP.md",
  "docs/ISSUE_DRAFTS.md",
  "docs/DEMO.md",
  "docs/BACKUP_RESTORE.md",
  "docs/RELEASE_CHECKLIST.md",
  "docs/MAINTAINER_GUIDE.md",
  "scripts/application-packet-check.mjs",
  "scripts/prepare-public-config.mjs",
  "scripts/public-readiness-check.mjs"
];

const forbiddenPaths = [
  ".dev.vars",
  ".env",
  ".env.local",
  ".env.production"
];

const ignoredDirs = new Set([".git", "node_modules", ".wrangler"]);
const ignoredFiles = new Set(["package-lock.json"]);
const allowedSecretPatternDocs = new Set([
  "docs/PUBLICATION_RUNBOOK.md"
]);
const allowedPhraseDocs = new Set([
  "docs/ADOPTION_SIGNALS.md",
  "scripts/application-packet-check.mjs",
  "scripts/public-readiness-check.mjs"
]);

const failures = [];
const warnings = [];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    failures.push(`Missing required public-readiness file: ${file}`);
  }
}

for (const file of forbiddenPaths) {
  if (existsSync(join(root, file))) {
    failures.push(`Private env file must not be committed or present for public review: ${file}`);
  }
}

if (existsSync(join(root, "private-backups"))) {
  failures.push("private-backups/ exists in the repository root; remove it before publishing.");
}

checkWrangler();
checkDevVarsExample();
scanTextFiles();

report();

function checkWrangler() {
  const wranglerPath = join(root, "wrangler.toml");
  if (!existsSync(wranglerPath)) {
    failures.push("wrangler.toml is missing. Public branches should include a template-safe wrangler.toml.");
    return;
  }

  const wrangler = readFileSync(wranglerPath, "utf8");
  if (/https:\/\/[^"\s]+\.workers\.dev\/app/.test(wrangler)) {
    failures.push("wrangler.toml contains a concrete workers.dev Mini App URL. Use https://your-worker.example/app before publishing.");
  }
  if (/database_id\s*=\s*"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"/i.test(wrangler)) {
    failures.push("wrangler.toml contains a concrete D1 database_id. Use replace_with_your_cloudflare_d1_database_id before publishing.");
  }
  if (/ALLOWED_TELEGRAM_IDS\s*=/.test(wrangler)) {
    failures.push("wrangler.toml must not contain ALLOWED_TELEGRAM_IDS; keep personal Telegram IDs in secrets or .dev.vars.");
  }
}

function checkDevVarsExample() {
  const examplePath = join(root, ".dev.vars.example");
  if (!existsSync(examplePath)) return;

  const example = readFileSync(examplePath, "utf8");
  if (/ALLOWED_TELEGRAM_IDS=\d/.test(example)) {
    failures.push(".dev.vars.example contains a numeric Telegram ID. Keep it as a placeholder.");
  }
  if (/TELEGRAM_BOT_TOKEN=\d+:[A-Za-z0-9_-]+/.test(example)) {
    failures.push(".dev.vars.example contains a Telegram bot token-shaped value.");
  }
  if (/OPENAI_API_KEY=sk-[A-Za-z0-9_-]+/.test(example)) {
    failures.push(".dev.vars.example contains an OpenAI key-shaped value.");
  }
}

function scanTextFiles() {
  for (const file of listFiles(root)) {
    const rel = normalize(relative(root, file));
    if (ignoredFiles.has(rel)) continue;
    const text = readText(file);
    if (text === null) continue;

    if (!allowedSecretPatternDocs.has(rel)) {
      if (/OPENAI_API_KEY=sk-[A-Za-z0-9_-]+/.test(text)) {
        failures.push(`${rel} contains an OpenAI key-shaped value.`);
      }
      if (/TELEGRAM_BOT_TOKEN=\d+:[A-Za-z0-9_-]+/.test(text)) {
        failures.push(`${rel} contains a Telegram bot token-shaped value.`);
      }
      if (/CLOUDFLARE_API_TOKEN=[A-Za-z0-9_-]{20,}/.test(text)) {
        failures.push(`${rel} contains a Cloudflare token-shaped value.`);
      }
      if (/BEGIN (RSA|OPENSSH|PRIVATE) KEY/.test(text)) {
        failures.push(`${rel} contains a private key marker.`);
      }
    }

    if (/fully private|zero data leaves your infrastructure|guaranteed approval/i.test(text) && !allowedPhraseDocs.has(rel)) {
      warnings.push(`${rel} contains a phrase that may overpromise privacy or approval.`);
    }
  }
}

function* listFiles(dir) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      yield* listFiles(path);
    } else {
      yield path;
    }
  }
}

function readText(file) {
  const buffer = readFileSync(file);
  if (buffer.includes(0)) return null;
  return buffer.toString("utf8");
}

function normalize(path) {
  return path.replaceAll("\\", "/");
}

function report() {
  if (warnings.length > 0) {
    console.log("Public readiness warnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
    console.log("");
  }

  if (failures.length > 0) {
    console.error("Public readiness check failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log("Public readiness check passed.");
}
