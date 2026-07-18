import test from "node:test";
import assert from "node:assert/strict";
import { auditGameEvidence } from "../src/audit.js";
import { simulatePolicies, simulationToAuditInput } from "../src/simulate.js";

test("broken sandbox returns REPAIR with balance and motion failures", () => {
  const input = simulationToAuditInput(simulatePolicies({ mode: "broken" }));
  const receipt = auditGameEvidence(input);
  assert.equal(receipt.verdict, "REPAIR");
  assert.equal(receipt.gates.find((gate) => gate.id === "balance.strategy_signal").verdict, "REPAIR");
  assert.equal(receipt.gates.find((gate) => gate.id === "accessibility.reduced_motion").verdict, "REPAIR");
  assert.ok(receipt.repairPlan.some((item) => item.gateId === "accessibility.reduced_motion"));
  assert.equal(receipt.trail.find((item) => item.stage === "REPAIR PLAN").state, "OPEN");
});

test("repaired sandbox remains HUMAN_REVIEW instead of inventing fun evidence", () => {
  const input = simulationToAuditInput(simulatePolicies({ mode: "repaired" }));
  const receipt = auditGameEvidence(input);
  assert.equal(receipt.verdict, "HUMAN_REVIEW");
  assert.equal(receipt.counts.repair, 0);
  assert.equal(receipt.gates.find((gate) => gate.id === "human.fun").verdict, "HUMAN_REVIEW");
  assert.equal(receipt.repairPlan.length, 0);
  assert.equal(receipt.trail.find((item) => item.stage === "HUMAN BOUNDARY").state, "HUMAN_REVIEW");
});

test("receipt id is stable for the same evidence", () => {
  const input = simulationToAuditInput(simulatePolicies({ mode: "repaired", seed: 77 }));
  assert.equal(auditGameEvidence(input).receiptId, auditGameEvidence(input).receiptId);

  const firstOrder = { project: "canonical", evidence: [{ path: "proof.json", gate: "reliability" }] };
  const secondOrder = { project: "canonical", evidence: [{ gate: "reliability", path: "proof.json" }] };
  assert.equal(auditGameEvidence(firstOrder).receiptId, auditGameEvidence(secondOrder).receiptId);
});

test("missing evidence is UNVERIFIED, never PASS", () => {
  const receipt = auditGameEvidence({ project: "empty", metrics: {} });
  assert.equal(receipt.verdict, "UNVERIFIED");
  assert.ok(receipt.counts.unverified > 0);

  const insufficient = auditGameEvidence({
    project: "short-run",
    metrics: { reliability: { runs: 499, crashes: 0, stalls: 0 } },
  });
  assert.equal(insufficient.gates.find((gate) => gate.id === "reliability.runs").verdict, "REPAIR");
  assert.equal(insufficient.gates.find((gate) => gate.id === "reliability.crash_free").verdict, "UNVERIFIED");

  const missingCounts = auditGameEvidence({
    project: "missing-counts",
    metrics: { reliability: { runs: 500 } },
  });
  assert.equal(missingCounts.gates.find((gate) => gate.id === "reliability.crash_free").verdict, "UNVERIFIED");

  const invalidRanges = auditGameEvidence({
    project: "invalid-ranges",
    metrics: {
      balance: { policyWinrates: [{ policy: "random", winrate: -1 }, { policy: "strategy", winrate: 2 }] },
      accessibility: { minFontPx: -1 },
    },
  });
  assert.equal(invalidRanges.gates.find((gate) => gate.id === "balance.policy_separation").verdict, "UNVERIFIED");
  assert.equal(invalidRanges.gates.find((gate) => gate.id === "accessibility.text").verdict, "UNVERIFIED");

  const wrongShapes = auditGameEvidence({
    project: "wrong-shapes",
    checkedAt: { date: "not-a-string" },
    sourceKind: 7,
    metrics: { balance: { policyWinrates: {} } },
    evidence: [null, "not-an-evidence-record"],
  });
  assert.equal(wrongShapes.gates.find((gate) => gate.id === "balance.policy_separation").verdict, "UNVERIFIED");
  assert.equal(wrongShapes.checkedAt, null);
  assert.equal(wrongShapes.sourceKind, "unknown");
});
