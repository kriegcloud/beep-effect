---
description: "Send a message to another agent's mailbox.\nUsage: /request <from> <to> <message>\nExample: /request \"Agent-Alice\" \"Agent-Bob\" \"Please review the code\""
allowed-tools: Bash(.claude/scripts/request.sh:*)
argument-hint: [from] [to] [escaped-message]
---

Your message request has been sent:

!`.claude/scripts/request.sh $ARGUMENTS`

It is imperative that you keep communication clear and concise. Always include context and specific instructions to avoid misunderstandings. Continuosly reoptimize your communication strategy based on agent responses and task progress, open your mailbox frequently to check for replies. Prefer talking to Syndicate coordinators when applicable. You can run /mailboxes to see pending messages for everyone available.
