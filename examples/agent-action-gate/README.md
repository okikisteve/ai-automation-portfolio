# AI-Agent Action Gate — Inspection Scheduling (Offline Demo)

A reproducible policy layer for **AI-agent proposed actions**. The goal is to demonstrate that model output must not be treated as authority to write to a calendar, send customer messages, or assume consent.

## What is implemented

- A **pure JavaScript gate** in [action-gate.mjs](action-gate.mjs) that validates a proposed tool action.
- [14 Node.js tests](action-gate.test.mjs) covering consent, unavailable slots, listing checks, Sundays, hours, invalid dates and unsupported tool requests.
- An **inactive, importable n8n webhook demo** in [n8n-agent-action-gate.json](n8n-agent-action-gate.json) (Header Auth credential required). It runs the same rules in an n8n Code node and returns JSON. No credentials are stored in the file.

## Run

Node.js 20+; no packages, account, secret key or network connection required.

```bash
cd examples/agent-action-gate
node --test action-gate.test.mjs
```

To inspect a sample using Node:

```bash
node --input-type=module -e 'import {evaluateAgentAction} from "./action-gate.mjs"; console.log(evaluateAgentAction({request_id:"DEMO-BOOK-01",action:"book_inspection",booking:{date:"2026-11-21",start_time:"10:00",end_time:"11:00",timezone:"Africa/Lagos"}},{listing_verified:true,customer_confirmed:true,calendar_available:true}))'
```

Expected verdict: `HUMAN_APPROVAL_REQUIRED` — **not** a completed booking.

## Import to n8n

1. Import `n8n-agent-action-gate.json` into your own n8n instance.
2. Open **Authenticated Action Gate** and attach a fresh Header Auth credential. Never test against real customers.
3. Start a test execution and POST the JSON below to the webhook's **Test URL** using your credential.
4. Review the verdict from **Policy Gate** and **Return Decision**. Do not activate publicly unless you have configured real authentication, rate limits and trust boundaries.

```json
{
  "proposal": {
    "request_id": "DEMO-BOOK-01",
    "action": "book_inspection",
    "booking": {"date":"2026-11-21","start_time":"10:00","end_time":"11:00","timezone":"Africa/Lagos"}
  },
  "context": {
    "listing_verified":true,
    "customer_confirmed":true,
    "calendar_available":true
  }
}
```

**Security boundary:** The demo accepts `context` in the test body only for reproducibility. In a real app, the backend must derive verified listings, customer confirmation and calendar availability independently and **never trust the LLM or caller to assert them**. Boolean checks are not proof of consent. A race between availability checks and actual booking must also be handled by the real scheduler.

**Limitations:** This is **not a connected LLM/AI Agent node**, a production policy engine or a live Google Calendar integration. It does not book, update CRM records, contact customers or guarantee idempotency. It demonstrates deterministic validation of proposed AI tool actions, ready for integration into a controlled workflow after separate security work.
