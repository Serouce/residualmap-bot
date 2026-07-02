import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const wranglerPath = join(root, "wrangler.toml");
const apply = process.argv.includes("--apply");

if (!existsSync(wranglerPath)) {
  console.error("wrangler.toml is missing.");
  process.exit(1);
}

const original = readFileSync(wranglerPath, "utf8");
const replacements = [
  {
    label: "MINI_APP_URL",
    pattern: /MINI_APP_URL\s*=\s*"https:\/\/[^"\s]+\.workers\.dev\/app"/,
    replacement: 'MINI_APP_URL = "https://your-worker.example/app"'
  },
  {
    label: "D1 database_id",
    pattern: /database_id\s*=\s*"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"/i,
    replacement: 'database_id = "replace_with_your_cloudflare_d1_database_id"'
  }
];

let next = original;
const changed = [];
const missing = [];

for (const item of replacements) {
  if (item.pattern.test(next)) {
    next = next.replace(item.pattern, item.replacement);
    changed.push(item.label);
  } else {
    missing.push(item.label);
  }
}

if (changed.length === 0) {
  console.log("wrangler.toml already looks template-safe for public config values.");
  process.exit(0);
}

console.log("Public config cutover would replace:");
for (const item of changed) console.log(`- ${item}`);

if (missing.length > 0) {
  console.log("");
  console.log("Values not found or already template-safe:");
  for (const item of missing) console.log(`- ${item}`);
}

if (!apply) {
  console.log("");
  console.log("Dry run only. Re-run with --apply on the public template branch to update wrangler.toml.");
  process.exit(0);
}

writeFileSync(wranglerPath, next);
console.log("");
console.log("wrangler.toml updated for public template publishing.");
console.log("Do not deploy the private production bot from this public template config.");
