import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, isAbsolute, join, normalize, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { getReceipt } from "./cases.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const publicRoot = join(root, "public");
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

export function createPlayReceiptServer() {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
      if (url.pathname === "/api/receipt") {
        const receipt = await getReceipt(url.searchParams.get("case") ?? "overclock");
        if (!receipt) {
          response.writeHead(404, { "content-type": "application/json; charset=utf-8" });
          response.end(JSON.stringify({ error: "Unknown case" }));
          return;
        }
        response.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
        response.end(JSON.stringify(receipt));
        return;
      }

      const requestPath = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
      const safeRequestPath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
      const filePath = join(publicRoot, safeRequestPath);
      const publicRelative = relative(publicRoot, filePath);
      if (publicRelative.startsWith("..") || isAbsolute(publicRelative)) throw new Error("Invalid path");
      const body = await readFile(filePath);
      response.writeHead(200, { "content-type": mimeTypes[extname(filePath)] ?? "application/octet-stream" });
      response.end(body);
    } catch {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  });
}
