import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import type { EnronThread } from "./schemas.js";

export const FINANCIAL_KEYWORDS = ["deal", "position", "risk", "compensation", "account", "portfolio"] as const;
export const ACTION_ITEM_KEYWORDS = ["please", "need", "deadline", "follow up", "action"] as const;

const FORWARDED_SUBJECT_PATTERNS = [/^fwd\s*:/i, /^fw\s*:/i] as const;
const FORWARDED_BODY_PATTERNS = [/^[-\s]*original message[-\s]*$/gim, /^begin forwarded message:/gim, /^forwarded by:/gim] as const;

export const THREAD_DIVERSITY_CATEGORIES = [
  "financial",
  "actionItems",
  "multiParty",
  "deepThread",
  "forwardedChain",
  "lengthDiversity",
] as const;

export type ThreadDiversityCategory = (typeof THREAD_DIVERSITY_CATEGORIES)[number];

export interface ThreadScoreWeights {
  readonly multiPartyParticipation: number;
  readonly threadDepth: number;
  readonly financialKeywords: number;
  readonly actionItems: number;
  readonly forwardedChains: number;
  readonly lengthDiversity: number;
}

export interface ThreadLengthDiversitySignal {
  readonly terseCount: number;
  readonly mediumCount: number;
  readonly substantialCount: number;
  readonly minLength: number;
  readonly maxLength: number;
  readonly averageLength: number;
}

export interface ThreadScoreFactorBreakdown {
  readonly score: number;
  readonly weight: number;
  readonly normalized: number;
}

export interface ThreadScoreBreakdown {
  readonly multiPartyParticipation: ThreadScoreFactorBreakdown & {
    readonly participantCount: number;
  };
  readonly threadDepth: ThreadScoreFactorBreakdown & {
    readonly messageCount: number;
    readonly depth: number;
    readonly estimatedDepth: number;
  };
  readonly financialKeywords: ThreadScoreFactorBreakdown & {
    readonly keywordHits: number;
  };
  readonly actionItems: ThreadScoreFactorBreakdown & {
    readonly keywordHits: number;
  };
  readonly forwardedChains: ThreadScoreFactorBreakdown & {
    readonly forwardedMessageCount: number;
  };
  readonly lengthDiversity: ThreadScoreFactorBreakdown & {
    readonly lengthSignal: ThreadLengthDiversitySignal;
  };
  readonly totalScore: number;
}

export interface ScoredEnronThread {
  readonly thread: EnronThread;
  readonly score: number;
  readonly breakdown: ThreadScoreBreakdown;
  readonly categories: ReadonlyArray<ThreadDiversityCategory>;
}

export interface ThreadScorerOptions {
  readonly weights?: ThreadScoreWeights;
}

export const DEFAULT_THREAD_SCORE_WEIGHTS: ThreadScoreWeights = {
  multiPartyParticipation: 20,
  threadDepth: 20,
  financialKeywords: 20,
  actionItems: 20,
  forwardedChains: 10,
  lengthDiversity: 10,
};

export class ThreadScoringError extends S.TaggedError<ThreadScoringError>()("ThreadScoringError", {
  message: S.String,
  cause: S.optional(S.String),
}) {}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const toFactorScore = (normalized: number, weight: number): number => Math.round(clamp01(normalized) * weight);

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const countKeywordHits = (messagesText: string, keywords: ReadonlyArray<string>): number => {
  let hits = 0;

  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "gi");
    const matches = messagesText.match(regex);
    hits += matches?.length ?? 0;
  }

  return hits;
};

const multiPartyNormalized = (participantCount: number): number => {
  if (participantCount >= 5) {
    return 1;
  }

  switch (participantCount) {
    case 4:
      return 0.9;
    case 3:
      return 0.7;
    case 2:
      return 0.4;
    default:
      return 0;
  }
};

const depthNormalized = (messageCount: number, depth: number, estimatedDepth: number): number => {
  const messageComponent = clamp01((messageCount - 1) / 4);
  const effectiveDepth = Math.max(depth, estimatedDepth);
  const depthComponent = clamp01((effectiveDepth - 1) / 4);
  const embeddedComponent = clamp01((estimatedDepth - 1) / 5);
  return clamp01(messageComponent * 0.5 + depthComponent * 0.35 + embeddedComponent * 0.15);
};

