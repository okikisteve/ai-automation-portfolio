# Kachi & Reuben | Fashion Order Intake Automation

[← Portfolio](../README.md) · [Workflow screenshot](../kachi-reuben-sales-order-automation.png)

## Business Problem
A men's fashion brand needs complete, consistent customer orders covering product variations, order type, delivery preferences and customer communication.

## Workflow Architecture
```text
Customer → n8n order form → field mapping → Google Sheets order database
                                         └→ Gmail order communication
Future extensions: WhatsApp, Calendar, marketing follow-ups
```

![Kachi & Reuben order workflow](../kachi-reuben-sales-order-automation.png)

## Captured Order Details
Customer name and WhatsApp number; product and category; size, colour and quantity; ready-to-wear, pre-order or custom order; delivery location and preferred date; contact preference; special instructions/measurements; order ID.

## My Work
- Designed the structured order form and workflow.
- Mapped form submissions to Google Sheets and corrected mapping errors.
- Configured Gmail communication and tested submissions.
- Added an order-ID field/structure and corrected form labels.
- Identified email spam placement during testing.

## Verification & Status
**Built/tested:** form → n8n → Google Sheets → Gmail, with corrected mapping and successful test submissions.  
**Needs improvement:** email deliverability and production-grade duplicate handling.  
**Planned, not yet verified as deployed:** WhatsApp, Calendar and marketing extensions.

## Reliability Considerations
- Validate quantity, contact details and required product choices.
- Ensure every order has a unique identifier; check for duplicate submissions.
- Log email-send failures without exposing private customer data.
- Retry transient provider errors, with limits to avoid duplicate customer emails.
- Monitor form, sheet and email executions and define a manual recovery procedure.

These are proposed improvements, not assertions of completed implementation.

## Tools
n8n · Google Sheets · Gmail

## Privacy
No customer records, payment information or private credentials are included.
