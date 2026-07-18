function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CONFIGS = {
  broken: {
    greedy: 0.29,
    "entropy-max": 0.24,
    safe: 0.21,
    random: 0.30,
  },
  repaired: {
    greedy: 0.43,
    "entropy-max": 0.34,
    safe: 0.27,
    random: 0.22,
  },
};

export function simulatePolicies({ mode = "broken", runs = 500, seed = 20260718 } = {}) {
  const config = CONFIGS[mode];
  if (!config) throw new Error(`Unknown simulation mode: ${mode}`);
  if (!Number.isInteger(runs) || runs < 1) throw new Error("runs must be a positive integer");

  const policyWinrates = Object.entries(config).map(([policy, probability], policyIndex) => {
    let wins = 0;
    for (let run = 0; run < runs; run += 1) {
      const random = mulberry32(seed + policyIndex * 100_003 + run);
      if (random() < probability) wins += 1;
    }
    return { policy, runs, wins, winrate: wins / runs };
  });

  return {
    mode,
    seed,
    runs,
    crashes: 0,
    stalls: 0,
    policyWinrates,
  };
}

export function simulationToAuditInput(simulation) {
  return {
    project: `PlayReceipt sandbox (${simulation.mode})`,
    checkedAt: "2026-07-18",
    sourceKind: "deterministic_sandbox",
    metrics: {
      reliability: {
        runs: simulation.runs * simulation.policyWinrates.length,
        crashes: simulation.crashes,
        stalls: simulation.stalls,
      },
      balance: { policyWinrates: simulation.policyWinrates },
      accessibility: {
        minFontPx: 12,
        photosensitivityPromptBeforeCanvas: true,
        reducedMotion: simulation.mode === "repaired",
      },
    },
    humanReview: { funReviewed: false },
    evidence: [
      { gate: "reliability", path: `sandbox://${simulation.mode}/seed-${simulation.seed}` },
      { gate: "balance", path: `sandbox://${simulation.mode}/policies` },
      { gate: "accessibility", path: `sandbox://${simulation.mode}/ui-contract` },
    ],
  };
}
