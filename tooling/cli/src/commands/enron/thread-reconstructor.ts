import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { makeDeterministicId } from "./parser.js";
import { type EnronEmail, EnronThread, EnronThreadDateRange } from "./schemas.js";

const byDateThenId = (left: EnronEmail, right: EnronEmail): number => {
  const dateDelta = left.date.getTime() - right.date.getTime();
  if (dateDelta !== 0) {
    return dateDelta;
  }
  return left.messageId.localeCompare(right.messageId);
};

const resolveParent = (email: EnronEmail, index: ReadonlyMap<string, EnronEmail>): string | undefined => {
  if (email.inReplyTo !== undefined && email.inReplyTo !== email.messageId && index.has(email.inReplyTo)) {
    return email.inReplyTo;
  }

  for (let cursor = email.references.length - 1; cursor >= 0; cursor -= 1) {
    const reference = email.references[cursor];
    if (reference !== undefined && reference !== email.messageId && index.has(reference)) {
      return reference;
    }
  }

  return undefined;
};

const rootForMessage = (messageId: string, parentByMessageId: ReadonlyMap<string, string | undefined>): string => {
  const visited = new Set<string>();
  let cursor = messageId;

  while (true) {
    if (visited.has(cursor)) {
      const stable = [...visited].sort((left, right) => left.localeCompare(right));
      return stable[0] ?? messageId;
    }

    visited.add(cursor);
    const parent = parentByMessageId.get(cursor);
    if (parent === undefined) {
      return cursor;
    }

    cursor = parent;
  }
};

const computeParticipants = (messages: ReadonlyArray<EnronEmail>): ReadonlyArray<string> => {
  const values = messages.flatMap((message) => [message.from, ...message.to, ...message.cc, ...message.bcc]);
  return A.dedupe(values.map((value) => value.trim().toLowerCase()).filter((value) => value.length > 0));
};

const computeDateRange = (messages: ReadonlyArray<EnronEmail>): EnronThreadDateRange => {
  const timestamps = messages.map((message) => message.date.getTime());
  const sorted = [...timestamps].sort((left, right) => left - right);

  const start = new Date(sorted[0] ?? Date.now());
  const end = new Date(sorted[sorted.length - 1] ?? start.getTime());

  return new EnronThreadDateRange({ start, end });
};

const computeDepth = (
  messages: ReadonlyArray<EnronEmail>,
  parentByMessageId: ReadonlyMap<string, string | undefined>
): number => {
  const messageIds = new Set(messages.map((message) => message.messageId));
  const memo = new Map<string, number>();

  const depthOf = (messageId: string, active: ReadonlySet<string>): number => {
    const cached = memo.get(messageId);
    if (cached !== undefined) {
      return cached;
    }

    if (active.has(messageId)) {
      memo.set(messageId, 1);
      return 1;
    }

    const parent = parentByMessageId.get(messageId);
    if (parent === undefined || !messageIds.has(parent)) {
      memo.set(messageId, 1);
      return 1;
    }

    const next = new Set(active);
    next.add(messageId);
    const depth = depthOf(parent, next) + 1;
    memo.set(messageId, depth);
    return depth;
  };

  const allDepths = messages.map((message) => depthOf(message.messageId, new Set<string>()));
  return allDepths.reduce((current, value) => Math.max(current, value), 1);
};

export const reconstructThreads = (emails: ReadonlyArray<EnronEmail>): ReadonlyArray<EnronThread> => {
  if (emails.length === 0) {
    return A.empty<EnronThread>();
  }

  const index = new Map<string, EnronEmail>();
  for (const email of emails) {
    index.set(email.messageId, email);
  }

  const parentByMessageId = new Map<string, string | undefined>();
  for (const email of emails) {
    parentByMessageId.set(email.messageId, resolveParent(email, index));
  }

  const grouped = new Map<string, Array<EnronEmail>>();
  for (const email of emails) {
    const rootId = rootForMessage(email.messageId, parentByMessageId);
    const current = grouped.get(rootId);
    if (current === undefined) {
      grouped.set(rootId, [email]);
    } else {
      current.push(email);
    }
  }

  const threads = [...grouped.entries()].map(([rootMessageId, messageGroup]) => {
    const sortedMessages = [...messageGroup].sort(byDateThenId);
    const participants = computeParticipants(sortedMessages);
    const dateRange = computeDateRange(sortedMessages);
    const depth = computeDepth(sortedMessages, parentByMessageId);

    return new EnronThread({
      threadId: makeDeterministicId("thread", rootMessageId),
      messages: sortedMessages,
      participants,
      depth,
      dateRange,
    });
  });

  return threads.sort((left, right) => left.dateRange.start.getTime() - right.dateRange.start.getTime());
};

export const reconstructThreadsEffect = (
  emails: ReadonlyArray<EnronEmail>
): Effect.Effect<ReadonlyArray<EnronThread>> => Effect.succeed(reconstructThreads(emails));
