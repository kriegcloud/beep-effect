/**
 * Retrieval packet shaping with dedupe and bounded payload controls.
 *
 * @since 0.0.0
 * @module
 */

/**
 * Result of packet shaping for corrective guidance facts.
 *
 * @since 0.0.0
 * @category models
 */
export interface RetrievalPacket {
  readonly facts: ReadonlyArray<string>;
  readonly totalChars: number;
}

/**
 * Build a deduplicated bounded retrieval packet.
 *
 * @since 0.0.0
 * @category functions
 */
export const buildRetrievalPacket = (
  inputFacts: ReadonlyArray<string>,
  maxFacts: number,
  maxChars: number
): RetrievalPacket => {
  const deduped: Array<string> = [];
  for (const fact of inputFacts) {
    if (!deduped.includes(fact)) {
      deduped.push(fact);
    }
  }

  const countLimited = deduped.slice(0, maxFacts);

  const facts: Array<string> = [];
  let totalChars = 0;
  for (const fact of countLimited) {
    const nextChars = totalChars + fact.length;
    if (nextChars > maxChars) {
      break;
    }
    facts.push(fact);
    totalChars = nextChars;
  }

  return {
    facts,
    totalChars,
  };
};
