import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

test("GitHub Action exposes a stable human-review receipt without failing CI", async (context) => {
  const directory = await mkdtemp(join(tmpdir(), "playreceipt-action-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const output = join(directory, "output.txt");
  const summary = join(directory, "summary.md");
  const run = spawnSync(process.execPath, ["src/action.js"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
    env: {
      ...process.env,
      INPUT_EVIDENCE: "examples/repaired-evidence.json",
      GITHUB_OUTPUT: output,
      GITHUB_STEP_SUMMARY: summary,
    },
  });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /::warning::Human fun calibration/);
  assert.match(await readFile(output, "utf8"), /verdict=HUMAN_REVIEW/);
  assert.match(await readFile(output, "utf8"), /receipt-id=([a-f0-9]{16})/);
  assert.match(await readFile(summary, "utf8"), /PlayReceipt HUMAN_REVIEW/);
});

test("GitHub Action blocks repair evidence and emits actionable annotations", () => {
  const run = spawnSync(process.execPath, ["src/action.js"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8",
    env: { ...process.env, INPUT_EVIDENCE: "examples/overclock-20260717.json" },
  });
  assert.equal(run.status, 1);
  assert.match(run.stdout, /::error::/);
  assert.match(run.stdout, /PlayReceipt REPAIR/);
});
