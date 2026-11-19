/**
 * AI-agent action gate. Offline, deterministic and side-effect-free.
 * A model's proposed tool call is NOT proof of customer consent or availability.
 * Input context is synthetic in this demo; a real backend must authenticate it.
 */
export function evaluateAgentAction(proposal, context = {}) {
  const issues = [];
  const p = proposal && typeof proposal === "object" && !Array.isArray(proposal) ? proposal : {};
  const c = context && typeof context === "object" && !Array.isArray(context) ? context : {};
  const id = typeof p.request_id === "string" ? p.request_id.trim() : "";
  const action = typeof p.action === "string" ? p.action.trim() : "";
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) issues.push("request_id must be 8–64 safe characters");
  if (!["propose_slot", "book_inspection", "request_human_review"].includes(action)) {
    issues.push("action must be propose_slot, book_inspection or request_human_review");
  }

  if (action === "request_human_review" && issues.length === 0) {
    return { ok: true, request_id: id, verdict: "HUMAN_REVIEW", issues: [],
      next_step: "A human reviews the request. No external action was executed." };
  }

  if (action === "propose_slot" || action === "book_inspection") {
    const b = p.booking && typeof p.booking === "object" && !Array.isArray(p.booking) ? p.booking : {};
    const date = typeof b.date === "string" ? b.date : "";
    const start = typeof b.start_time === "string" ? b.start_time : "";
    const end = typeof b.end_time === "string" ? b.end_time : "";
    const timeToMinutes = value => /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
      ? Number(value.slice(0, 2)) * 60 + Number(value.slice(3)) : -1;
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
      && !Number.isNaN(Date.parse(date + "T00:00:00Z"))
      && new Date(date + "T00:00:00Z").toISOString().slice(0, 10) === date;
    if (!validDate) issues.push("booking date must be a real YYYY-MM-DD date");
    if (validDate && new Date(date + "T12:00:00Z").getUTCDay() === 0) {
      issues.push("Sunday bookings are not allowed in this demo");
    }
    if (b.timezone !== "Africa/Lagos") issues.push("timezone must be Africa/Lagos");
    if (startMin < 540 || endMin > 1080 || endMin <= startMin || endMin - startMin > 120) {
      issues.push("slot must be 09:00–18:00, positive duration and at most 120 minutes");
    }
    if (c.listing_verified !== true) issues.push("listing verification is required");
    if (action === "book_inspection") {
      if (c.customer_confirmed !== true) issues.push("independent customer confirmation is required");
      if (c.calendar_available !== true) issues.push("calendar availability is required");
    }
  }
  if (issues.length) {
    return { ok: false, request_id: id || null, verdict: "BLOCKED", issues,
      next_step: "Request correction or human review. No external action was executed." };
  }
  return { ok: true, request_id: id, verdict: "HUMAN_APPROVAL_REQUIRED", issues: [],
    next_step: action === "book_inspection"
      ? "Revalidate consent and availability in trusted systems; require human approval before any calendar write."
      : "Human verifies the proposed slot before it is offered to the customer." };
}