const keywordNormalized = (hits: number): number => clamp01(hits / 8);

const forwardedCount = (thread: EnronThread): number => {
  let forwardedMessages = 0;

  for (const message of thread.messages) {
    const subject = message.subject.trim();
    const hasForwardedSubject = FORWARDED_SUBJECT_PATTERNS.some((pattern) => pattern.test(subject));

    const hasForwardedBody = FORWARDED_BODY_PATTERNS.some((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(message.body);
    });

    if (hasForwardedSubject || hasForwardedBody) {
      forwardedMessages += 1;
    }
  }

  return forwardedMessages;
};

const computeLengthSignal = (thread: EnronThread): ThreadLengthDiversitySignal => {
  const lengths = thread.messages.map((message) => message.body.length);

  const terseCount = lengths.filter((length) => length <= 180).length;
  const substantialCount = lengths.filter((length) => length >= 1200).length;
  const mediumCount = lengths.length - terseCount - substantialCount;

  const minLength = lengths.length > 0 ? Math.min(...lengths) : 0;
  const maxLength = lengths.length > 0 ? Math.max(...lengths) : 0;
  const averageLength = lengths.length > 0 ? Math.round(lengths.reduce((sum, length) => sum + length, 0) / lengths.length) : 0;

  return {
    terseCount,
    mediumCount,
    substantialCount,
    minLength,
    maxLength,
    averageLength,
  };
};

const lengthDiversityNormalized = (signal: ThreadLengthDiversitySignal, messageCount: number): number => {
  const hasTerse = signal.terseCount > 0;
  const hasSubstantial = signal.substantialCount > 0;
  const hasMedium = signal.mediumCount > 0;

  if (hasTerse && hasSubstantial) {
    return 1;
  }

  if (messageCount >= 4 && ((hasTerse && hasMedium) || (hasMedium && hasSubstantial))) {
    return 0.6;
  }

  if (messageCount >= 3 && (hasTerse || hasSubstantial)) {
    return 0.3;
  }

  return 0;
};

const forwardedNormalized = (count: number): number => clamp01(count / 3);

const estimateEmbeddedDepthFromBody = (body: string): number => {
  const quoteDepthMatches = body.match(/^\s*>+/gm);
  const maxQuoteDepth =
    quoteDepthMatches?.reduce((currentMax, entry) => {
      const depth = entry.trimStart().length;
      return Math.max(currentMax, depth);
    }, 0) ?? 0;

  const forwardedMarkers =
    (body.match(/^[-\s]*original message[-\s]*$/gim)?.length ?? 0) +
    (body.match(/^begin forwarded message:/gim)?.length ?? 0) +
    (body.match(/^from:\s.+$/gim)?.length ?? 0) +
    (body.match(/^to:\s.+$/gim)?.length ?? 0);

  return 1 + maxQuoteDepth + Math.min(4, forwardedMarkers);
};

const categoriesFor = (
  participantCount: number,
  messageCount: number,
  depth: number,
  estimatedDepth: number,
  financialHits: number,
  actionHits: number,
  forwardedMessages: number,
  signal: ThreadLengthDiversitySignal
): ReadonlyArray<ThreadDiversityCategory> => {
  const categories: Array<ThreadDiversityCategory> = [];

  if (financialHits > 0) {
    categories.push("financial");
  }

  if (actionHits > 0) {
    categories.push("actionItems");
  }

  if (participantCount >= 3) {
    categories.push("multiParty");
  }

  if (messageCount >= 5 || depth >= 4 || estimatedDepth >= 4) {
    categories.push("deepThread");
  }

  if (forwardedMessages > 0) {
    categories.push("forwardedChain");
  }

  if (signal.terseCount > 0 && signal.substantialCount > 0) {
    categories.push("lengthDiversity");
  }

  return categories;
};

export const compareScoredThreads = (left: ScoredEnronThread, right: ScoredEnronThread): number => {
  if (left.score !== right.score) {
    return right.score - left.score;
  }

  if (left.thread.messages.length !== right.thread.messages.length) {
    return right.thread.messages.length - left.thread.messages.length;
  }

  if (left.thread.participants.length !== right.thread.participants.length) {
    return right.thread.participants.length - left.thread.participants.length;
  }

  const leftStart = left.thread.dateRange.start.getTime();
  const rightStart = right.thread.dateRange.start.getTime();
  if (leftStart !== rightStart) {
    return leftStart - rightStart;
  }

  return left.thread.threadId.localeCompare(right.thread.threadId);
};

