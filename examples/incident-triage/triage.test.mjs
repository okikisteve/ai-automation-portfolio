import test from "node:test";
import assert from "node:assert/strict";
import { triageIncident } from "./triage.mjs";
const base = { event_id: "DEMO-INC-001", service: "Demo billing API",
  severity: "P3", summary: "Synthetic alert: elevated error rates", affected_users: 5 };
test("routes P3 to service desk", () => {
  const r = triageIncident(base);
  assert.equal(r.effective_priority, "P3"); assert.equal(r.queue, "service-desk");
  assert.equal(r.acknowledge_minutes, 240); assert.equal(r.human_review_required, true);
});
test("P1 remains incident commander with 15 minute acknowledgment objective", () => {
  const r = triageIncident({ ...base, severity: "P1" });
  assert.equal(r.queue, "incident-commander"); assert.equal(r.acknowledge_minutes, 15);
});
test("P4 low-impact alerts route to planned backlog", () => {
  const r = triageIncident({ ...base, severity: "P4", affected_users: 0 });
  assert.equal(r.queue, "planned-backlog");
});
test("1000 affected users upgrades P4 to P2", () => {
  const r = triageIncident({ ...base, severity: "P4", affected_users: 1000 });
  assert.equal(r.effective_priority, "P2"); assert.equal(r.was_upgraded, true);
});
test("100000 affected users upgrades P3 to P1", () => {
  assert.equal(triageIncident({ ...base, affected_users: 100000 }).effective_priority, "P1");
});
test("critical service upgrades lower severity to P2", () => {
  assert.equal(triageIncident({ ...base, critical_service: true }).effective_priority, "P2");
});
test("does not downgrade P1 during low impact", () => {
  assert.equal(triageIncident({ ...base, severity: "P1", affected_users: 0 }).effective_priority, "P1");
});
test("boundary under 1000 does not automatically upgrade", () => {
  assert.equal(triageIncident({ ...base, severity: "P4", affected_users: 999 }).effective_priority, "P4");
});
test("rejects invalid impact types and negative numbers", () => {
  for (const affected_users of [-1, "5", 2.5]) assert.equal(triageIncident({ ...base, affected_users }).ok, false);
});
test("rejects unsupported severity and unsafe id", () => {
  const r = triageIncident({ ...base, severity: "P9", event_id: "../private" });
  assert.ok(r.issues.length >= 2);
});
test("rejects invalid summary and service", () => {
  assert.equal(triageIncident({ ...base, summary: "short", service: "" }).ok, false);
});
test("does not echo potentially sensitive alert summaries", () => {
  const r = triageIncident({ ...base, summary: "Example private text that should never be copied into routing output" });
  assert.equal(JSON.stringify(r).includes("private text"), false);
});
test("is deterministic and has no side effects", () => {
  const b = structuredClone(base);
  assert.deepEqual(triageIncident(base), triageIncident(b)); assert.deepEqual(base, b);
});
