---
description: "Wait for incoming messages from other agents.This command blocks until a message is received. - Usage: /await-mailbox <your-name>"
argument-hint: [your-name]
allowed-tools: Bash(.claude/scripts/await-mailbox.sh:*)
---

!`.claude/scripts/await-mailbox.sh $ARGUMENTS`

**Your agent name is: $1**

Above you find the last message you have received. Answer it by running /request $1 <to-name> "My properly escaped message", then run `.claude/scripts/await-mailbox.sh <your-name> again manually to wait for the next messages. It is imperative you do this last step to avoid losing messages.

You are highly encouraged to partake in parallel task and decision making. Keep all your messages brief, serious, and high value to noise signal to avoid context pollution. You may spin up your own agents via the Task tool, and instructing them to open up mailboxes with a name you assign to them. Names should be formatted as "Name-Role".
