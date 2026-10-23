/**
 * Declared vs operational hierarchy.
 *
 * - **Declared**: `ReportsTo` / `Membership` claims whose support is what the
 *   organization said about itself (directory exports, signature titles).
 * - **Operational**: derived assessments over attributed communication events
 *   (who grants approval to whom, who escalates to whom). Never facts: each
 *   carries its producer, supporting events, and custodian coverage.
 *
 * Measured reality (see PARTY-DATA-MODEL.md §Research): on Enron, degree
 * centrality picks the senior member of an already-related pair ~84% of the
 * time and that figure is inflated by custodian selection; on a ~200k-person
 * company, tree reconstruction did not beat a spanning-tree baseline. So the
 * operational side produces **leads** (divergences), not an org chart.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Graph from "effect/Graph";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import type { SpeechAct } from "./Communication.ts";
import { ActivityId, AssessmentId, EventId, PartyId } from "./Ids.ts";
import { thunkFalse, thunkUndefined } from "@beep/utils";

const $I = $ScratchpadId.create("party/Hierarchy");

/**
 * An event after attribution: author and recipients resolved to party
 * representatives under one projection scope. `author` is `None` when the
 * voice has no admitted author (shared mailbox, unresolved delegate).
 *
 * @category hierarchy
 * @since 0.0.0
 */
export interface AttributedEvent {
  readonly event: EventId;
  readonly author: O.Option<PartyId>;
  readonly to: ReadonlyArray<PartyId>;
  readonly cc: ReadonlyArray<PartyId>;
  readonly acts: ReadonlyArray<SpeechAct>;
}

/**
 * Whether a party's own mailbox was collected. Operational signals about
 * uncollected parties are partly artifacts of who the producer chose to collect.
 *
 * @category hierarchy
 * @since 0.0.0
 */
export const Coverage = LiteralKit(["collected-custodian", "appears-only"]).pipe(
  $I.annoteSchema("Coverage", { description: "Whether a party's mailbox was collected." })
);
export type Coverage = typeof Coverage.Type;

/**
 * A derived operational assessment.
 *
 * @category hierarchy
 * @since 0.0.0
 */
export const OperationalAssessment = S.Struct({
  id: AssessmentId,
  relation: LiteralKit(["approves-for", "escalates-to"]),
  actor: PartyId,
  counterparty: PartyId,
  supportingEvents: S.NonEmptyArray(EventId),
  producedBy: ActivityId,
  actorCoverage: Coverage,
  counterpartyCoverage: Coverage,
}).pipe($I.annoteSchema("OperationalAssessment", { description: "Derived operational-hierarchy signal." }));
export type OperationalAssessment = typeof OperationalAssessment.Type;

/**
 * A divergence between declared and operational hierarchy: an investigative
 * lead with its evidence, never a finding.
 *
 * @category hierarchy
 * @since 0.0.0
 */
export const Divergence = S.TaggedUnion({
  /** Declared subordinate grants approval to someone above them in their declared chain. */
  InvertedAuthority: {
    declaredSubordinate: PartyId,
    declaredSuperior: PartyId,
    evidence: S.NonEmptyArray(AssessmentId),
  },
  /** Approves for several people yet has no declared reports. */
  ShadowGate: {
    party: PartyId,
    approvesFor: S.NonEmptyArray(PartyId),
    evidence: S.NonEmptyArray(AssessmentId),
  },
  /** Declared manager never approves for a report who does get approvals elsewhere. */
  PhantomManager: {
    declaredSuperior: PartyId,
    declaredSubordinate: PartyId,
    approvedInsteadBy: S.NonEmptyArray(PartyId),
  },
  /** Declared manager of several people whose own mailbox was not collected. */
  CoverageGap: { party: PartyId, declaredReports: S.Int },
}).pipe($I.annoteSchema("Divergence", { description: "Declared vs operational lead." }));
export type Divergence = typeof Divergence.Type;

