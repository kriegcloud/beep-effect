# Sample Emails for Knowledge Graph Demo

> 5 sample emails designed to demonstrate knowledge extraction and entity resolution.

---

## Metadata

| Property | Value |
|----------|-------|
| **Source** | Synthetic (generated for POC) |
| **Email Count** | 5 |
| **Date Created** | 2026-01-29 |
| **Purpose** | Entity extraction and resolution testing |

### Expected Entity Counts by Type

| Entity Type | Expected Count | Notes |
|-------------|----------------|-------|
| **Person** | 5 unique | John Smith, Sarah Chen, Mike Wilson, Alex Rodriguez, Lisa Park |
| **Organization** | 3 | Acme Corp, Engineering team, Platform team |
| **Project** | 2 | Q4 Release, Budget Review |
| **Meeting** | 4 | Project Sync, Tech Review, Leadership, Board |
| **Date** | 5 | Various project deadlines and meeting dates |
| **Role** | 5 | Senior Engineering Manager, UX Lead, QA Lead, Finance Director |

### Data Quality Characteristics

- **Entity Overlap**: All emails reference shared entities (Acme Corp, Q4 Release)
- **Name Variations**: Includes resolution challenges (John Smith / J. Smith / John)
- **Relationship Density**: 30+ extractable relationships across emails
- **Confidence Variance**: Explicit mentions (0.95) vs implicit references (0.75-0.85)

### Usage

```bash
# Load sample data for entity extraction testing
bun run test:knowledge-extraction --input specs/knowledge-graph-poc-demo/sample-data/emails.md

# Verify extracted entities against expected counts
bun run verify:entities --expected 25 --clusters 10

# Test entity resolution
bun run test:resolution --input emails.md --aliases "J. Smith=John Smith"
```

---

## Design Principles

1. **Entity Overlap**: Multiple emails reference the same entities (Acme Corp, Q4 Release)
2. **Role Diversity**: Different entity types (Person, Organization, Project, Meeting)
3. **Relationship Variety**: Various predicates (worksFor, leadsProject, attendedBy)
4. **Resolution Challenge**: Name variations (John Smith, John, J. Smith)
5. **Evidence Quality**: Clear sentences that can be grounded

---

## Sample Ontology (Turtle)

```turtle
@prefix schema: <http://schema.org/> .
@prefix demo: <http://demo.beep.dev/ontology#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

# Classes
schema:Person a rdfs:Class ;
  rdfs:label "Person" ;
  rdfs:comment "A human being" .

schema:Organization a rdfs:Class ;
  rdfs:label "Organization" ;
  rdfs:comment "A company or institution" .

demo:Project a rdfs:Class ;
  rdfs:label "Project" ;
  rdfs:comment "A planned undertaking" .

demo:Meeting a rdfs:Class ;
  rdfs:label "Meeting" ;
  rdfs:comment "A scheduled gathering" .

demo:Date a rdfs:Class ;
  rdfs:label "Date" ;
  rdfs:comment "A calendar date" .

demo:Role a rdfs:Class ;
  rdfs:label "Role" ;
  rdfs:comment "A job title or position" .

# Properties
schema:worksFor a rdf:Property ;
  rdfs:label "works for" ;
  rdfs:domain schema:Person ;
  rdfs:range schema:Organization .

schema:memberOf a rdf:Property ;
  rdfs:label "member of" ;
  rdfs:domain schema:Person ;
  rdfs:range schema:Organization .

demo:leadsProject a rdf:Property ;
  rdfs:label "leads project" ;
  rdfs:domain schema:Person ;
  rdfs:range demo:Project .

demo:worksOnProject a rdf:Property ;
  rdfs:label "works on project" ;
  rdfs:domain schema:Person ;
  rdfs:range demo:Project .

demo:hasDeadline a rdf:Property ;
  rdfs:label "has deadline" ;
  rdfs:domain demo:Project ;
  rdfs:range demo:Date .

demo:attendedBy a rdf:Property ;
  rdfs:label "attended by" ;
  rdfs:domain demo:Meeting ;
  rdfs:range schema:Person .

demo:discusses a rdf:Property ;
  rdfs:label "discusses" ;
  rdfs:domain demo:Meeting ;
  rdfs:range demo:Project .

demo:scheduledFor a rdf:Property ;
  rdfs:label "scheduled for" ;
  rdfs:domain demo:Meeting ;
  rdfs:range demo:Date .

demo:hasRole a rdf:Property ;
  rdfs:label "has role" ;
  rdfs:domain schema:Person ;
  rdfs:range demo:Role .

demo:reportsTo a rdf:Property ;
  rdfs:label "reports to" ;
  rdfs:domain schema:Person ;
  rdfs:range schema:Person .
```

---

## Email 1: Project Update

**Subject:** Q4 Release Project Update

**From:** john.smith@acmecorp.com
**To:** team@acmecorp.com
**Date:** October 15, 2024

