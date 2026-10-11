# Winxtrack | Recruitment Intake & AI-Assisted Screening

[← Portfolio](../README.md) · [Workflow screenshot](../winxtrack-ai-recruitment-agent.png)

## Business Problem
Recruitment teams need structured applications, accessible CVs and consistent candidate records rather than fragmented messages and manual copying.

## Workflow Architecture
```text
Applicant → n8n application form (+ CV)
          → n8n processing / field mapping
          → Google Sheets candidate database
          → Email notification
          → AI-assisted qualification design / candidate status fields
```

![Winxtrack recruitment workflow](../winxtrack-ai-recruitment-agent.png)

## Candidate Information
Name, email, phone, current location, communication and customer-service experience, computer skills, evening availability and CV submission.

## My Work
- Designed the candidate form and database columns.
- Built the n8n intake workflow and mapped submissions into Google Sheets.
- Configured email routing and fields for application status and AI candidate assessment.
- Tested submissions, investigated errors and corrected field-mapping issues.

## Verification & Status
**Built/tested:** candidate intake and structured data-mapping workflow, with troubleshooting of form and sheet configuration.  
**Requires re-verification:** live public form availability, CV access permissions, email delivery and end-to-end AI qualification. The application form has previously shown an unpublished/404 state; this portfolio does not claim uninterrupted production availability.

**Human oversight:** AI assessment should assist, not autonomously make final hiring decisions. Candidate evaluation requires privacy controls and review for fairness.

## Reliability Considerations
- Validate mandatory fields and CV type/size.
- Generate a unique application ID to prevent duplicates.
- Limit access to CVs and candidate records.
- Retry temporary Sheets/email failures, alert on permanent failures and record execution IDs.
- Separate AI suggestions from recruiter-approved status changes.

These are design recommendations, not verified production features.

## Tools
n8n · Google Sheets · Gmail · AI/LLM tools

## Privacy
Candidate CVs, personal records and credentials are intentionally excluded.
