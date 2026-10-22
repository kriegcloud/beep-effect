/**
 * Purpose-specific projections, rebuilt from the ledger for one scope.
 *
 * A projection is parameterized by knowledge time (`asOf`), world time
 * (`validAt`), and the review states it may read. `effect/Graph` node indexes
 * exist only inside one build; every edge carries the claim-version or event
 * id that justifies it, so any line on a chart expands back to evidence.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Graph from "effect/Graph";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Result from "effect/Result";
import type { ClaimVersion, ReviewTag } from "./Claim.ts";
import { versionsAt } from "./Claim.ts";
import type { CommunicationEvent, Observation } from "./Communication.ts";
import { voiceOf } from "./Communication.ts";
import type { AttributedEvent, DeclaredLine } from "./Hierarchy.ts";
import type {
  ClaimVersionId,
  EventId,
  IdentifierId,
  PartyId,
  VoiceId,
} from "./Ids.ts";
import { resolveParties } from "./Resolution.ts";
import type { UtcInstant } from "./Time.ts";
import {
  thunkEmptyArray,
  thunkEmptyReadonlyArray,
  thunkUndefined,
} from "@beep/utils";
import { Proposition } from "./Proposition.ts";

/**
 * Scope of one projection build.
 *
 * @category projection
 * @since 0.0.0
 */
export interface ProjectionScope {
  readonly asOf: UtcInstant;
  readonly validAt: UtcInstant;
  readonly states: ReadonlyArray<ReviewTag>;
}

/**
 * Identity view at a scope: representative resolution plus identifier→party
 * and voice→author maps built only from in-scope claim versions.
 *
 * @category projection
 * @since 0.0.0
 */
export interface IdentityView {
  readonly representative: (p: PartyId) => PartyId;
  readonly partyOfIdentifier: HashMap.HashMap<IdentifierId, PartyId>;
  readonly authorOfVoice: HashMap.HashMap<VoiceId, PartyId>;
  readonly vetoed: ReturnType<typeof resolveParties>["vetoed"];
}

/**
 * Build the identity view. An identifier attributed to more than one party in
 * scope (a shared mailbox) maps to none: ambiguity is not resolved by picking.
 *
 * @category projection
 * @since 0.0.0
 */
export const identityView = (
  {
    ledger,
    scope,
  }: {
    readonly ledger: ReadonlyArray<ClaimVersion>;
    readonly scope: ProjectionScope;
  }): IdentityView => {
  const inScope = versionsAt(ledger, scope);
  const resolved = resolveParties(inScope);
  const unique = <K>(pairs: ReadonlyArray<readonly [K, PartyId]>): HashMap.HashMap<K, PartyId> => {
    const grouped = A.reduce(pairs, HashMap.empty<K, ReadonlyArray<PartyId>>(), (m, [k, p]) =>
      HashMap.set(m, k, A.dedupe([...O.getOrElse(HashMap.get(m, k), thunkEmptyArray()), resolved.representative(p)])),
    );
    return HashMap.filterMap(grouped, (ps) =>
      A.matchLeft(ps, {
        onEmpty: () => Result.failVoid,
        onNonEmpty: (only, rest) => (A.isReadonlyArrayEmpty(rest) ? Result.succeed(only) : Result.failVoid),
      }),
    );
  };
  return {
    representative: resolved.representative,
    vetoed: resolved.vetoed,
    partyOfIdentifier: unique(
      A.flatMap(inScope, (v) =>
        v.proposition._tag === "IdentifierOf" && v.proposition.relation !== "represents"
          ? [[v.proposition.identifier, v.proposition.party] as const]
          : [],
      ),
    ),
    authorOfVoice: unique(
      A.flatMap(inScope, (v) =>
        Proposition.guards.VoiceAuthor(v.proposition)
          ? [[v.proposition.voice, v.proposition.author] as const]
          : [],
      ),
    ),
  };
};