```
Hi Team,

I wanted to share a quick update on the Q4 Release project.

John Smith from the Engineering team at Acme Corp has been leading the Q4 Release
initiative. The project has a deadline of December 15, 2024.

Key highlights:
- Frontend development is 80% complete
- Backend API integration starts next week
- QA testing scheduled for November

Sarah Chen will be joining the project next week as the UX lead. She'll report
directly to John for this initiative.

Let me know if you have any questions.

Best,
John Smith
Senior Engineering Manager
Acme Corp
```

**Expected Entities:**
- John Smith (Person) - confidence: 0.95
- Acme Corp (Organization) - confidence: 0.95
- Q4 Release (Project) - confidence: 0.90
- Sarah Chen (Person) - confidence: 0.90
- December 15, 2024 (Date) - confidence: 0.95
- Engineering team (Organization) - confidence: 0.75
- Senior Engineering Manager (Role) - confidence: 0.85

**Expected Relations:**
- John Smith worksFor Acme Corp
- John Smith leadsProject Q4 Release
- Q4 Release hasDeadline December 15, 2024
- Sarah Chen worksOnProject Q4 Release
- Sarah Chen reportsTo John Smith

---

## Email 2: Meeting Invitation

**Subject:** Project Sync: Q4 Release Status

**From:** sarah.chen@acmecorp.com
**To:** john.smith@acmecorp.com, mike.wilson@acmecorp.com
**Date:** October 18, 2024

```
Hi John and Mike,

I'd like to schedule a project sync meeting to discuss the Q4 Release status.

Sarah Chen from Acme Corp is organizing a status meeting for October 22, 2024 at 2pm.
The meeting will be attended by John Smith, Mike Wilson, and myself.

Agenda:
1. Current progress review
2. Timeline assessment for the December deadline
3. Resource allocation for the final sprint

Mike Wilson, our QA lead at Acme Corp, will present the testing strategy.

Please confirm your availability.

Thanks,
Sarah Chen
UX Lead
Acme Corp
```

**Expected Entities:**
- Sarah Chen (Person) - confidence: 0.95
- John Smith (Person) - confidence: 0.95
- Mike Wilson (Person) - confidence: 0.95
- Acme Corp (Organization) - confidence: 0.95
- Q4 Release (Project) - confidence: 0.90
- Project Sync Meeting (Meeting) - confidence: 0.85
- October 22, 2024 (Date) - confidence: 0.95
- UX Lead (Role) - confidence: 0.85
- QA Lead (Role) - confidence: 0.85

**Expected Relations:**
- Sarah Chen worksFor Acme Corp
- Mike Wilson worksFor Acme Corp
- Project Sync Meeting discusses Q4 Release
- Project Sync Meeting attendedBy John Smith
- Project Sync Meeting attendedBy Sarah Chen
- Project Sync Meeting attendedBy Mike Wilson
- Project Sync Meeting scheduledFor October 22, 2024
- Sarah Chen hasRole UX Lead
- Mike Wilson hasRole QA Lead

---

## Email 3: Technical Review

**Subject:** Tech Review: Q4 Architecture Decisions

**From:** john.smith@acmecorp.com
**To:** engineering@acmecorp.com
**Date:** October 20, 2024

```
Team,

J. Smith here with an update from the technical review.

We held a Tech Review Meeting yesterday to finalize architecture decisions for
Q4 Release. The meeting was attended by the core engineering team including
Alex Rodriguez from the Platform team.

Key decisions:
1. Moving to microservices architecture
2. Adopting GraphQL for the API layer
3. Using Kubernetes for deployment

Alex Rodriguez will lead the infrastructure migration, working closely with
John on the overall Q4 Release timeline.

The Tech Review Meeting also covered the Budget Review project, which has
dependencies on our Q4 Release infrastructure.

Next steps will be shared in the all-hands on Friday.

- J. Smith
```

**Expected Entities:**
- J. Smith / John Smith (Person) - confidence: 0.90 (name variation)
- Alex Rodriguez (Person) - confidence: 0.95
- Acme Corp (Organization) - confidence: 0.80 (implicit)
- Q4 Release (Project) - confidence: 0.90
- Tech Review Meeting (Meeting) - confidence: 0.90
- Platform team (Organization) - confidence: 0.75
- Budget Review (Project) - confidence: 0.85

**Expected Relations:**
- John Smith leadsProject Q4 Release
- Tech Review Meeting discusses Q4 Release
- Tech Review Meeting attendedBy Alex Rodriguez
- Alex Rodriguez memberOf Platform team
- Budget Review dependsOn Q4 Release (if predicate available)

**Entity Resolution Note:** "J. Smith" should resolve to "John Smith" from Email 1.

---

## Email 4: Budget Discussion

**Subject:** Budget Review for Q4 Initiatives

**From:** lisa.park@acmecorp.com
**To:** leadership@acmecorp.com
**Date:** October 22, 2024

