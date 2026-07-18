import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/receipt.js";
import repaired from "../examples/repaired-evidence.json" with { type: "json" };

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

test("Vercel POST adapter shares the audit engine and rejects non-JSON", async () => {
  const success = responseRecorder();
  await handler({ method: "POST", headers: { "content-type": "Application/JSON; Charset=UTF-8" }, body: repaired }, success);
  assert.equal(success.statusCode, 200);
  assert.equal(success.body.verdict, "HUMAN_REVIEW");
  assert.equal(success.headers["cache-control"], "no-store");

  const wrongType = responseRecorder();
  await handler({ method: "POST", headers: { "content-type": "text/plain" }, body: repaired }, wrongType);
  assert.equal(wrongType.statusCode, 415);
  assert.match(wrongType.body.error, /application\/json/);
});
