# PRD: Work Wins Log (v1 → v2)

## 1. Overview

**Product Name (working):** Work Wins Log  
**Category:** Internal productivity / performance tooling  

**Objective:**  
Help employees continuously log, organize, and export their work evidence into performance-review-ready summaries.

---

## 2. Problem Statement

Employees:
- Forget what they worked on over time  
- Struggle to recall impact during reviews  
- Use scattered tools (Slack, docs, memory)  
- Undersell contributions  

Managers:
- Lack visibility into ongoing contributions  
- Rely on incomplete summaries  

---

## 3. Goals & Non-Goals

### Goals (v1)
- Fast logging of work “wins”
- Structured retrieval (time, project, tags)
- Export into review-ready formats
- Encourage continuous logging habit

### Goals (v2)
- AI-assisted summaries
- Controlled sharing with managers
- Recognition layer

### Non-Goals (v1)
- Performance scoring
- Public feeds
- Automatic manager surveillance
- Deep integrations (Slack/Jira ingestion)

---

## 4. Target Users

### Primary
- Individual contributors (ICs)

### Secondary (later)
- Managers
- HR / leadership

---

## 5. Core User Jobs

1. Capture work quickly  
2. Store evidence  
3. Organize by context  
4. Retrieve past work  
5. Convert logs into review content  

---

## 6. Key Use Cases

### UC1: Log a win
- Add note
- Attach link
- Upload screenshot/file
- Optional impact

### UC2: Browse work
- Filter by date, project, tags

### UC3: Prepare for review
- Select entries
- Generate structured summary
- Export

### UC4 (v2): AI assist
- Generate polished summaries

---

## 7. Product Scope

### V1 (MVP)
- SSO login
- Personal dashboard
- CRUD entries
- File uploads
- Link attachments
- Tagging + filters
- Export (non-AI)

### V1.5
- Share entries with manager
- Manager read-only view

### V2
- AI summaries
- Peer/manager recognition
- Optional public feed

---

## 8. Functional Requirements

### 8.1 Authentication
- SSO (Google / Okta / Azure AD)
- Domain-restricted access

---

### 8.2 Win Entry Object

Fields:
- `id`
- `user_id`
- `title`
- `description`
- `date_of_work`
- `project`
- `tags[]`
- `impact`
- `evidence_links[]`
- `file_attachments[]`
- `visibility`
- `created_at`
- `updated_at`

---

### 8.3 Dashboard
- Chronological entries
- Filters (date, tag, project)
- Quick add

---

### 8.4 Entry Creation
- Fast (<10s)
- Minimal fields

Fields:
- Title (required)
- Description
- Links
- File upload
- Tags
- Date (default today)

---

### 8.5 Export

User can filter and export in:

#### Format A: Bullets
- Led redesign of X → improved Y → evidence: [link]

#### Format B: Structured
What I did:
Why it mattered:
Outcome:
Evidence:

#### Format C: Timeline
Chronological raw entries

---

### 8.6 File Handling
- Image uploads
- Cloud storage (S3 or equivalent)
- Max size ~10MB

---

## 9. AI (V2)

### Capabilities
- Rewrite logs into polished bullets
- Group into themes
- Generate review drafts

### Constraints
- No hallucination
- Must reference source entries
- Structured JSON output

### Architecture
- Backend AI service layer
- Provider-agnostic

---

## 10. UX Principles

- Low friction > completeness
- Feels like “saving evidence”
- Minimal forms
- Private by default
- Review mode = rewarding

---

## 11. Screens (v1)

1. Login  
2. Dashboard  
3. Add/Edit Entry  
4. Review / Export  

---

## 12. Tech Stack (Suggested)

Frontend:
- Next.js

Backend:
- Node.js

Database:
- PostgreSQL

Auth:
- SSO

Storage:
- S3

Optional:
- Supabase / Firebase for MVP speed

---

## 13. Data Model

### Users
- id
- email
- role

### Entries
- id
- user_id
- metadata fields

### Files
- id
- entry_id
- file_url

---

## 14. Metrics

### Primary
- Weekly active users
- Entries per user/month
- Retention after first entry

### Secondary
- Export usage
- Entries used in exports

---

## 15. Risks

### Adoption
Logging feels like extra work  
→ mitigate via fast UX

### Trust
Feels like surveillance  
→ keep private + opt-in sharing

### AI (v2)
Over-polished outputs  
→ require user editing

---

## 16. Positioning

### Core Message
“A private work log that helps you never forget your impact.”

### Value Props
- Beat recency bias
- Capture invisible work
- Simplify reviews
- Own your narrative

---

## 17. Launch Plan

### Phase 1
- Alpha (5–10 users)

### Phase 2
- Small team rollout

### Phase 3
- Org-wide release + AI

---

## 18. Future Opportunities

- Slack/Jira integrations
- Auto-capture suggestions
- Competency mapping
- Promotion readiness signals
- Org-level insights (aggregated)

---

## 19. Key Principle

This is not a performance evaluation tool.  
It is a self-advocacy and memory system.