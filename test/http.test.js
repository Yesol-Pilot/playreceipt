import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createPlayReceiptServer } from "../src/http.js";
import { readFile } from "node:fs/promises";

test("local server serves the dashboard, assets, and computed API", async (context) => {
  const server = createPlayReceiptServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  context.after(() => server.close());
  const address = server.address();
  assert.equal(typeof address, "object");
  const base = `http://127.0.0.1:${address.port}`;

  const [home, script, receipt] = await Promise.all([
    fetch(`${base}/`),
    fetch(`${base}/app.js`),
    fetch(`${base}/api/receipt?case=repaired`),
  ]);
  assert.equal(home.status, 200);
  assert.match(home.headers.get("content-type"), /text\/html/);
  assert.equal(script.status, 200);
  assert.match(script.headers.get("content-type"), /text\/javascript/);
  assert.equal(receipt.status, 200);
  assert.equal((await receipt.json()).verdict, "HUMAN_REVIEW");

  const sample = await readFile(new URL("../examples/repaired-evidence.json", import.meta.url), "utf8");
  const custom = await fetch(`${base}/api/receipt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: sample,
  });
  assert.equal(custom.status, 200);
  const customReceipt = await custom.json();
  assert.equal(customReceipt.verdict, "HUMAN_REVIEW");
  assert.equal(customReceipt.repairPlan.length, 0);

  const malformed = await fetch(`${base}/api/receipt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{nope",
  });
  assert.equal(malformed.status, 400);
  assert.match((await malformed.json()).error, /valid JSON/);

  const wrongType = await fetch(`${base}/api/receipt`, {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: sample,
  });
  assert.equal(wrongType.status, 415);

  const oversized = await fetch(`${base}/api/receipt`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ project: "x", padding: "x".repeat(70 * 1024) }),
  });
  assert.equal(oversized.status, 413);
});
