import { createHash } from "node:crypto";

const PASS = "PASS";
const REPAIR = "REPAIR";
const HUMAN_REVIEW = "HUMAN_REVIEW";
const UNVERIFIED = "UNVERIFIED";

function round(value, digits = 2) {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function gate(id, label, verdict, observed, threshold, evidence, repair = null) {
  return { id, label, verdict, observed, threshold, evidence, repair };
}

function policyStats(policyWinrates = []) {
  const valid = policyWinrates.filter(
    (entry) => entry
      && typeof entry.policy === "string"
      && Number.isFinite(entry.winrate)
      && entry.winrate >= 0
      && entry.winrate <= 1,
  );
  if (valid.length < 2) return null;

  const sorted = [...valid].sort((a, b) => b.winrate - a.winrate);
  const random = valid.find((entry) => entry.policy === "random");
  const strategic = valid.filter((entry) => entry.policy !== "random");
  const bestStrategic = strategic.sort((a, b) => b.winrate - a.winrate)[0] ?? null;
  const spreadPp = (sorted[0].winrate - sorted.at(-1).winrate) * 100;
  const strategicEdgePp = random && bestStrategic
    ? (bestStrategic.winrate - random.winrate) * 100
    : null;

  return {
    spreadPp: round(spreadPp, 1),
    strategicEdgePp: strategicEdgePp === null ? null : round(strategicEdgePp, 1),
    bestPolicy: sorted[0].policy,
    worstPolicy: sorted.at(-1).policy,
    randomWinrate: random?.winrate ?? null,
    bestStrategicWinrate: bestStrategic?.winrate ?? null,
  };
}

function overallVerdict(gates) {
  if (gates.some((item) => item.verdict === REPAIR)) return REPAIR;
  if (gates.some((item) => item.verdict === UNVERIFIED)) return UNVERIFIED;
  if (gates.some((item) => item.verdict === HUMAN_REVIEW)) return HUMAN_REVIEW;
  return PASS;
}

function buildRepairPlan(gates) {
  return gates
    .filter((item) => item.verdict === REPAIR || item.verdict === UNVERIFIED)
    .map((item) => ({
      gateId: item.id,
      label: item.label,
      verdict: item.verdict,
      action: item.repair,
    }));
}

export function auditGameEvidence(input) {
  if (!input || typeof input !== "object") throw new TypeError("Audit input must be an object");
  if (!input.project || typeof input.project !== "string") throw new TypeError("project is required");

  const reliability = input.metrics?.reliability ?? {};
  const accessibility = input.metrics?.accessibility ?? {};
  const balance = policyStats(input.metrics?.balance?.policyWinrates);
  const evidence = Array.isArray(input.evidence) ? input.evidence : [];
  const gates = [];

  const runsSupplied = Number.isInteger(reliability.runs) && reliability.runs >= 0;
  const runsPass = runsSupplied && reliability.runs >= 500;
  gates.push(gate(
    "reliability.runs",
    "Deterministic sample size",
    !runsSupplied ? UNVERIFIED : runsPass ? PASS : REPAIR,
    runsSupplied ? reliability.runs : "missing",
    ">= 500 deterministic runs",
    evidence.filter((item) => item.gate === "reliability"),
    runsPass ? null : "Run at least 500 seeded simulations and attach the raw output.",
  ));

  const crashCountsSupplied = Number.isInteger(reliability.crashes)
    && reliability.crashes >= 0
    && Number.isInteger(reliability.stalls)
    && reliability.stalls >= 0;
  const crashFree = crashCountsSupplied && reliability.crashes === 0 && reliability.stalls === 0;
  gates.push(gate(
    "reliability.crash_free",
    "Crash and stall freedom",
    !runsPass || !crashCountsSupplied ? UNVERIFIED : crashFree ? PASS : REPAIR,
    {
      crashes: Number.isInteger(reliability.crashes) && reliability.crashes >= 0 ? reliability.crashes : "missing",
      stalls: Number.isInteger(reliability.stalls) && reliability.stalls >= 0 ? reliability.stalls : "missing",
    },
    "0 crashes and 0 stalls",
    evidence.filter((item) => item.gate === "reliability"),
    crashFree
      ? null
      : !runsPass || !crashCountsSupplied
        ? "Provide at least 500 seeded runs with non-negative crash and stall counts."
        : "Fix deterministic crash/stall paths and rerun the same seeds.",
  ));

  if (!balance) {
    gates.push(gate(
      "balance.policy_separation",
      "Policy separation",
      UNVERIFIED,
      "missing",
      ">= 15pp win-rate spread",
      [],
      "Provide win rates for at least two instrumented policies.",
    ));
    gates.push(gate(
      "balance.strategy_signal",
      "Strategy beats random play",
      UNVERIFIED,
      "missing",
      ">= 5pp strategic edge over random",
      [],
      "Include a random baseline and at least one intentional strategy.",
    ));
  } else {
    gates.push(gate(
      "balance.policy_separation",
      "Policy separation",
      balance.spreadPp >= 15 ? PASS : REPAIR,
      `${balance.spreadPp}pp (${balance.bestPolicy} → ${balance.worstPolicy})`,
      ">= 15pp win-rate spread",
      evidence.filter((item) => item.gate === "balance"),
      balance.spreadPp >= 15 ? null : "Tune choices or encounters until player policy creates a measurable outcome difference.",
    ));

    const strategyVerified = balance.strategicEdgePp !== null;
    const strategyPass = strategyVerified && balance.strategicEdgePp >= 5;
    gates.push(gate(
      "balance.strategy_signal",
      "Strategy beats random play",
      !strategyVerified ? UNVERIFIED : strategyPass ? PASS : REPAIR,
      strategyVerified ? `${balance.strategicEdgePp}pp strategic edge` : "random baseline missing",
      ">= 5pp strategic edge over random",
      evidence.filter((item) => item.gate === "balance"),
      strategyPass ? null : "Repair dominant randomness or weak decision leverage, then rerun identical seeds.",
    ));
  }

  const minFontPx = accessibility.minFontPx;
  const minFontSupplied = Number.isFinite(minFontPx) && minFontPx >= 0;
  gates.push(gate(
    "accessibility.text",
    "Minimum gameplay text size",
    !minFontSupplied ? UNVERIFIED : minFontPx >= 12 ? PASS : REPAIR,
    minFontSupplied ? `${minFontPx}px` : "missing",
    ">= 12px at the declared reference viewport",
    evidence.filter((item) => item.gate === "accessibility"),
    minFontSupplied && minFontPx >= 12 ? null : "Raise gameplay text and capture the reference viewport again.",
  ));

  const prompt = accessibility.photosensitivityPromptBeforeCanvas;
  gates.push(gate(
    "accessibility.photosensitivity",
    "Photosensitivity choice before effects",
    typeof prompt !== "boolean" ? UNVERIFIED : prompt ? PASS : REPAIR,
    typeof prompt === "boolean" ? prompt : "missing",
    "true before canvas/effects initialization",
    evidence.filter((item) => item.gate === "accessibility"),
    prompt ? null : "Move the visual-effects choice before the first animated render.",
  ));

  const reducedMotion = accessibility.reducedMotion;
  gates.push(gate(
    "accessibility.reduced_motion",
    "Reduced-motion control",
    typeof reducedMotion !== "boolean" ? UNVERIFIED : reducedMotion ? PASS : REPAIR,
    typeof reducedMotion === "boolean" ? reducedMotion : "missing",
    "player-visible toggle with outcome parity",
    evidence.filter((item) => item.gate === "accessibility"),
    reducedMotion ? null : "Add a reduced-motion toggle and prove mechanics remain identical.",
  ));

  gates.push(gate(
    "human.fun",
    "Human fun calibration",
    input.humanReview?.funReviewed === true ? PASS : HUMAN_REVIEW,
    input.humanReview?.funReviewed === true ? "completed" : "not completed",
    "at least one recorded human play session",
    evidence.filter((item) => item.gate === "human.fun"),
    input.humanReview?.funReviewed === true ? null : "A human must play the build; simulation cannot certify fun.",
  ));

  const verdict = overallVerdict(gates);
  const counts = {
    pass: gates.filter((item) => item.verdict === PASS).length,
    repair: gates.filter((item) => item.verdict === REPAIR).length,
    humanReview: gates.filter((item) => item.verdict === HUMAN_REVIEW).length,
    unverified: gates.filter((item) => item.verdict === UNVERIFIED).length,
  };
  const repairPlan = buildRepairPlan(gates);
  const humanGate = gates.find((item) => item.id === "human.fun");
  const canonical = JSON.stringify({ project: input.project, checkedAt: input.checkedAt, gates });
  const receiptId = createHash("sha256").update(canonical).digest("hex").slice(0, 16);

  return {
    schema: "playreceipt.audit.v1",
    receiptId,
    project: input.project,
    checkedAt: input.checkedAt ?? null,
    sourceKind: input.sourceKind ?? "unknown",
    verdict,
    counts,
    balance,
    gates,
    repairPlan,
    trail: [
      {
        stage: "INGEST",
        state: "SEALED",
        detail: `${evidence.length} provenance ${evidence.length === 1 ? "entry" : "entries"}; source remains unchanged.`,
      },
      {
        stage: "JUDGE",
        state: verdict,
        detail: `${counts.pass} pass · ${counts.repair} repair · ${counts.unverified} missing.`,
      },
      {
        stage: "REPAIR PLAN",
        state: repairPlan.length ? "OPEN" : "CLEAR",
        detail: repairPlan.length ? `${repairPlan.length} minimum credible ${repairPlan.length === 1 ? "action" : "actions"}.` : "No machine repair is requested.",
      },
      {
        stage: "HUMAN BOUNDARY",
        state: humanGate?.verdict ?? UNVERIFIED,
        detail: humanGate?.verdict === PASS ? "Recorded human play evidence supplied." : "Automation does not certify fun.",
      },
    ],
    caveat: "A receipt reports only the supplied evidence. It is not a release approval.",
  };
}

export const VERDICTS = { PASS, REPAIR, HUMAN_REVIEW, UNVERIFIED };
