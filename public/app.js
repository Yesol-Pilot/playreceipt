const elements = {
  project: document.querySelector("#project-name"),
  verdict: document.querySelector("#verdict"),
  reason: document.querySelector("#verdict-reason"),
  receiptId: document.querySelector("#receipt-id"),
  sourceKind: document.querySelector("#source-kind"),
  pass: document.querySelector("#count-pass"),
  repair: document.querySelector("#count-repair"),
  human: document.querySelector("#count-human"),
  unverified: document.querySelector("#count-unverified"),
  spread: document.querySelector("#spread-chip"),
  bars: document.querySelector("#balance-bars"),
  gates: document.querySelector("#gate-list"),
  provenance: document.querySelector("#provenance-list"),
  caveat: document.querySelector("#caveat"),
  checkedAt: document.querySelector("#checked-at"),
};

const labels = { PASS: "Pass", REPAIR: "Repair", HUMAN_REVIEW: "Human review", UNVERIFIED: "Unverified" };
const reasons = {
  PASS: "All supplied gates pass. This receipt is still not a release approval.",
  REPAIR: "One or more supplied quality gates fail their declared threshold.",
  HUMAN_REVIEW: "Machine-verifiable gates pass. Human play judgment remains open.",
  UNVERIFIED: "Required evidence is absent; the tool refuses to invent a verdict.",
};

function formatPercent(value) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "Missing";
}

function formatObserved(value) {
  if (value && typeof value === "object") return Object.entries(value).map(([key, item]) => `${key}: ${item}`).join(" · ");
  return String(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function renderBars(balance) {
  if (!balance) {
    elements.bars.innerHTML = '<p class="empty">Policy evidence is missing.</p>';
    elements.spread.textContent = "Unverified";
    return;
  }
  const policies = [["Best strategy", balance.bestStrategicWinrate], ["Random baseline", balance.randomWinrate]];
  elements.spread.textContent = `${balance.spreadPp}pp spread`;
  elements.bars.innerHTML = policies.map(([label, value]) => `
    <div class="bar-row">
      <div class="bar-meta"><span>${escapeHtml(label)}</span><strong>${escapeHtml(formatPercent(value))}</strong></div>
      <div class="bar-track"><div class="bar-fill ${label.startsWith("Random") ? "random" : ""}" style="width:${Math.max(4, (value ?? 0) * 100)}%"></div></div>
    </div>`).join("");
}

function renderGates(gates) {
  elements.gates.innerHTML = gates.map((gate, index) => `
    <article class="gate-row">
      <span class="row-index">${String(index + 1).padStart(2, "0")}</span>
      <div class="gate-name"><strong>${escapeHtml(gate.label)}</strong>${gate.repair ? `<small>${escapeHtml(gate.repair)}</small>` : ""}</div>
      <span class="observed">${escapeHtml(formatObserved(gate.observed))}</span>
      <span class="threshold">${escapeHtml(gate.threshold)}</span>
      <b class="status ${gate.verdict.toLowerCase()}">${escapeHtml(labels[gate.verdict])}</b>
    </article>`).join("");
}

function renderProvenance(gates) {
  const entries = [...new Map(gates.flatMap((gate) => gate.evidence ?? []).map((item) => [item.path, item])).values()];
  elements.provenance.innerHTML = entries.length
    ? entries.map((entry) => `<div><span>${escapeHtml(entry.gate)}</span><code>${escapeHtml(entry.path)}</code></div>`).join("")
    : '<p class="empty">Generated from the deterministic sandbox; no external artifact.</p>';
}

async function loadCase(caseName) {
  document.body.dataset.loading = "true";
  const response = await fetch(`/api/receipt?case=${encodeURIComponent(caseName)}`);
  if (!response.ok) throw new Error("Unable to load receipt");
  const receipt = await response.json();
  elements.project.textContent = receipt.project;
  elements.verdict.textContent = labels[receipt.verdict];
  elements.verdict.dataset.verdict = receipt.verdict;
  elements.reason.textContent = reasons[receipt.verdict];
  elements.receiptId.textContent = receipt.receiptId;
  elements.sourceKind.textContent = receipt.sourceKind.replaceAll("_", " ");
  elements.pass.textContent = receipt.counts.pass;
  elements.repair.textContent = receipt.counts.repair;
  elements.human.textContent = receipt.counts.humanReview;
  elements.unverified.textContent = receipt.counts.unverified;
  elements.caveat.textContent = receipt.caveat;
  elements.checkedAt.textContent = receipt.checkedAt ?? "Generated now";
  renderBars(receipt.balance);
  renderGates(receipt.gates);
  renderProvenance(receipt.gates);
  document.body.dataset.loading = "false";
}

document.querySelectorAll("[data-case]").forEach((button) => {
  button.addEventListener("click", async () => {
    document.querySelectorAll("[data-case]").forEach((candidate) => candidate.classList.remove("active"));
    button.classList.add("active");
    await loadCase(button.dataset.case);
  });
});

loadCase("overclock").catch((error) => {
  elements.project.textContent = error.message;
  document.body.dataset.loading = "false";
});
