/**
 * Deterministic incident triage for fabricated operational alerts.
 * No LLM, notifications, tickets, or third-party service calls.
 */
export function triageIncident(input) {
  const p = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const issues = [];
  const id = typeof p.event_id === "string" ? p.event_id.trim() : "";
  const service = typeof p.service === "string" ? p.service.trim() : "";
  const severity = typeof p.severity === "string" ? p.severity.trim().toUpperCase() : "";
  const summary = typeof p.summary === "string" ? p.summary.trim() : "";
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) issues.push("event_id must be 8–64 safe characters");
  if (service.length < 2 || service.length > 80) issues.push("service must be 2–80 characters");
  if (!["P1", "P2", "P3", "P4"].includes(severity)) issues.push("severity must be P1, P2, P3 or P4");
  if (summary.length < 10 || summary.length > 240) issues.push("summary must be 10–240 characters");

  const impact = p.affected_users;
  if (!Number.isSafeInteger(impact) || impact < 0 || impact > 10000000) {
    issues.push("affected_users must be an integer from 0 to 10000000");
  }
  if (p.critical_service !== undefined && typeof p.critical_service !== "boolean") {
    issues.push("critical_service must be boolean when supplied");
  }
  if (issues.length) return { ok: false, event_id: id || null, issues };

  const rank = { P1: 1, P2: 2, P3: 3, P4: 4 };
  let effective = rank[severity];
  if (impact >= 100000) effective = Math.min(effective, 1);
  else if (impact >= 1000 || p.critical_service === true) effective = Math.min(effective, 2);
  const priority = "P" + effective;
  const routing = {
    P1: { queue: "incident-commander", acknowledge_minutes: 15, escalate: true },
    P2: { queue: "service-on-call", acknowledge_minutes: 30, escalate: true },
    P3: { queue: "service-desk", acknowledge_minutes: 240, escalate: false },
    P4: { queue: "planned-backlog", acknowledge_minutes: 1440, escalate: false }
  }[priority];

  return { ok: true, event_id: id, service, reported_severity: severity,
    effective_priority: priority, was_upgraded: priority !== severity,
    affected_users: impact, ...routing, human_review_required: true,
    summary_omitted_from_output: true,
    status: "RECOMMENDATION_ONLY",
    note: "No ticket, page, notification, AI inference, or external write occurred." };
}
