import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createPlayReceiptServer } from "../src/http.js";

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
});
