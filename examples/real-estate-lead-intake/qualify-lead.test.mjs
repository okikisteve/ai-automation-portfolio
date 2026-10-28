import test from "node:test";
import assert from "node:assert/strict";
import { qualifyLead } from "./qualify-lead.mjs";

const valid = {
  lead_key: "DEMO_0001",
  full_name: "Ada Example",
  phone: "+2348000000000",
  email: "ada@example.com",
  service: "land_sales",
  preferred_location: "Lekki, Lagos",
  budget_ngn: 5000000
};

test("accepts valid synthetic land-sales lead", () => {
  const result = qualifyLead(valid);
  assert.equal(result.ok, true);
  assert.equal(result.lead.priority, "Standard");
  assert.equal(result.lead.next_action.includes("Verify land title"), true);
});

test("supports all five services", () => {
  for (const service of ["land_sales", "house_sales", "rentals", "joint_ventures", "construction"]) {
    const result = qualifyLead({ ...valid, service });
    assert.equal(result.ok, true, service);
    assert.ok(result.lead.next_action);
  }
});

test("10m NGN is Medium (boundary)", () => {
  assert.equal(qualifyLead({ ...valid, budget_ngn: 10000000 }).lead.priority, "Medium");
});

test("100m NGN is High (boundary)", () => {
  assert.equal(qualifyLead({ ...valid, budget_ngn: 100000000 }).lead.priority, "High");
});

test("missing budget goes to manual review", () => {
  assert.equal(qualifyLead({ ...valid, budget_ngn: "" }).lead.priority, "Needs review");
});

test("rejects invalid service and budget", () => {
  const result = qualifyLead({ ...valid, service: "unknown", budget_ngn: "-10" });
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 2);
});

test("rejects invalid contact and absent stable key", () => {
  const result = qualifyLead({ ...valid, lead_key: "", phone: "abc", email: "not-email" });
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 3);
});

test("does not mutate caller input", () => {
  const original = structuredClone(valid);
  qualifyLead(valid);
  assert.deepEqual(valid, original);
});

test("same lead key produces same qualification (storage not implemented)", () => {
  assert.deepEqual(qualifyLead(valid), qualifyLead({ ...valid }));
});
