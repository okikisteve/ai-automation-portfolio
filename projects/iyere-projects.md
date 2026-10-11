# Iyere Projects | Lead Intake & CRM-Style Automation

[← Portfolio](../README.md) · [Workflow screenshot](../iyere-ai-customer-support-agent.png)

## Business Problem
An interior architecture and finishing business needs a consistent way to capture prospective clients, centralize inquiries and schedule follow-up without repeatedly copying information between tools.

## Workflow Architecture
```text
Prospect → n8n lead form → n8n workflow → Google Sheets lead database
                                      └→ Google Calendar follow-up (tested)
                                      └→ AI-assisted handling (experimental)
                                      └→ WhatsApp API messaging (configuration explored)
```

![Iyere Projects workflow](../iyere-ai-customer-support-agent.png)

## My Work
- Designed the intake process and lead-data mapping.
- Built n8n workflow steps and connected Google Sheets.
- Tested calendar-event creation for a sample lead.
- Experimented with an AI agent for lead-handling logic.
- Worked on Meta/WhatsApp API configuration and investigated delivery issues.

## Verification & Status
**Built/tested:** form-to-sheet lead capture and a sample calendar event.  
**Experimental/in progress:** AI-led follow-up and WhatsApp delivery; do not interpret these as fully deployed, reliable customer messaging.

## Reliability Considerations
- Validate mandatory contact fields before creating a lead.
- Use a stable lead identifier to avoid duplicate entries on resubmission.
- Add failure alerts and logs for Google Sheets or Calendar API errors.
- Apply retry/backoff to transient API failures and review failed executions.
- Protect personal data and avoid placing credentials in logs.

These are recommended hardening steps; they are not represented as already implemented.

## Tools
n8n · Google Sheets · Google Calendar · AI/LLM tools · Meta/WhatsApp API (exploratory)

## Privacy
No private leads, access tokens, secrets or production credentials are included.