```
Dear Leadership Team,

Lisa Park from Finance at Acme Corp has completed the initial Budget Review
for our Q4 initiatives.

Summary:
- Q4 Release project: $450K allocated
- Infrastructure upgrade: $200K allocated
- Training programs: $75K allocated

Sarah Chen has requested additional UX research budget for the Q4 Release.
John Smith has approved the request pending finance review.

The Budget Review project is scheduled for completion by November 30, 2024.

I'll be presenting the findings at the Leadership Meeting on October 25, 2024.
Expected attendees: John Smith, Sarah Chen, and Mike Wilson.

Best regards,
Lisa Park
Finance Director
Acme Corp
```

**Expected Entities:**
- Lisa Park (Person) - confidence: 0.95
- Acme Corp (Organization) - confidence: 0.95
- Budget Review (Project) - confidence: 0.95
- Q4 Release (Project) - confidence: 0.90
- Sarah Chen (Person) - confidence: 0.95
- John Smith (Person) - confidence: 0.95
- Mike Wilson (Person) - confidence: 0.90
- Leadership Meeting (Meeting) - confidence: 0.85
- November 30, 2024 (Date) - confidence: 0.95
- October 25, 2024 (Date) - confidence: 0.95
- Finance Director (Role) - confidence: 0.90

**Expected Relations:**
- Lisa Park worksFor Acme Corp
- Lisa Park leadsProject Budget Review
- Budget Review hasDeadline November 30, 2024
- Leadership Meeting scheduledFor October 25, 2024
- Leadership Meeting attendedBy John Smith
- Leadership Meeting attendedBy Sarah Chen
- Leadership Meeting attendedBy Mike Wilson
- Lisa Park hasRole Finance Director

---

## Email 5: Weekly Summary

**Subject:** Weekly Team Summary - October 25

**From:** mike.wilson@acmecorp.com
**To:** team@acmecorp.com
**Date:** October 25, 2024

```
Hi everyone,

Here's your weekly summary from Mike Wilson at Acme Corp.

Team Updates:
- John led the Q4 Release planning session
- Sarah completed the UX mockups for the new dashboard
- Alex finished the Kubernetes cluster setup
- Lisa finalized the Q4 budget allocations

Upcoming:
- Monday: John Smith and Sarah Chen presenting at the Board Meeting
- Wednesday: Mike Wilson running QA training session
- Friday: Alex Rodriguez demo of new infrastructure

Recognition:
John Smith was nominated for the Innovation Award for his work on Q4 Release.
Sarah and Mike received kudos for exceptional collaboration.

Have a great weekend!

Mike Wilson
QA Lead
Acme Corp
```

**Expected Entities:**
- Mike Wilson (Person) - confidence: 0.95
- Acme Corp (Organization) - confidence: 0.95
- John Smith / John (Person) - confidence: 0.95
- Sarah Chen / Sarah (Person) - confidence: 0.90
- Alex Rodriguez / Alex (Person) - confidence: 0.90
- Lisa Park / Lisa (Person) - confidence: 0.85
- Q4 Release (Project) - confidence: 0.90
- Board Meeting (Meeting) - confidence: 0.85
- QA Lead (Role) - confidence: 0.90
- Innovation Award (Entity) - confidence: 0.80

**Expected Relations:**
- Mike Wilson worksFor Acme Corp
- John Smith leadsProject Q4 Release
- Board Meeting attendedBy John Smith
- Board Meeting attendedBy Sarah Chen
- Mike Wilson hasRole QA Lead

**Entity Resolution Note:** Name variations like "John", "Sarah", "Alex", "Lisa" should
resolve to their full names from previous emails.

---

## Entity Resolution Expectations

After processing all 5 emails, entity resolution should produce:

| Canonical Entity | Aliases/Variations | Cluster Size |
|------------------|-------------------|--------------|
| John Smith | J. Smith, John | 3 |
| Sarah Chen | Sarah | 2 |
| Mike Wilson | Mike | 2 |
| Alex Rodriguez | Alex | 2 |
| Lisa Park | Lisa | 2 |
| Acme Corp | Acme Corporation | 1 |
| Q4 Release | Q4 Release project | 1 |
| Budget Review | Budget Review project | 1 |

**Resolution Statistics:**
- Original entities: ~35
- Resolved entities: ~25
- Clusters: ~10
- SameAs links: ~10

---

## Query Test Cases

### Query 1: Person Lookup
**Query:** "Who works at Acme Corp?"
**Expected:** John Smith, Sarah Chen, Mike Wilson, Alex Rodriguez, Lisa Park
**Hops:** 1

### Query 2: Project Relationships
**Query:** "What projects is John Smith working on?"
**Expected:** Q4 Release (as leader), related entities
**Hops:** 2

### Query 3: Meeting Context
**Query:** "What was discussed in the Tech Review Meeting?"
**Expected:** Q4 Release, architecture decisions, related people
**Hops:** 2

### Query 4: Timeline Query
**Query:** "What are the upcoming deadlines?"
**Expected:** December 15 (Q4 Release), November 30 (Budget Review)
**Hops:** 1

### Query 5: Cross-Project Query
**Query:** "How are the Q4 Release and Budget Review projects connected?"
**Expected:** Entities involved in both, shared attendees
**Hops:** 3
