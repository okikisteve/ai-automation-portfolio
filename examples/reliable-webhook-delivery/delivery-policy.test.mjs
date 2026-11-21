import test from "node:test";
import assert from "node:assert/strict";
import { planWebhookDelivery } from "./delivery-policy.mjs";

const base = {
  event_id: "DEMO_EVENT_001",
  attempt: 1,
  existing_event_state: "unseen",
  http_status: 503
};
const evaluate = (changes = {}) => planWebhookDelivery({ ...base, ...changes });

test("2xx receiver response marks event delivered (decision only)", () => {
  const r = evaluate({ http_status: 201 });
  assert.equal(r.decision, "MARK_DELIVERED");
  assert.equal(r.external_action_performed, false);
});
test("already-delivered ID suppresses duplicate based on supplied state", () => {
  assert.equal(evaluate({ existing_event_state: "delivered", http_status: null }).decision, "SUPPRESS_DUPLICATE");
});
test("processing state waits rather than claiming lock", () => {
  assert.equal(evaluate({ existing_event_state: "processing", http_status: null }).decision, "WAIT_FOR_LOCK");
});
test("first transient failure retries after 15 seconds", () => {
  const r = evaluate();
  assert.equal(r.decision, "RETRY_LATER");
  assert.equal(r.delay_seconds, 15);
});
test("fourth transient failure retries after 120 seconds", () => {
  assert.equal(evaluate({ attempt: 4 }).delay_seconds, 120);
});
test("fifth transient failure goes to dead-letter review", () => {
  assert.equal(evaluate({ attempt: 5 }).decision, "DEAD_LETTER_REVIEW");
});
test("429 honors longer Retry-After delay", () => {
  const r = evaluate({ http_status: 429, retry_after_seconds: 200 });
  assert.equal(r.delay_seconds, 200);
});
test("503 honors longer Retry-After delay", () => {
  assert.equal(evaluate({ http_status: 503, retry_after_seconds: 120 }).delay_seconds, 120);
});
test("short Retry-After cannot reduce backoff", () => {
  assert.equal(evaluate({ http_status: 429, attempt: 3, retry_after_seconds: 2 }).delay_seconds, 60);
});
test("network error is retryable with absent status", () => {
  assert.equal(evaluate({ network_error: true, http_status: null }).decision, "RETRY_LATER");
});
test("400 bad input requires human review instead of repeated delivery", () => {
  assert.equal(evaluate({ http_status: 400 }).decision, "HUMAN_REVIEW");
});
test("409 conflicts require reconciliation instead of blindly marking success", () => {
  assert.equal(evaluate({ http_status: 409 }).decision, "HUMAN_REVIEW");
});
test("redirect responses require review", () => {
  assert.equal(evaluate({ http_status: 302 }).decision, "HUMAN_REVIEW");
});
test("invalid event keys are rejected", () => {
  assert.equal(evaluate({ event_id: "../../secret" }).ok, false);
});
test("attempt and status values must be integers within bounds", () => {
  for (const attempted of [0, 6, 1.5]) assert.equal(evaluate({ attempt: attempted }).ok, false);
  for (const value of [99, 600, "503"]) assert.equal(evaluate({ http_status: value }).ok, false);
});
test("network status contradictions are rejected", () => {
  assert.equal(evaluate({ network_error: true, http_status: 503 }).ok, false);
});
test("missing outcomes must not be treated as success", () => {
  assert.equal(evaluate({ http_status: null }).ok, false);
});
test("Retry-After must be a bounded integer", () => {
  for (const value of [-1, 3601, "120"]) assert.equal(evaluate({ retry_after_seconds: value }).ok, false);
});
test("input is unchanged and deterministic", () => {
  const input = structuredClone(base);
  assert.deepEqual(planWebhookDelivery(input), planWebhookDelivery({ ...input }));
  assert.deepEqual(input, base);
});