export const scoreThread = (thread: EnronThread, options?: ThreadScorerOptions): ScoredEnronThread => {
  const weights = options?.weights ?? DEFAULT_THREAD_SCORE_WEIGHTS;

  const participantCount = thread.participants.length;
  const messageCount = thread.messages.length;
  const messagesText = thread.messages
    .map((message) => `${message.subject}\n${message.body}`)
    .join("\n")
    .toLowerCase();

  const financialHits = countKeywordHits(messagesText, FINANCIAL_KEYWORDS);
  const actionHits = countKeywordHits(messagesText, ACTION_ITEM_KEYWORDS);
  const forwardedMessages = forwardedCount(thread);
  const estimatedDepth = thread.messages.reduce(
    (currentMax, message) => Math.max(currentMax, estimateEmbeddedDepthFromBody(message.body)),
    1
  );
  const signal = computeLengthSignal(thread);

  const multiPartyNorm = multiPartyNormalized(participantCount);
  const depthNorm = depthNormalized(messageCount, thread.depth, estimatedDepth);
  const financialNorm = keywordNormalized(financialHits);
  const actionNorm = keywordNormalized(actionHits);
  const forwardedNorm = forwardedNormalized(forwardedMessages);
  const lengthNorm = lengthDiversityNormalized(signal, messageCount);

  const multiPartyScore = toFactorScore(multiPartyNorm, weights.multiPartyParticipation);
  const depthScore = toFactorScore(depthNorm, weights.threadDepth);
  const financialScore = toFactorScore(financialNorm, weights.financialKeywords);
  const actionScore = toFactorScore(actionNorm, weights.actionItems);
  const forwardedScore = toFactorScore(forwardedNorm, weights.forwardedChains);
  const lengthScore = toFactorScore(lengthNorm, weights.lengthDiversity);

  const totalScore = multiPartyScore + depthScore + financialScore + actionScore + forwardedScore + lengthScore;

  return {
    thread,
    score: totalScore,
    categories: categoriesFor(
      participantCount,
      messageCount,
      thread.depth,
      estimatedDepth,
      financialHits,
      actionHits,
      forwardedMessages,
      signal
    ),
    breakdown: {
      multiPartyParticipation: {
        participantCount,
        score: multiPartyScore,
        weight: weights.multiPartyParticipation,
        normalized: multiPartyNorm,
      },
      threadDepth: {
        messageCount,
        depth: thread.depth,
        estimatedDepth,
        score: depthScore,
        weight: weights.threadDepth,
        normalized: depthNorm,
      },
      financialKeywords: {
        keywordHits: financialHits,
        score: financialScore,
        weight: weights.financialKeywords,
        normalized: financialNorm,
      },
      actionItems: {
        keywordHits: actionHits,
        score: actionScore,
        weight: weights.actionItems,
        normalized: actionNorm,
      },
      forwardedChains: {
        forwardedMessageCount: forwardedMessages,
        score: forwardedScore,
        weight: weights.forwardedChains,
        normalized: forwardedNorm,
      },
      lengthDiversity: {
        lengthSignal: signal,
        score: lengthScore,
        weight: weights.lengthDiversity,
        normalized: lengthNorm,
      },
      totalScore,
    },
  };
};

export const scoreThreads = (threads: ReadonlyArray<EnronThread>, options?: ThreadScorerOptions): ReadonlyArray<ScoredEnronThread> =>
  [...threads].map((thread) => scoreThread(thread, options)).sort(compareScoredThreads);

export const scoreThreadsEffect = (
  threads: ReadonlyArray<EnronThread>,
  options?: ThreadScorerOptions
): Effect.Effect<ReadonlyArray<ScoredEnronThread>, ThreadScoringError> =>
  Effect.try({
    try: () => scoreThreads(threads, options),
    catch: (cause) =>
      new ThreadScoringError({
        message: "Failed to score Enron threads",
        cause: String(cause),
      }),
  });
