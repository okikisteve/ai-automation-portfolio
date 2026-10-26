# Salesforce Flow — Automated Lead Qualification

**Platform:** Salesforce Developer Edition · Flow Builder · Record-Triggered Flow

**Project:** Automated Lead Qualification and Assignment (V2)

## Business problem
Interior project inquiries vary considerably in budget. Manually sorting incoming leads slows prioritization and follow-up. This prototype categorizes Salesforce Lead records using an Estimated Project Budget field.

## Workflow

1. A Lead record is created or updated with an estimated project budget.
2. A record-triggered flow checks that the budget is populated.
3. A Decision element, **Classify Lead by Budget**, routes the lead by budget.
4. Assignment elements set the Lead Category field on the triggering Lead.
5. The flow is configured for **Fast Field Updates** (before-save field assignment).

## Budget rules (V2 configuration under final review)

| Category | Estimated project budget |
| --- | --- |
| High Priority | ₦100,000,000 and above |
| Medium Priority | Above ₦10,000,000 and below ₦100,000,000 |
| Low Priority | ₦10,000,000 and below (operator boundary still being verified) |

The flow also has a default outcome for records not matching a named category.

## Testing and evidence

- Debug run using a ₦120,000,000 Lead selected the **High Priority** decision outcome and updated the `Lead_Category__c` variable.
- Debug run using a ₦50,000,000 Lead selected the **Medium Priority** outcome and updated the `Lead_Category__c` variable.
- A newly created test Lead with an estimated budget of ₦5,000,000 displayed **Low Priority** in the Salesforce Lead details page.
- The Start element was verified as **Lead**, **created or updated**, optimized for **Fast Field Updates**.

**Status as of 26 October 2026:** V2 is **inactive**. Debug tests and a test Lead demonstrate the classification logic, but the final Low Priority operator check, activation, and post-activation end-to-end verification are pending. Debug runs performed in rollback mode do not themselves save Lead changes.

## Skills demonstrated

Salesforce Flow Builder · Record-triggered automation · Decision outcomes · Conditional routing · Field assignments · Before-save updates · Debugging · Lead data management

## Next steps

- Confirm the Low Priority operator is **Less Than or Equal** to ₦10,000,000.
- Save and activate V2 after final review.
- Test newly created and updated Leads at boundary values (₦10 million and ₦100 million) and verify the saved Lead Category.
- Add sanitized screenshots of the flow canvas and test results.

*This is a development/demo workflow, not a claim of production deployment.*
