#!/usr/bin/env node
import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { auditGameEvidence } from "./audit.js";

function command(name, message) {
  const safe = String(message).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
  process.stdout.write(`::${name}::${safe}\n`);
}

async function append(path, value) {
  if (path) await appendFile(path, `${value}\n`, "utf8");
}

async function main() {
  const evidencePath = resolve(process.env.INPUT_EVIDENCE ?? "examples/overclock-20260717.json");
  const receipt = auditGameEvidence(JSON.parse(await readFile(evidencePath, "utf8")));

  for (const gate of receipt.gates) {
    if (gate.verdict === "REPAIR") command("error", `${gate.label}: ${gate.repair}`);
    if (gate.verdict === "UNVERIFIED") command("error", `${gate.label}: evidence missing. ${gate.repair}`);
    if (gate.verdict === "HUMAN_REVIEW") command("warning", `${gate.label}: ${gate.repair}`);
  }

  await append(process.env.GITHUB_OUTPUT, `verdict=${receipt.verdict}`);
  await append(process.env.GITHUB_OUTPUT, `receipt-id=${receipt.receiptId}`);
  await append(process.env.GITHUB_STEP_SUMMARY, `## PlayReceipt ${receipt.verdict}\n\nReceipt \`${receipt.receiptId}\` · ${receipt.counts.pass} pass · ${receipt.counts.repair} repair · ${receipt.counts.unverified} missing.`);
  command("notice", `PlayReceipt ${receipt.verdict} · receipt ${receipt.receiptId}`);
  if (receipt.verdict === "REPAIR" || receipt.verdict === "UNVERIFIED") process.exitCode = 1;
}

main().catch((error) => {
  command("error", error.message);
  process.exitCode = 1;
});
