/**
 * Reversible entity resolution over admitted claims, as an `effect/Graph`.
 *
 * Parties are nodes of an undirected resolution graph; each admitted
 * `SameParty` claim version is an edge labelled with its claim id. Clusters
 * are `Graph.connectedComponents`. Before an edge is added, both endpoints'
 * current components are walked (`Graph.bfs`); a single `DistinctParty`
 * claim spanning the two components vetoes the edge (verified-merge rule),
 * so uncertain similarity never chains unrelated people into one mega-cluster.
 *
 * Nothing is rewritten. Undoing a merge means superseding the `SameParty`
 * version; the next build simply lacks that edge.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Graph from "effect/Graph";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import type { ClaimVersion } from "./Claim.ts";
import type { ClaimVersionId, PartyId } from "./Ids.ts";

interface PairClaim {
  readonly id: ClaimVersionId;
  readonly left: PartyId;
  readonly right: PartyId;
}

/**
 * Outcome of resolving parties at one knowledge time.
 *
 * @category resolution
 * @since 0.0.0
 */
export interface ResolutionResult {
  /** Representative (lexicographically smallest id) for every party seen. */
  readonly representative: (party: PartyId) => PartyId;
  /** Merges that were blocked, with the veto that blocked them. */
  readonly vetoed: ReadonlyArray<{ readonly sameParty: ClaimVersionId; readonly vetoedBy: ClaimVersionId }>;
  /** The resolution graph itself: parties as nodes, admitted merges as edges. */
  readonly graph: Graph.UndirectedGraph<PartyId, ClaimVersionId>;
}

const pairs = (versions: ReadonlyArray<ClaimVersion>, tag: "SameParty" | "DistinctParty"): ReadonlyArray<PairClaim> =>
  A.flatMap(versions, (v) =>
    v.proposition._tag === tag ? [{ id: v.id, left: v.proposition.left, right: v.proposition.right }] : []
  );

/**
 * Resolve parties from claim versions already filtered to one bitemporal
 * scope (see `versionsAt`). Merges apply in claim-id order, so the result is
 * deterministic and replayable.
 *
 * @category resolution
 * @since 0.0.0
 */
export const resolveParties = (versions: ReadonlyArray<ClaimVersion>): ResolutionResult => {
  const sames = A.sort(
    pairs(versions, "SameParty"),
    Order.mapInput(Order.String, (p: PairClaim) => p.id)
  );
  const vetoes = pairs(versions, "DistinctParty");
  const parties = A.dedupe(A.flatMap([...sames, ...vetoes], (p) => [p.left, p.right]));

  let index = HashMap.empty<PartyId, Graph.NodeIndex>();
  let vetoed = A.empty<{ readonly sameParty: ClaimVersionId; readonly vetoedBy: ClaimVersionId }>();

  const graph = Graph.undirected<PartyId, ClaimVersionId>((g) => {
    A.forEach(parties, (p) => {
      index = HashMap.set(index, p, Graph.addNode(g, p));
    });
    const node = (p: PartyId) => O.getOrThrow(HashMap.get(index, p));
    const component = (p: PartyId) =>
      pipe(g, Graph.bfs({ start: [node(p)] }), Graph.values, HashSet.fromIterable);

    A.forEach(sames, (same) => {
      const a = component(same.left);
      if (HashSet.has(a, same.right)) return;
      const b = component(same.right);
      const spans = (d: PairClaim) =>
        (HashSet.has(a, d.left) && HashSet.has(b, d.right)) || (HashSet.has(a, d.right) && HashSet.has(b, d.left));
      O.match(A.findFirst(vetoes, spans), {
        onSome: (veto) => {
          vetoed = A.append(vetoed, { sameParty: same.id, vetoedBy: veto.id });
        },
        onNone: () => {
          Graph.addEdge(g, node(same.left), node(same.right), same.id);
        },
      });
    });
  });

  const representatives = pipe(
    Graph.connectedComponents(graph),
    A.flatMap((component) => {
      const members = A.flatMap(component, (i) => O.toArray(Graph.getNode(graph, i)));
      return A.isReadonlyArrayNonEmpty(members)
        ? A.map(members, (p) => [p, A.min(members, Order.String)] as const)
        : [];
    }),
    HashMap.fromIterable
  );

  return {
    representative: (p) => O.getOrElse(HashMap.get(representatives, p), () => p),
    vetoed,
    graph,
  };
};
