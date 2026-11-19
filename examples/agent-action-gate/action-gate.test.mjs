import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAgentAction } from "./action-gate.mjs";

const proposal = { request_id: "DEMO-BOOK-01", action: "book_inspection",
  booking: { date: "2026-11-21", start_time: "10:00", end_time: "11:00", timezone: "Africa/Lagos" } };
const context = { listing_verified: true, customer_confirmed: true, calendar_available: true };
const evalWith = (p = proposal, c = context) => evaluateAgentAction(p, c);

test("valid simulated booking only reaches human approval, not execution", () => {
  const result = evalWith();
  assert.equal(result.ok, true);
  assert.equal(result.verdict, "HUMAN_APPROVAL_REQUIRED");
  assert.ok(result.next_step.includes("human approval"));
});
test("does not infer confirmation from model proposal", () => {
  const r = evalWith({ ...proposal, customer_confirmed: true }, { ...context, customer_confirmed: false });
  assert.equal(r.verdict, "BLOCKED");
  assert.ok(r.issues.some(x => x.includes("customer confirmation")));
});
test("blocks unavailable calendar slots", () => {
  assert.equal(evalWith(proposal, { ...context, calendar_available: false }).ok, false);
});
test("blocks unverified listings", () => {
  assert.equal(evalWith(proposal, { ...context, listing_verified: false }).ok, false);
});
test("blocks Sunday", () => {
  assert.ok(evalWith({ ...proposal, booking: { ...proposal.booking, date: "2026-11-22" } }).issues.some(x => x.includes("Sunday")));
});
test("blocks outside business hours", () => {
  assert.equal(evalWith({ ...proposal, booking: { ...proposal.booking, start_time: "08:00" } }).ok, false);
});
test("blocks backwards and overlong slots", () => {
  for (const end_time of ["09:00", "13:00"]) {
    assert.equal(evalWith({ ...proposal, booking: { ...proposal.booking, end_time } }).ok, false);
  }
});
test("blocks invalid dates and wrong timezone", () => {
  const r = evalWith({ ...proposal, booking: { ...proposal.booking, date: "2026-02-30", timezone: "UTC" } });
  assert.ok(r.issues.length >= 2);
});
test("proposal of a slot does not require customer booking confirmation", () => {
  const r = evalWith({ ...proposal, action: "propose_slot" }, { listing_verified: true });
  assert.equal(r.verdict, "HUMAN_APPROVAL_REQUIRED");
});
test("human-review requests do not trigger any tool", () => {
  assert.equal(evalWith({ request_id: "DEMO-BOOK-01", action: "request_human_review" }, {}).verdict, "HUMAN_REVIEW");
});
test("rejects unsupported tool/action", () => {
  assert.equal(evalWith({ request_id: "DEMO-BOOK-01", action: "send_payment" }).verdict, "BLOCKED");
});
test("rejects unsafe or missing request id", () => {
  assert.equal(evalWith({ ...proposal, request_id: "../../secrets" }).ok, false);
});
test("does not mutate the caller's objects", () => {
  const p = structuredClone(proposal), c = structuredClone(context);
  evalWith(p, c); assert.deepEqual(p, proposal); assert.deepEqual(c, context);
});
test("repeat inputs yield identical decisions (no storage idempotency claimed)", () => {
  assert.deepEqual(evalWith(), evalWith(structuredClone(proposal), structuredClone(context)));
});
