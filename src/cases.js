import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { auditGameEvidence } from "./audit.js";
import { simulatePolicies, simulationToAuditInput } from "./simulate.js";

const root = fileURLToPath(new URL("../", import.meta.url));

export async function getReceipt(caseName = "overclock") {
  if (caseName === "broken" || caseName === "repaired") {
    return auditGameEvidence(simulationToAuditInput(simulatePolicies({ mode: caseName })));
  }
  if (caseName === "overclock") {
    const raw = await readFile(join(root, "examples", "overclock-20260717.json"), "utf8");
    return auditGameEvidence(JSON.parse(raw));
  }
  return null;
}
