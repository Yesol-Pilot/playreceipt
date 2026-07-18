#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { auditGameEvidence } from "./audit.js";
import { simulatePolicies, simulationToAuditInput } from "./simulate.js";

function usage() {
  return `PlayReceipt\n\nUsage:\n  node src/cli.js audit <input.json> [output.json]\n  node src/cli.js simulate <broken|repaired> [output.json]\n`;
}

async function main() {
const [, , command, ...rawArgs] = process.argv;
const outIndex = rawArgs.indexOf("--out");
if (outIndex >= 0 && !rawArgs[outIndex + 1]) {
  throw new Error("--out requires a file path");
}
const excludedIndexes = new Set(outIndex >= 0 ? [outIndex, outIndex + 1] : []);
const operands = rawArgs.filter((_, index) => !excludedIndexes.has(index));
const arg = operands[0];
const output = outIndex >= 0 ? rawArgs[outIndex + 1] : operands[1];
  if (!command || command === "help" || command === "--help") {
    process.stdout.write(usage());
    return;
  }

  let receipt;
  if (command === "audit") {
    if (!arg) throw new Error("audit requires an input JSON path");
    const input = JSON.parse(await readFile(resolve(arg), "utf8"));
    receipt = auditGameEvidence(input);
  } else if (command === "simulate") {
    const mode = arg ?? "broken";
    receipt = auditGameEvidence(simulationToAuditInput(simulatePolicies({ mode })));
  } else {
    throw new Error(`Unknown command: ${command}`);
  }

  const serialized = `${JSON.stringify(receipt, null, 2)}\n`;
  if (output) await writeFile(resolve(output), serialized, "utf8");
  process.stdout.write(serialized);
  if (receipt.verdict === "REPAIR") process.exitCode = 2;
  if (receipt.verdict === "UNVERIFIED") process.exitCode = 3;
  if (receipt.verdict === "HUMAN_REVIEW") process.exitCode = 4;
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
