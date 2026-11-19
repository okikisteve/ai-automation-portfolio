# IT Incident Triage & Routing — Reproducible n8n + JavaScript Demo

A generic (non-client) operational routing example that turns fabricated alerts into **reviewable decisions**. It demonstrates incident normalization, impact-based priority upgrades and audit-friendly outputs.

## What this proves

- [triage.mjs](triage.mjs): pure, deterministic JavaScript with input validation.
- [triage.test.mjs](triage.test.mjs): **13 Node.js tests** for severity routes, impact thresholds, invalid inputs, and not echoing alert summaries.
- [n8n-incident-triage.json](n8n-incident-triage.json): inactive n8n workflow: authenticated Webhook → Code → Respond to Webhook.

No LLM, production systems, business-specific modules, incident platforms, credentials or customer records are included.

## Run locally

Node.js 20+; no dependencies or keys.

```bash
cd examples/incident-triage
node --test triage.test.mjs
```

Try the rules:

```bash
node --input-type=module -e 'import {triageIncident} from "./triage.mjs";console.log(triageIncident({event_id:"DEMO-INC-001",service:"Example API",severity:"P4",summary:"Synthetic errors spike in example API",affected_users:1200}))'
```

Expected output includes `effective_priority: P2`, `queue: service-on-call` and `status: RECOMMENDATION_ONLY`.

## Import into n8n

Import `n8n-incident-triage.json`; assign your own **Header Auth** credential in **Authenticated Incident Webhook**; click **Listen for Test Event** and POST this synthetic request to the test endpoint:

```json
{
  "event_id": "DEMO-INC-001",
  "service": "Demo billing API",
  "severity": "P3",
  "summary": "Synthetic alert: elevated error rates",
  "affected_users": 1000,
  "critical_service": false
}
```

The decision is a suggestion for human review. The acknowledgement times are **illustrative policy targets**, not real company SLAs. The function does not deduplicate alerts, persist records, send pages, notify teams, open tickets or execute remediation.

**Production requirements** would include trustworthy alert source authentication, stable event deduplication, approval of priority rules, pager escalation integrations, rate limits, error handling, observability and operational tests.
