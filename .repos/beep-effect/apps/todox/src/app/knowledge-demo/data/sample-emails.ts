export interface SampleEmail {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
}

export const SAMPLE_EMAILS = [
  {
    id: "email-1",
    subject: "Q4 Release Project Update",
    from: "john.smith@acmecorp.com",
    to: "team@acmecorp.com",
    date: "October 15, 2024",
    body: `Hi Team,

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
Acme Corp`,
  },
  {
    id: "email-2",
    subject: "Project Sync: Q4 Release Status",
    from: "sarah.chen@acmecorp.com",
    to: "john.smith@acmecorp.com, mike.wilson@acmecorp.com",
    date: "October 18, 2024",
    body: `Hi John and Mike,

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
Acme Corp`,
  },
  {
    id: "email-3",
    subject: "Tech Review: Q4 Architecture Decisions",
    from: "john.smith@acmecorp.com",
    to: "engineering@acmecorp.com",
    date: "October 20, 2024",
    body: `Team,

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

- J. Smith`,
  },
  {
    id: "email-4",
    subject: "Budget Review for Q4 Initiatives",
    from: "lisa.park@acmecorp.com",
    to: "leadership@acmecorp.com",
    date: "October 22, 2024",
    body: `Dear Leadership Team,

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
Acme Corp`,
  },
  {
    id: "email-5",
    subject: "Weekly Team Summary - October 25",
    from: "mike.wilson@acmecorp.com",
    to: "team@acmecorp.com",
    date: "October 25, 2024",
    body: `Hi everyone,

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
Acme Corp`,
  },
] as const satisfies readonly SampleEmail[];
