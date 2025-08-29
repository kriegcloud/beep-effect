import type { $Schema, AlphaNode, Fact, Session } from "@beep/rete/network/types";
import { fireRules } from "../fire-rules";
import { getAlphaNodesForFact } from "../get-alpha-nodes-for-fact";
import { upsertFact } from "../upsert-fact";

export const insertFact = <T extends $Schema>(session: Session<T>, fact: Fact<T>) => {
  const nodes = new Set<AlphaNode<T>>();
  getAlphaNodesForFact(session, session.alphaNode, fact, true, nodes);
  upsertFact(session, fact, nodes);
  if (session.autoFire) {
    fireRules(session);
  }
};

export default insertFact;
