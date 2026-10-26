# Salesforce Flow — Automated Lead Qualification

**Platform:** Salesforce Developer Edition · Salesforce Flow Builder  
**Project:** Automated Lead Qualification and Assignment — V2  
**Status:** Activated and verified with newly created test leads on 26 October 2026  
**Use case:** Interior project lead prioritization for Iyere Projects Limited (development demonstration)

## Business problem

Incoming interior design and construction enquiries can vary widely in estimated budget. Manually sorting every lead creates repetitive work and can delay attention to higher-value opportunities. This workflow classifies each Salesforce Lead automatically when the record is created or updated.

## Workflow architecture

```text
Lead created or updated
        |
        v
Record-Triggered Flow (Lead)
Fast Field Updates / before-save
        |
        v
Classify Lead by Budget (Decision)
        |
        +-- High Priority ----> Assign High Priority ----+
        |                                                |
        +-- Medium Priority --> Assign Medium Priority --+--> Save Lead
        |                                                |
        +-- Low Priority -----> Assign Low Priority -----+
        |
        +-- Default Outcome --> No category assignment
```

### Configuration

- **Object:** Lead
- **Trigger:** A record is created or updated
- **Optimization:** Fast Field Updates (before-save)
- **Input:** Estimated Project Budget
- **Decision:** Classify Lead by Budget
- **Output:** Lead Category
- **Actions:** Assign High Priority, Assign Medium Priority, Assign Low Priority

Because this is a **before-save** flow, the Assignment elements set the field on the triggering record without requiring a separate Update Records element.

## Budget classification

| Lead Category | Budget rule |
| --- | --- |
| High Priority | Greater than ₦100,000,000 |
| Medium Priority | Greater than ₦10,000,000 and less than ₦100,000,000 |
| Low Priority | Less than or equal to ₦10,000,000 |

**Boundary note:** The displayed High and Medium outcome settings previously used strict greater-than/less-than operators. Therefore an exact budget of **₦100,000,000** may reach the Default Outcome unless the boundary has subsequently been adjusted. This case still requires a specific boundary test. The confirmed Low Priority operator is **Less Than or Equal**.

## Verified end-to-end test cases

The following records were created in Salesforce, and their saved Lead Category values were visually checked on the Lead details screen after V2 activation.

| Test record | Estimated budget | Saved Lead Category | Result |
| --- | ---: | --- | --- |
| Test Low Budget Client | ₦5,000,000 | Low Priority | Passed |
| Test Medium Budget Client | ₦25,000,000 | Medium Priority | Passed |
| Test High Priority V2 | ₦120,000,000 | High Priority | Passed |

These tests demonstrate that the three main branches successfully classify newly created Lead records and persist the result.

## Implementation steps

1. Added Estimated Project Budget and Lead Category fields to the Lead workflow.
2. Configured a record-triggered Lead flow for creation and updates.
3. Selected **Fast Field Updates** for before-save changes.
4. Built the **Classify Lead by Budget** Decision element.
5. Added category-specific Assignment elements.
6. Used debug runs to inspect routing.
7. Saved and activated **V2**.
8. Created new sample leads at ₦5m, ₦25m and ₦120m.
9. Opened the Lead **Details** view and verified the automatically populated category.

## Evidence and screenshots

### Active Salesforce Flow Builder workflow

![Salesforce Automated Lead Qualification and Assignment V2 — active record-triggered workflow](../Salesforce%20Flow%20Automation.png)

[Open full-resolution workflow screenshot](../Salesforce%20Flow%20Automation.png)

Screenshots captured during implementation show:

- **Flow Builder:** Record-Triggered Flow → Classify Lead by Budget → three Assignment branches.
- **Activation:** Salesforce success banner, “Your automation was activated,” with V2 marked Active.
- **Low Priority:** Test Low Budget Client — ₦5,000,000 and Lead Category Low Priority.
- **Medium Priority:** Test Medium Budget Client — ₦25,000,000 and Lead Category Medium Priority.
- **High Priority:** Test High Priority V2 — ₦120,000,000 and Lead Category High Priority.

*The active Flow Builder workflow screenshot is published above. Individual saved-record test screenshots are documented but have not yet been uploaded to this repository.*

## Skills demonstrated

Salesforce CRM · Flow Builder · Record-triggered flows · Before-save automation · Decision logic · Conditional routing · Field assignments · Debugging · End-to-end testing · Workflow documentation

## Future improvements

- Explicitly resolve and test the exact ₦100,000,000 boundary.
- Test ₦10,000,000 and updated-record behavior.
- Add error handling, reporting and optional notifications or task creation in a separate after-save automation.
- Add clean, sanitized screenshots of the three saved Lead Category test results.

**Scope:** This is a Salesforce Developer Edition demonstration. It does not claim a production deployment, automated ownership reassignment, email notifications, or integration with n8n.
