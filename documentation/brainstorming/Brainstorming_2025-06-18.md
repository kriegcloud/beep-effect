# (2025-06-18) Brainstorming

Mission / Vision:

- AI is up and coming as we have all heard. It brings both a sense of fear as well as excitement for the capabilities of such an intelligence.
- Our view is that AI will be a prominent player in the future of the workplace across many industries. In financial services, there are many opportunities to streamline and delegate work to an AI that would help employees and businesses become ultimately more effective.
- Do I believe that by creating such a software as TodoX that there is a chance I wipe out my entire career? No. There is an innate need of humans to desire connection which is established through building trust in a relationship over time. In other terms, there is no way to substitute the relationship aspect of many careers/roles and AI is certainly not yet in a place to handle all the nuances of a clients world on its own. For many, there is a skepticism around AI that will keep the demand for human workers. AI should be harnessed as a tool for leveraging businesses and allowing employees to spend time on the things that matter, driving innovation in their companies and higher quality work when the more mundane items are handled by AI.

List of software used:

- Front
- Slack
- google Suite
- Microsoft suite
- Elements / Salesforce
- Bloomberg/Wallstreet journal subscriptions? Yahoo/Marketwatch
- Zoom
- Box
- Black Diamond
- Kwanti
- TValue
- Custodian Sites (this we would not be able to access for security right?)

Questions:

- What if AI got a hold of a password and tried to do something like move money? How would we make sure these things CANT happen if we are letting AI in this space.
- How do we ensure it is using good information if we are asking it a question that uses outside data
- How do we get around the issue of prompting? A lot of older people and even younger do not know how to prompt and get the best response. Older folks will probably have a harder time using it. How do we also educate on this.

Other Thoughts:

- We would have the AI take in a structure chart / roles and responsibilities to better help the employee at hand. It would need the client list to determine who is on what relationships.
    - (BEN): This could come from a companies HR management application(s) as well as our own internal representation which the user can modify
- Need to teach it naming convention for shared drives if it is saving to Box; give it the marketing / team values, etc
    - (BEN): Domain knowledge base from google docs or elseware. We can also let the user add custom rules, system, prompts and upload documents relevant to their conventions
- For deliverables (email drafts, ppts, etc) —> it should be able to detect your tone and write like you.
- Meeting notes / memorializing; easy place to write thoughts while staying organized
- transition to ClickUp was painful and no one did it even —> it needs to be easy. Not sure if tasks should all live within the main page or if the tasks should just be outsourced into Elements, but you have a working space in your Vault that is more user friendly. But this way management can use Elements to run reports still on client workload etc. Or maybe we don’t use elements for all the personal day to day tasks and we run these reports from Vault. We would have to be able to import tasks already set up in Elements.
- Operations / CFO team - need to think about how this would be of assistance to them
- It should understand the capital call process. Can it go into portals and pull statements / save to box? That would be huge.
    - How can it help in cap call process
    - **Calendaring T-Bills**
- Need to determine what is actionable vs not in emails/slack etc. Also if something is mentioned twice and is referring to same task, we don’t want duplicates or it will get cluttered
- If multiple people are on a task or an advisor or someone wants to oversee, how can they check that easily
- Name for our chat bot?
- Calendar on home page for upcoming meetings and can scan inbox / to dos and have what is needed for that meeting all together
- Collaboration amongst team members on the relationship. For example we have a client meeting with Jane Doe, it shows up on all our calendars and I can see everything that is needed for that meeting based on email exchanges / tasking / notes etc. It would aggregate all the sources of asks for that meeting so you can run through and make sure everything is accounted for.
- Collaboration with team members for internal check-ins. I ask the chat bot “I have a meeting with XYZ advisor to go over our shared clients, can you make an agenda for us?” and you can even feed it a style or organization that you like (we already have a good sort of memo we use but the pain is updating it). “we want to go by client and then what is top priority vs parking lot items / follow ups”
- A way to notify for trades that come in throughout the day or urgent money movements
- AI could suggest action to take based on your to-dos
- Summarize button on emails (like front)
- A lot of times we have to send things out for siganture to get a money movement and so we will send a separate email relating to the money movemement giving the signer a heads up. It would be nice to have that be tracked so we can know on one email thread (where a bulk of the chat is happening) what the status is of the signature / have it automatically link it
- When a bill passes congress or something —> Able to parse through and actually know what is true or not and where things stand currently. & what it means for us as workers
- Recurring type emails - tax reports etc. We do this on schedule and it can at least use the previous quarter as a starting point to draft and add spots for all the data points. Another type example would be a summary of gifting and I upload to it an excel file and say summarize the 2025 gifting, ignore anything under $1K, etc.
- A way to have a client index of sorts so you can check and see the most recent address if they moved somewhere or like if the purchased a new car or got a new job and their salary etc. Things evolve and so knowing what was the most recent development is helpful
- A way to reconcile data and an email. In a sense it would be a first pass as a reviewer
- Memorable moments - we have a hard time tagging this stuff. It would be nice to make that easy

Design:

