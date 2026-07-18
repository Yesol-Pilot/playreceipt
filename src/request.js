import { auditGameEvidence } from "./audit.js";

export const MAX_AUDIT_BYTES = 64 * 1024;

export function auditSubmittedEvidence(input) {
  return auditGameEvidence(input);
}

export function parseSubmittedEvidence(raw) {
  if (raw === undefined || raw === null) {
    const error = new Error("Evidence document is required");
    error.statusCode = 400;
    throw error;
  }
  const serialized = typeof raw === "string" ? raw : JSON.stringify(raw);
  if (Buffer.byteLength(serialized, "utf8") > MAX_AUDIT_BYTES) {
    const error = new Error("Evidence document exceeds 64 KiB");
    error.statusCode = 413;
    throw error;
  }
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    const error = new Error("Evidence document must be valid JSON");
    error.statusCode = 400;
    throw error;
  }
}

export async function readSubmittedEvidence(request) {
  const contentType = request.headers["content-type"] ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const error = new Error("Content-Type must be application/json");
    error.statusCode = 415;
    throw error;
  }
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > MAX_AUDIT_BYTES) {
      const error = new Error("Evidence document exceeds 64 KiB");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return parseSubmittedEvidence(Buffer.concat(chunks).toString("utf8"));
}