/**
 * Attribute events under an identity view. Authorship comes only from an
 * admitted `VoiceAuthor`; the `from` header alone never names an author.
 *
 * @category projection
 * @since 0.0.0
 */
export const attributeEvents = (
  {
    events,
    observations,
    view,
  }: {
    readonly events: ReadonlyArray<CommunicationEvent>;
    readonly observations: ReadonlyArray<Observation>;
    readonly view: IdentityView;
  }): ReadonlyArray<AttributedEvent> =>
  A.map(events, (event) => {
    const parties = (role: "to" | "cc") =>
      A.dedupe(
        A.flatMap(event.participants, (p) =>
          p.role === role ? O.toArray(HashMap.get(view.partyOfIdentifier, p.identifier)) : [],
        ),
      );
    return {
      event: event.id,
      author: HashMap.get(view.authorOfVoice, voiceOf(event).id),
      to: parties("to"),
      cc: parties("cc"),
      acts: A.flatMap(observations, (o) => (o._tag === "SpeechActLabel" && o.event === event.id ? [o.act] : [])),
    };
  });

/**
 * Declared reporting lines in scope, resolved to representatives.
 *
 * @category projection
 * @since 0.0.0
 */
export const declaredLines = (
  {
    ledger,
    scope,
    view,
  }: {
    readonly ledger: ReadonlyArray<ClaimVersion>;
    readonly scope: ProjectionScope;
    readonly view: IdentityView;
  }): ReadonlyArray<DeclaredLine> =>
  A.flatMap(versionsAt(ledger, scope), (v) =>
    Proposition.guards.ReportsTo(v.proposition)
      ? [{
        subordinate: view.representative(v.proposition.subordinate),
        superior: view.representative(v.proposition.superior),
      }]
      : [],
  );

/**
 * Org-chart projection node and edge payloads.
 *
 * @category projection
 * @since 0.0.0
 */
export type OrgNode = { readonly party: PartyId };
export type OrgEdge = {
  readonly relation: "reports-to" | "member-of";
  readonly claimVersion: ClaimVersionId
};

/**
 * Build the declared org graph (subordinate → superior, member → org).
 *
 * @category projection
 * @since 0.0.0
 */
export const orgGraph = ({
                           ledger,
                           scope,
                           view,
                         }: {
  readonly ledger: ReadonlyArray<ClaimVersion>;
  readonly scope: ProjectionScope;
  readonly view: IdentityView;
}) => {
  let index = HashMap.empty<PartyId, Graph.NodeIndex>();
  const graph = Graph.directed<OrgNode, OrgEdge>((g) => {
    const node = (p: PartyId): Graph.NodeIndex =>
      O.getOrElse(HashMap.get(index, p), () => {
        const i = Graph.addNode(g, { party: p });
        index = HashMap.set(index, p, i);
        return i;
      });
    A.forEach(versionsAt(ledger, scope), (v) => {
      if (v.proposition._tag === "ReportsTo") {
        const edge: OrgEdge = { relation: "reports-to", claimVersion: v.id };
        Graph.addEdge(g, node(view.representative(v.proposition.subordinate)), node(view.representative(v.proposition.superior)), edge);
      } else if (v.proposition._tag === "Membership") {
        const edge: OrgEdge = { relation: "member-of", claimVersion: v.id };
        Graph.addEdge(g, node(view.representative(v.proposition.member)), node(view.representative(v.proposition.organization)), edge);
      }
    });
  });
  return { graph, index };
};

/**
 * The reports-to projection of an org graph (membership edges removed).
 *
 * @category projection
 * @since 0.0.0
 */
export const reportingGraph = (org: ReturnType<typeof orgGraph>) =>
  Graph.mutate(org.graph, (g) => {
    Graph.filterEdges(g, (e) => e.relation === "reports-to");
  });

/**
 * Chain of command upward from a party: a depth-first walk of the reports-to
 * projection. With one declared superior per party this is the chain itself.
 *
 * @category projection
 * @since 0.0.0
 */
