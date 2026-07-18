import { getReceipt } from "../src/cases.js";
import {
  auditSubmittedEvidence,
  isJsonContentType,
  MAX_AUDIT_BYTES,
  parseSubmittedEvidence,
} from "../src/request.js";

function rejectOversizedRequest(request) {
  const header = request.headers?.["content-length"];
  const value = Array.isArray(header) ? header[0] : header;
  if (value === undefined) return;
  const bytes = Number(value);
  if (Number.isFinite(bytes) && bytes > MAX_AUDIT_BYTES) {
    const error = new Error("Evidence document exceeds 64 KiB");
    error.statusCode = 413;
    throw error;
  }
}

export default async function handler(request, response) {
  if (request.method === "POST") {
    try {
      const contentType = request.headers?.["content-type"] ?? "";
      if (!isJsonContentType(contentType)) {
        const error = new TypeError("Content-Type must be application/json");
        error.statusCode = 415;
        throw error;
      }
      rejectOversizedRequest(request);
      const input = parseSubmittedEvidence(request.body);
      response.setHeader("cache-control", "no-store");
      response.status(200).json(auditSubmittedEvidence(input));
    } catch (error) {
      response.status(error.statusCode ?? (error instanceof TypeError ? 400 : 500)).json({ error: error.message });
    }
    return;
  }
  if (request.method !== "GET") {
    response.setHeader("allow", "GET, POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }
  const caseName = Array.isArray(request.query.case) ? request.query.case[0] : request.query.case;
  const receipt = await getReceipt(caseName ?? "overclock");
  if (!receipt) {
    response.status(404).json({ error: "Unknown case" });
    return;
  }
  response.setHeader("cache-control", "no-store");
  response.status(200).json(receipt);
}