/**
 * Deterministic assessor: `grants-approval` authored by X to Y yields
 * `approves-for(X, Y)`; `escalates` authored by X to Y yields
 * `escalates-to(X, Y)`. Events with no admitted author contribute nothing.
 *
 * @category hierarchy
 * @since 0.0.0
 */
export const assessOperational = ({
  events,
  producedBy,
  custodians,
}: {
  readonly events: ReadonlyArray<AttributedEvent>;
  readonly producedBy: ActivityId;
  readonly custodians: HashSet.HashSet<PartyId>;
}): ReadonlyArray<OperationalAssessment> => {
  const acc = MutableHashMap.empty<string, { relation: "approves-for" | "escalates-to"; actor: PartyId; counterparty: PartyId; first: EventId; rest: ReadonlyArray<EventId> }>();
  const add = (relation: "approves-for" | "escalates-to", actor: PartyId, counterparty: PartyId, event: EventId) => {
    if (actor === counterparty) return;
    const key = `${relation}|${actor}|${counterparty}`;
    O.match(MutableHashMap.get(acc, key), {
      onNone: () => MutableHashMap.set(acc, key, { relation, actor, counterparty, first: event, rest: [] }),
      onSome: (row) => {
        MutableHashMap.set(acc, key, { ...row, rest: A.append(row.rest, event) });
      },
    });
  };
  A.forEach(events, (e) =>
    O.match(e.author, {
      onNone: thunkUndefined,
      onSome: (author) => {
        if (A.contains(e.acts, "grants-approval")) A.forEach(e.to, (to) => add("approves-for", author, to, e.event));
        if (A.contains(e.acts, "escalates")) A.forEach(e.to, (to) => add("escalates-to", author, to, e.event));
      },
    })
  );
  const coverage = (p: PartyId): Coverage => (HashSet.has(custodians, p) ? "collected-custodian" : "appears-only");
  return pipe(
    acc,
    MutableHashMap.values,
    A.fromIterable,
    A.map(
      (row): OperationalAssessment => ({
        id: AssessmentId.make(`asmt:${row.relation}:${row.actor}->${row.counterparty}`),
        relation: row.relation,
        actor: row.actor,
        counterparty: row.counterparty,
        supportingEvents: [row.first, ...row.rest],
        producedBy,
        actorCoverage: coverage(row.actor),
        counterpartyCoverage: coverage(row.counterparty),
      })
    ),
    A.sort(Order.mapInput(Order.String, (a: OperationalAssessment) => a.id))
  );
};

/**
 * A declared reporting line, already admitted and resolved to representatives.
 *
 * @category hierarchy
 * @since 0.0.0
 */
export interface DeclaredLine {
  readonly subordinate: PartyId;
  readonly superior: PartyId;
}

/**
 * A party-keyed directed projection with a stable id → `NodeIndex` index.
 *
 * @category hierarchy
 * @since 0.0.0
 */
export interface PartyGraph<E> {
  readonly graph: Graph.DirectedGraph<PartyId, E>;
  readonly index: HashMap.HashMap<PartyId, Graph.NodeIndex>;
}

const partyGraph = <E>(
  edges: ReadonlyArray<{ readonly from: PartyId; readonly to: PartyId; readonly data: E }>
): PartyGraph<E> => {
  let index = HashMap.empty<PartyId, Graph.NodeIndex>();
  const graph = Graph.directed<PartyId, E>((g) => {
    const node = (p: PartyId) =>
      O.getOrElse(HashMap.get(index, p), () => {
        const i = Graph.addNode(g, p);
        index = HashMap.set(index, p, i);
        return i;
      });
    A.forEach(edges, (e) => {
      Graph.addEdge(g, node(e.from), node(e.to), e.data);
    });
  });
  return { graph, index };
};

/**
 * Declared hierarchy projection: subordinate → superior.
 *
 * @category hierarchy
 * @since 0.0.0
 */
export const declaredGraph = (declared: ReadonlyArray<DeclaredLine>): PartyGraph<"reports-to"> =>
  partyGraph(A.map(declared, (l) => ({ from: l.subordinate, to: l.superior, data: "reports-to" as const })));