export const chainOfCommand = ({
                                 org,
                                 party,
                               }: {
  readonly org: ReturnType<typeof orgGraph>;
  readonly party: PartyId;
}): ReadonlyArray<PartyId> =>
  O.match(HashMap.get(org.index, party), {
    onNone: thunkEmptyReadonlyArray<PartyId>(),
    onSome: (start) =>
      pipe(
        Graph.dfs(reportingGraph(org), {
          start: [start],
          direction: "outgoing",
        }),
        Graph.values,
        A.fromIterable,
        A.drop(1),
        A.map((n) => n.party),
      ),
  });

/**
 * A cycle in declared reporting lines ("A reports to B reports to A") is a
 * contradiction between sources, surfaced as data rather than silently broken.
 *
 * @category projection
 * @since 0.0.0
 */
export const declaredHierarchyCycle = (org: ReturnType<typeof orgGraph>): O.Option<ReadonlyArray<PartyId>> => {
  const reporting = reportingGraph(org);
  return O.map(Graph.findCycle(reporting), (cycle) =>
    A.flatMap(cycle.path, (i) => O.toArray(O.map(Graph.getNode(reporting, i), (n) => n.party))),
  );
};

/**
 * Mermaid rendering of an org projection, for review documents.
 *
 * @category projection
 * @since 0.0.0
 */
export const orgMermaid = ({
                             org,
                             label,
                           }: {
  readonly org: ReturnType<typeof orgGraph>;
  readonly label: (p: PartyId) => string;
}): string => Graph.toMermaid(org.graph, {
  nodeLabel: (n) => label(n.party),
  edgeLabel: (e) => e.relation,
});

/**
 * Selector graph: identifiers as nodes, one edge per (event, from → recipient).
 * Traversal here is selector traversal, never "who knows whom".
 *
 * @category projection
 * @since 0.0.0
 */
export const selectorGraph = (events: ReadonlyArray<CommunicationEvent>) => {
  let index = HashMap.empty<IdentifierId, Graph.NodeIndex>();
  const graph = Graph.directed<{ readonly identifier: IdentifierId }, {
    readonly event: EventId;
    readonly role: string
  }>((g) => {
    const node = (i: IdentifierId): Graph.NodeIndex =>
      O.getOrElse(HashMap.get(index, i), () => {
        const n = Graph.addNode(g, { identifier: i });
        index = HashMap.set(index, i, n);
        return n;
      });
    A.forEach(events, (e) => {
      const from = A.findFirst(e.participants, (p) => p.role === "from");
      O.match(from, {
        onNone: thunkUndefined,
        onSome: (f) =>
          A.forEach(e.participants, (p) => {
            if (p.role === "to" || p.role === "cc" || p.role === "bcc") {
              Graph.addEdge(g, node(f.identifier), node(p.identifier), {
                event: e.id,
                role: p.role,
              });
            }
          }),
      });
    });
  });
  return { graph, index };
};

/**
 * Selector reach: identifiers within `hops` outgoing communication hops of a
 * seed identifier, with their distance. Contact-chaining over selectors; it
 * says nothing about who knows whom.
 *
 * @category projection
 * @since 0.0.0
 */
export const selectorReach = ({
                                selectors,
                                seed,
                                hops,
                              }: {
  readonly selectors: ReturnType<typeof selectorGraph>;
  readonly seed: IdentifierId;
  readonly hops: number;
}): HashMap.HashMap<IdentifierId, number> =>
  O.match(HashMap.get(selectors.index, seed), {
    onNone: HashMap.empty<IdentifierId, number>,
    onSome: (start) =>
      pipe(
        Graph.unweightedDistances(selectors.graph, start, { direction: "outgoing" }),
        A.fromIterable,
        A.flatMap(([i, d]) =>
          d > 0 && d <= hops
            ? O.toArray(O.map(Graph.getNode(selectors.graph, i), (n) => [n.identifier, d] as const))
            : [],
        ),
        HashMap.fromIterable,
      ),
  });
