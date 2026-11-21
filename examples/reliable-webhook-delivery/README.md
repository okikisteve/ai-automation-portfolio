# Reliable Webhook Delivery — Retry & Duplicate-Suppression Policy (Demo)

A runnable, credential-free **decision engine** for operational automation and n8n integration design. It answers a narrow question: *given a synthetic event ID, delivery attempt result and a state snapshot, what should the system do next?*

It intentionally **does not** send HTTP requests, persist a queue, implement real distributed locks, authenticate a customer, execute retries, or prove durable idempotency.

## Files

- [delivery-policy.mjs](delivery-policy.mjs) — deterministic pure JavaScript delivery policy.
- [delivery-policy.test.mjs](delivery-policy.test.mjs) — **19 Node.js unit tests** for HTTP outcomes, retries, duplicates, limits and invalid inputs.
- [n8n-delivery-policy-demo.json](n8n-delivery-policy-demo.json) — **inactive**, importable authenticated Webhook → Code → Respond to Webhook.

## Test locally

Requires Node.js 20+; no packages, credentials or Internet access.

```bash
cd examples/reliable-webhook-delivery
node --test delivery-policy.test.mjs
```

## Example decision

```bash
node --input-type=module -e 'import {planWebhookDelivery} from "./delivery-policy.mjs"; console.log(planWebhookDelivery({event_id:"DEMO_EVENT_001",attempt:1,existing_event_state:"unseen",http_status:503}))'
```

The example returns `RETRY_LATER`, with a simulated 15-second retry delay and `external_action_performed: false`.

## n8n import instructions

1. Import `n8n-delivery-policy-demo.json` into your own n8n instance.
2. Open **Authenticated Demo Webhook** and configure your own **Header Auth** credential.
3. Listen for a **Test Event**; POST the following fake data as JSON to the instance-generated test URL, with its authentication header.
4. Review the decision from **Plan Delivery** and **Return Plan**. Keep the imported workflow inactive outside a secure test environment.

```json
{
  "event_id": "DEMO_EVENT_001",
  "attempt": 1,
  "existing_event_state": "unseen",
  "http_status": 503
}
```

## Decision rules

| Condition | Recommendation |
| --- | --- |
| Stored state says delivered | `SUPPRESS_DUPLICATE` |
| Stored state says processing | `WAIT_FOR_LOCK` |
| HTTP 2xx | `MARK_DELIVERED` |
| HTTP 409 | `HUMAN_REVIEW` for receiver-state reconciliation |
| HTTP 400/other non-transient or ambiguous response | `HUMAN_REVIEW` |
| HTTP 408, 425, 429, 5xx or simulated network error | `RETRY_LATER` with capped exponential delay |
| Fifth failed attempt | `DEAD_LETTER_REVIEW` |

For 429 and 503, a bounded numeric `retry_after_seconds` is respected without shortening the calculated delay. This sample does not parse HTTP-date Retry-After formats, handle rate limits, or add jitter.

## Safety & production limitations

The `existing_event_state` field is a **fabricated test snapshot** supplied by the caller. A production worker must retrieve it from a trusted store and acquire an **atomic claim/lease** to stop concurrent duplicate processing. Likewise, a successful 2xx response can only support a delivered status when the actual receiver's contract confirms it.

For a real customer deployment, implement durable event storage, unique event IDs, lease expiration, atomic state transitions, secure webhook authentication, verified receiver receipts, retry jitter, dead-letter persistence, rate-limiting, telemetry and recovery procedures.

The purpose of this demo is to present **testable reliability reasoning**, not to claim those infrastructure features are deployed.

[Back to main portfolio](../../README.md).
