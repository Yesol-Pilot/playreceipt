import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

function runCli(args) {
  return spawnSync(process.execPath, ["src/cli.js", ...args], { cwd: root, encoding: "utf8" });
}

test("README audit command works without --out", () => {
  const result = runCli(["audit", "examples/overclock-20260717.json"]);
  assert.equal(result.status, 2);
  assert.equal(JSON.parse(result.stdout).verdict, "REPAIR");
});

test("README repaired simulation does not silently fall back to broken", () => {
  const result = runCli(["simulate", "repaired"]);
  const receipt = JSON.parse(result.stdout);
  assert.equal(result.status, 4);
  assert.equal(receipt.project, "PlayReceipt sandbox (repaired)");
  assert.equal(receipt.verdict, "HUMAN_REVIEW");
});
