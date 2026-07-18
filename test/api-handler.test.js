import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/receipt.js";
import repaired from "../examples/repaired-evidence.json" with { type: "json" };
import { auditGameEvidence } from "../src/audit.js";

function responseRecorder() {
  return {
    headers: {},
    statusCode: 200,
    body: undefined,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

test("Vercel adapter shares the audit engine and enforces its HTTP contract", async () => {
  const success = responseRecorder();
  await handler({ method: "POST", headers: { "content-type": "Application/JSON; Charset=UTF-8" }, body: repaired }, success);
  assert.equal(success.statusCode, 200);
  assert.deepEqual(success.body, auditGameEvidence(repaired));
  assert.equal(success.headers["cache-control"], "no-store");

  const wrongType = responseRecorder();
  await handler({ method: "POST", headers: { "content-type": "text/plain" }, body: repaired }, wrongType);
  assert.equal(wrongType.statusCode, 415);
  assert.match(wrongType.body.error, /application\/json/);

  const oversized = responseRecorder();
  await handler({
    method: "POST",
    headers: { "content-type": "application/json" },
    body: { project: "oversized", padding: "x".repeat(70 * 1024) },
  }, oversized);
  assert.equal(oversized.statusCode, 413);

  const get = responseRecorder();
  await handler({ method: "GET", headers: {}, query: { case: "repaired" } }, get);
  assert.equal(get.statusCode, 200);
  assert.equal(get.body.verdict, "HUMAN_REVIEW");

  const unknown = responseRecorder();
  await handler({ method: "GET", headers: {}, query: { case: "unknown" } }, unknown);
  assert.equal(unknown.statusCode, 404);

  const disallowed = responseRecorder();
  await handler({ method: "DELETE", headers: {}, query: {} }, disallowed);
  assert.equal(disallowed.statusCode, 405);
  assert.equal(disallowed.headers.allow, "GET, POST");
});
