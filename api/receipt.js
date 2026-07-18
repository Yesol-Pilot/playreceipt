import { getReceipt } from "../src/cases.js";

export default async function handler(request, response) {
  const caseName = Array.isArray(request.query.case) ? request.query.case[0] : request.query.case;
  const receipt = await getReceipt(caseName ?? "overclock");
  if (!receipt) {
    response.status(404).json({ error: "Unknown case" });
    return;
  }
  response.setHeader("cache-control", "no-store");
  response.status(200).json(receipt);
}
