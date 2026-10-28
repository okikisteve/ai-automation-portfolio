# Real Estate Lead Intake — Reproducible, Sanitized Demo

This example is published as **technical evidence**, not as a deployable copy of any customer's private CRM.

## Files

- [qualify-lead.mjs](qualify-lead.mjs) — standalone JavaScript lead-validation and business-rule function.
- [qualify-lead.test.mjs](qualify-lead.test.mjs) — nine Node.js unit tests including exact budget boundaries, invalid inputs and repeated lead keys.
- [n8n-lead-intake-demo.json](n8n-lead-intake-demo.json) — importable, inactive **n8n workflow** with authenticated webhook → Code → JSON response.

## Test the JavaScript rules

Requires modern Node.js (18+); no packages or environment variables are necessary.

```bash
node --test qualify-lead.test.mjs
```

Example (synthetic data only):

```json
{
  "lead_key": "DEMO_0001",
  "full_name": "Ada Example",
  "phone": "+2348000000000",
  "email": "ada@example.com",
  "service": "land_sales",
  "preferred_location": "Lekki, Lagos",
  "budget_ngn": 5000000
}
```

Supported services: `land_sales`, `house_sales`, `rentals`, `joint_ventures`, `construction`.

Budget demonstration rules: `>= ₦100,000,000` → High; `>= ₦10,000,000` → Medium; below that → Standard; missing budget → Needs review. These are **illustrative demo thresholds**, not confirmed commercial routing policy.

## Import the n8n demo

1. In n8n, create a workflow and import `n8n-lead-intake-demo.json`.
2. Open **Authenticated Demo Webhook** and **select a new Header Auth credential under your control**. No secrets are included in the file.
3. Use **Listen for Test Event** and send a synthetic JSON POST request with the appropriate authentication header to the **Test URL** displayed by your own n8n instance.
4. Inspect **Validate & Qualify** output; valid payloads respond 200, invalid payloads respond 400.
5. Keep the demo inactive when finished. Do **not** publish an unauthenticated webhook or test with real customer data.

## Important limits

- The n8n demo intentionally **does not write to Google Sheets**, call any LLM, send WhatsApp messages, or create Google Calendar bookings.
- A stable `lead_key` is designed to support a future **Google Sheets Upsert** operation, but the sample does **not** implement storage-level duplicate prevention, concurrency control, or retry reconciliation.
- The example includes no customer spreadsheets, access tokens, contact lists, real client records, private n8n execution logs or business-specific identifiers.
- Unit tests verify **JavaScript decision logic only**. They do not establish successful production CRM delivery or real appointment booking.

## Extending to a real business workflow

Add an authenticated intake gateway, a protected Google Sheets **Upsert** node matching on `lead_key`, an internal follow-up step, error handling/monitoring, consent checks, and human approval of actual listings. Test all integrations under controlled credentials before enabling customer traffic.

[Read the portfolio case study](../../projects/real-estate-lead-inspection-automation.md).
