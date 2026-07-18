import { createPlayReceiptServer } from "./http.js";

const port = Number.parseInt(process.env.PORT ?? "4175", 10);
const server = createPlayReceiptServer();

server.listen(port, "127.0.0.1", () => {
  const address = server.address();
  const livePort = typeof address === "object" && address ? address.port : port;
  process.stdout.write(`PlayReceipt demo: http://127.0.0.1:${livePort}\n`);
});
