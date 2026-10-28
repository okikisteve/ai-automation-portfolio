/**
 * Synthetic, client-neutral real-estate lead qualification example.
 * Pure function: no credentials, API calls, storage, or customer data.
 * IMPORTANT: Lead key is intended for an eventual CRM upsert; this
 * function alone does NOT provide deduplication/idempotency.
 */
export function qualifyLead(input) {
  const p = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const str = (value) => String(value ?? "").trim();
  const errors = [];
  const leadKey = str(p.lead_key);
  const name = str(p.full_name);
  const phone = str(p.phone);
  const email = str(p.email).toLowerCase();
  const service = str(p.service).toLowerCase();
  const location = str(p.preferred_location);

  const nextActions = {
    land_sales: "Verify land title, approved listings, location and requirements",
    house_sales: "Confirm requirements and verify an approved house listing",
    rentals: "Confirm move-in date, rental terms and current listing availability",
    joint_ventures: "Request project brief and route to human review",
    construction: "Request project scope and arrange a human consultation"
  };

  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(leadKey)) errors.push("lead_key must be 8–64 letters, digits, underscores or hyphens");
  if (name.length < 2 || name.length > 100) errors.push("full_name must be 2–100 characters");
  if (!/^\+?[0-9 ()-]{7,22}$/.test(phone)) errors.push("phone must be a plausible international/local number");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("email must be valid when supplied");
  if (!Object.hasOwn(nextActions, service)) errors.push("service must be land_sales, house_sales, rentals, joint_ventures or construction");
  if (location.length < 2 || location.length > 120) errors.push("preferred_location must be 2–120 characters");

  let budget = null;
  if (p.budget_ngn !== undefined && p.budget_ngn !== null && str(p.budget_ngn) !== "") {
    const raw = str(p.budget_ngn);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
      errors.push("budget_ngn must be a non-negative whole naira amount");
    } else {
      budget = Number(raw);
    }
  }

  if (errors.length) return { ok: false, errors };

  // Illustrative thresholds only; business owners must approve routing rules.
  const priority = budget === null ? "Needs review"
    : budget >= 100000000 ? "High"
    : budget >= 10000000 ? "Medium"
    : "Standard";

  return {
    ok: true,
    lead: {
      lead_key: leadKey,
      full_name: name,
      phone,
      email,
      service,
      preferred_location: location,
      budget_ngn: budget,
      priority,
      next_action: nextActions[service],
      status: "New",
      source: "portfolio-demo"
    }
  };
}
