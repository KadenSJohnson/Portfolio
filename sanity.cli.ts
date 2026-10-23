import { defineCliConfig } from "sanity/cli";
import { SANITY } from "./sanity.project.mjs";

export default defineCliConfig({
  api: { projectId: SANITY.projectId, dataset: SANITY.dataset },
  project: { basePath: "/admin" },
  autoUpdates: false,
});