- depending on your roll. Lets say Advisor / WM / Analyst. You have a quick dashboard that gives you live market data that you can customize (Stock charts like in the news, BTC, etc) and some big headliners from subscriptions like wallstreet journal / bloomberg or free news (you can pick what you like) and look for quick search like “Crypto” and it pulls it in.  You also have a “watchlist” of stocks that you are monitoring for clients and then an alert that it sends you. You can subscribe it to a client if you click into it. These would almost be like widgets
    - AI to help in creating your customized space like notion (if you want)
- I am thinking white and more techy like ClickUp was
- Need to have a space for memos and meeting notes by client, need to be able to sort by client like with front tags
- **How do we want tasks to look when they are in the que? I hate seeing a bunch of things overdue since some there are not timelines on**
- ClickUp used to send emails for task reminders but we don’t want to add to the clutter
- AI assistant having log of conversations like in chat gpt
- RMD calcs and spreadsheets

Problem(s) we are trying to solve for:

1. Difficulty searching for information within an inbox/slack/front setting (also wastes time)
2. High volume of emails / tasks + coming in from multiple sources (email, slack, elements)
    1. be able to easily tag and organize plus identify what is a totally new thread, urgent etc
    2. step 1 would almost be to reconcile all emails and make sure they find their way into a client tag or would be put into an other bucket
        1. Would be cool if your tags from email just automatically popped over
3. Security of client information: Not being able to use Chat GPT with client sensitive info for any adhoc request. Be able to upload documents into it
4. Disorganization around task management
5. Visibility on workloads across employees for better distribution of work
6. Time wasted on tasks that can and should be automated
    1. Starting email drafts
    2. sub docs
    3. saving to Box / onedrive
    4. insurance reviews / inventories / organization
    5. CFO/Staff accountants logging hours. Can it just know when you are working on something specific?
    6. Statements into excel / a-tables

Problems we are *not* trying to solve for (yet):

1. Having AI learn to do excel modeling by watching you. Essentially you are training your own AI worker. This would be more or the actual analyst work and we would want to be linking information from BlackDiamond/Kwanti/Excel/PPT as well as the rest of the softwares.
2. Automating portfolio management. A-tables, TLH, cash checks.
3. Onboarding workflow automation
4. Staff accountants - making a software that reconciles transactions. Staff accountant drops in statements and it works with Xero in tying everything out and the CRM/Staff would just tab through and approve. The AI would have a built in reconciliation.

**Problem 1: Difficulty searching for information within an inbox/slack/front setting**

1. Solution: Using AI to ask questions related to information in your inbox / slack / Box / Elements
    1. Phase I: Inbox / Slack
    2. Phase II: Elements / Box
    3. Benefit: Time is wasted constantly with questions from teammates / advisors where you need to go back and dig through your emails or slack to figure out the answer. Emails in general are hard to search in with whatever algorithm they use
    4. Details: You ask AI a question, maybe the default is to look through your inbox and front, but you can also have it select slack (phase II select Box etc) or a combo of them. It will then give you the quick answer and also have a link to where it found that information. It would be able to use the context of the workspaces to help find the appropriate answer. It would need to know what is the most up to date info if there are multiple answers to the question or things have evolved over time. This happens a lot where the plan changes. 
    5. Scenario 1: Mitch tags me on a thread for a client and has a question if we ever got the carryforward loss number from the CPAs. I have to somehow be able to click it directly and like just press a button thats like “Ask AI” and it goes and looks and gives me the short answer and also a link to where it found it.
        1. For design: would we want Front to basically live within this software so you can easily integrate? In the spirit of making things more efficient, it would be better this way if you could limit having to copy/paste into the chat, plus it would be able to reference the thread for context and I think give you better results. In front you can highlight parts of an email and comment and it links to that part of the email, but what if you could do that with “ask AI”.
        2. Also for design: we don’t want other people using it to interfere or make other peoples workplaces more cluttered 

Be able to switch between models (Grock, Chat GPT) - it costs the same amount

It would be great to have this build out an Index

2/2/26

Meeting OS (primary focus is meetings so you can easily prepare and create tasks)

That’s cool. it seems like each of these startups are taking it one step further.
I still feel like all these cos are thinking too small
Maybe they need to take it one step at a time but meetings seems to be the primary focus
My thought is that advisors/associates should have a dashboard that uses meetings, emails, tasks, live data, and tells you what to do when you sign in each morning
so as you have a meeting it captures notes set tasks marks off the agenda in real time, reminds you to ask certain thing, gives you answers when the client asks what was my net worth year over year
And then when you log in it says hey Phil here’s your top 5 things to do today - you said you would send Jack this report by Friday, there is tax lot harvesting opportunity for these clients and these positions, respond to hirshberg email
one step further a bot then helps do the work lol
i think we are screwed lol ai is going to take our jobs

Look into Claude bot, lobster icon. They got sued and changed it to open Claude. they are agents that you can set up on a separate computer and create a login and train it to do stuff.

Advisors should have this data as well as the daily stuff

- Hi Phil, here are the things you need to do
- These clients that emailed you overnight you need to reply

Deploying agents

- Update files
- EP Index

https://day.ai/