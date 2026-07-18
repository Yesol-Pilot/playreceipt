import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { auditGameEvidence } from "../src/audit.js";

const root = fileURLToPath(new URL("../", import.meta.url));

function runCli(args) {
  return spawnSync(process.execPath, ["src/cli.js", ...args], { cwd: root, encoding: "utf8" });
}

test("README audit command works without --out", () => {
  const result = runCli(["audit", "examples/overclock-20260717.json"]);
  const input = JSON.parse(readFileSync(new URL("../examples/overclock-20260717.json", import.meta.url), "utf8"));
  assert.equal(result.status, 2);
  assert.deepEqual(JSON.parse(result.stdout), auditGameEvidence(input));
});

test("README repaired simulation does not silently fall back to broken", () => {
  const result = runCli(["simulate", "repaired"]);
  const receipt = JSON.parse(result.stdout);
  assert.equal(result.status, 4);
  assert.equal(receipt.project, "PlayReceipt sandbox (repaired)");
  assert.equal(receipt.verdict, "HUMAN_REVIEW");
});