/**
 * Operational approvals projection: approver → approved, one edge per
 * aggregated assessment (so out-degree = distinct people approved for).
 *
 * @category hierarchy
 * @since 0.0.0
 */
export const approvalsGraph = (operational: ReadonlyArray<OperationalAssessment>): PartyGraph<OperationalAssessment> =>
  partyGraph(
    A.flatMap(operational, (o) =>
      o.relation === "approves-for" ? [{ from: o.actor, to: o.counterparty, data: o }] : []
    )
  );

/**
 * Join declared lines with operational assessments into divergence leads.
 *
 * @category hierarchy
 * @since 0.0.0
 */
export const divergences = ({
  declared,
  operational,
  custodians,
  shadowGateMinimum,
}: {
  readonly declared: ReadonlyArray<DeclaredLine>;
  readonly operational: ReadonlyArray<OperationalAssessment>;
  readonly custodians: HashSet.HashSet<PartyId>;
  readonly shadowGateMinimum: number;
}): ReadonlyArray<Divergence> => {
  const chart = declaredGraph(declared);
  const approvals = approvalsGraph(operational);
  const approvalRows = A.filter(operational, (o) => o.relation === "approves-for");

  // approver is (transitively) below the person they approve for in the declared chart
  const isAbove = (actor: PartyId, target: PartyId) =>
    O.match(O.all([HashMap.get(chart.index, actor), HashMap.get(chart.index, target)]), {
      onNone: thunkFalse,
      onSome: ([a, t]) => Graph.hasPath(chart.graph, a, t, { direction: "outgoing" }),
    });

  const inverted = A.flatMap(approvalRows, (o) =>
    isAbove(o.actor, o.counterparty)
      ? [
          Divergence.cases.InvertedAuthority.make({
            declaredSubordinate: o.actor,
            declaredSuperior: o.counterparty,
            evidence: [o.id],
          }),
        ]
      : []
  );

  const hasReports = (p: PartyId) =>
    O.match(HashMap.get(chart.index, p), { onNone: thunkFalse, onSome: (i) => Graph.inDegree(chart.graph, i) > 0 });

  const shadow = pipe(
    approvals.index,
    HashMap.entries,
    A.fromIterable,
    A.flatMap(([actor, i]) => {
    const mine = A.filter(approvalRows, (o) => o.actor === actor);
    const targets = A.map(mine, (o) => o.counterparty);
    return Graph.outDegree(approvals.graph, i) >= shadowGateMinimum &&
      !hasReports(actor) &&
      A.isReadonlyArrayNonEmpty(targets) &&
      A.isReadonlyArrayNonEmpty(mine)
      ? [Divergence.cases.ShadowGate.make({ party: actor, approvesFor: targets, evidence: A.map(mine, (o) => o.id) })]
      : [];
    })
  );

  const phantom = A.flatMap(declared, (line) => {
    const others = A.dedupe(
      A.map(
        A.filter(approvalRows, (o) => o.counterparty === line.subordinate && o.actor !== line.superior),
        (o) => o.actor
      )
    );
    const superiorApproves = A.some(approvalRows, (o) => o.actor === line.superior && o.counterparty === line.subordinate);
    return !superiorApproves && A.isReadonlyArrayNonEmpty(others)
      ? [
          Divergence.cases.PhantomManager.make({
            declaredSuperior: line.superior,
            declaredSubordinate: line.subordinate,
            approvedInsteadBy: others,
          }),
        ]
      : [];
  });

  const gaps = pipe(
    chart.index,
    HashMap.entries,
    A.fromIterable,
    A.flatMap(([manager, i]) => {
    const reports = Graph.inDegree(chart.graph, i);
    return reports >= 2 && !HashSet.has(custodians, manager)
      ? [Divergence.cases.CoverageGap.make({ party: manager, declaredReports: reports })]
      : [];
    })
  );

  return [...inverted, ...shadow, ...phantom, ...gaps];
};
