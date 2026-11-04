// Builds Sanity Studio into dist/admin after the Astro build. Skipped until a project ID is set.
import { spawnSync } from "node:child_process";
import { SANITY } from "../sanity.project.mjs";

if (!SANITY.projectId) {
  console.log("[studio] No Sanity project ID in sanity.project.mjs yet; skipping the Studio build.");
  process.exit(0);
}
const r = spawnSync("npx", ["sanity", "build", "dist/admin", "--yes"], { stdio: "inherit", shell: process.platform === "win32" });
process.exit(r.status ?? 1);
