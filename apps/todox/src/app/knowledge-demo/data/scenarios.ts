import * as A from "effect/Array";
import * as Order from "effect/Order";
import type { CuratedScenario } from "../types";

const BY_SCENARIO_ID = Order.mapInput(Order.string, (scenario: CuratedScenario) => scenario.id);

const SCENARIOS: readonly CuratedScenario[] = [
  {
    id: "scenario-1",
    useCase: "pre-meeting agenda/follow-up",
    sourceThreadId: "thread:0165d42d23bd3160dc51506605284d346b77b78d7125a07bbf64702a1031007a",
    sourceDocumentId: "email:0165d42d23bd3160dc51506605284d346b77b78d7125a07bbf64702a1031007a",
    sourceTitle: "Re: Senator Joe Dunn's Conference Call",
    querySeed: "Conference Call",
    categories: ["actionItems", "multiParty", "deepThread"],
    participants: 4,
    messageCount: 1,
    depth: 1,
    rationale: "Contains explicit scheduling and follow-up asks for a conference call.",
  },
  {
    id: "scenario-2",
    useCase: "deal/financial discussion",
    sourceThreadId: "thread:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88",
    sourceDocumentId: "email:01057690d799a3216f93b55a87c94f97789dadd068cd75419633e3bb6b67bf88",
    sourceTitle: "Re: Duke Exchange Deal",
    querySeed: "Duke Exchange Deal",
    categories: ["financial", "actionItems", "deepThread"],
    participants: 2,
    messageCount: 1,
    depth: 1,
    rationale: "Captures deal references and settlement amounts in a financial workflow.",
  },
  {
    id: "scenario-3",
    useCase: "org-role/ownership change",
    sourceThreadId: "thread:0114fd6d05c0cc72f07005dc26380296a2c2ae5aee69a6d2ac65423369568d42",
    sourceDocumentId: "email:0114fd6d05c0cc72f07005dc26380296a2c2ae5aee69a6d2ac65423369568d42",
    sourceTitle: "Re: Re2: SCE Legislative Language",
    querySeed: "Rod Wright",
    categories: ["financial", "actionItems", "multiParty", "deepThread"],
    participants: 19,
    messageCount: 1,
    depth: 1,
    rationale: "Discusses shifting political ownership and decision authority.",
  },
  {
    id: "scenario-4",
    useCase: "multi-party negotiation/action tracking",
    sourceThreadId: "thread:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607",
    sourceDocumentId: "email:013a1df05285eaae779cb0b02d84300256134420d044190d10ad365e8d9b6607",
    sourceTitle: "Re: Fuel Supply Agreement",
    querySeed: "Fuel Supply Agreement",
    categories: ["actionItems", "multiParty", "deepThread"],
    participants: 4,
    messageCount: 1,
    depth: 1,
    rationale: "Tracks cross-party contract actions and sequencing dependencies.",
  },
];

export const CURATED_SCENARIOS: readonly CuratedScenario[] = A.sort(SCENARIOS, BY_SCENARIO_ID);
