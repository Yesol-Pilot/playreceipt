import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { auditGameEvidence } from "../src/audit.js";
import repaired from "../examples/repaired-evidence.json" with { type: "json" };

test("GitHub Action exposes a stable human-review receipt without failing CI", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "playreceipt-action-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const output = join(directory, "output.txt");
  const summary = join(directory, "summary.md");
  const evidence = join(directory, "evidence.json");
  await writeFile(evidence, JSON.stringify(repaired), "utf8");
  const action = fileURLToPath(new URL("../src/action.js", import.meta.url));
  const run = spawnSync(process.execPath, [action], {
    cwd: directory,
    encoding: "utf8",
    env: {
      ...process.env,
      INPUT_EVIDENCE: "evidence.json",
      GITHUB_OUTPUT: output,
      GITHUB_STEP_SUMMARY: summary,
    },
  });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /::warning::Human fun calibration/);
  const expected = auditGameEvidence(repaired);
  const actionOutput = await readFile(output, "utf8");
  assert.match(actionOutput, /verdict=HUMAN_REVIEW/);
  assert.match(actionOutput, new RegExp(`receipt-id=${expected.receiptId}`));
  assert.match(await readFile(summary, "utf8"), /PlayReceipt HUMAN_REVIEW/);
});

test("GitHub Action blocks repair and unverified evidence with actionable annotations", async (context) => {
  const run = spawnSync(process.execPath, ["src/action.js"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
    env: { ...process.env, INPUT_EVIDENCE: "examples/overclock-20260717.json" },
  });
  assert.equal(run.status, 1);
  assert.match(run.stdout, /::error::/);
  assert.match(run.stdout, /PlayReceipt REPAIR/);

  const directory = await mkdtemp(join(tmpdir(), "playreceipt-action-missing-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const evidence = join(directory, "missing.json");
  await writeFile(evidence, JSON.stringify({ project: "missing-evidence" }), "utf8");
  const missing = spawnSync(process.execPath, ["src/action.js"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
    env: { ...process.env, INPUT_EVIDENCE: evidence },
  });
  assert.equal(missing.status, 1);
  assert.match(missing.stdout, /::error::/);
  assert.match(missing.stdout, /PlayReceipt UNVERIFIED/);
});

test("bundled workflow safely reads the hyphenated receipt-id output", async () => {
  const workflow = await readFile(new URL("../.github/workflows/playreceipt.yml", import.meta.url), "utf8");
  assert.match(workflow, /outputs\['receipt-id'\]/);
  assert.doesNotMatch(workflow, /outputs\.receipt-id/);
});
