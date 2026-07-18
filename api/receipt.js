import { getReceipt } from "../src/cases.js";
import { auditSubmittedEvidence, parseSubmittedEvidence } from "../src/request.js";

export default async function handler(request, response) {
  if (request.method === "POST") {
    try {
      const contentType = request.headers?.["content-type"] ?? "";
      if (!contentType.toLowerCase().includes("application/json")) {
        const error = new TypeError("Content-Type must be application/json");
        error.statusCode = 415;
        throw error;
      }
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
