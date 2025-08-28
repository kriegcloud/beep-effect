import {
  Field,
  type IdAttrs,
  type IdAttrsHash,
  type JoinNode,
  type Match,
  MEMORY_NODE_TYPE,
  type MemoryNode,
  PRODUCTION_ALREADY_EXISTS_BEHAVIOR,
  type Production,
  type Session,
} from "@beep/rete/network";
import { addNodes } from "../add-nodes";
import { isAncestor } from "../is-ancestor";

export const addProductionToSession = <T extends object, U>(
  session: Session<T>,
  production: Production<T, U>,
  alreadyExistsBehaviour = PRODUCTION_ALREADY_EXISTS_BEHAVIOR.ERROR
) => {
  if (session.leafNodes.has(production.name)) {
    const message = `${production.name} already exists in session`;
    if (alreadyExistsBehaviour === PRODUCTION_ALREADY_EXISTS_BEHAVIOR.QUIET) return;
    if (alreadyExistsBehaviour === PRODUCTION_ALREADY_EXISTS_BEHAVIOR.WARN) {
      console.warn(message);
      return;
    }
    if (alreadyExistsBehaviour === PRODUCTION_ALREADY_EXISTS_BEHAVIOR.ERROR) {
      throw new Error(message);
    }
  }

  const memNodes: MemoryNode<T>[] = [];
  const joinNodes: JoinNode<T>[] = [];
  const last = production.conditions.length - 1;
  const bindings = new Set<string>();
  const joinedBindings = new Set<string>();
  for (let i = 0; i <= last; i++) {
    const condition = production.conditions[i]!;
    const leafAlphaNode = addNodes(session, condition.nodes);
    const parentMemNode = memNodes.length > 0 ? memNodes[memNodes.length - 1] : undefined;
    const joinNode: JoinNode<T> = {
      id: session.nextId(),
      parent: parentMemNode,
      alphaNode: leafAlphaNode,
      condition,
      ruleName: production.name,
      oldIdAttrs: new Set<number>(),
    };
    for (const v of condition.vars) {
      if (bindings.has(v.name)) {
        joinedBindings.add(v.name);
        if (v.field === Field.Enum.IDENTIFIER) {
          joinNode.idName = v.name;
        }
      } else {
        bindings.add(v.name);
      }
    }
    if (parentMemNode) {
      parentMemNode.child = joinNode;
    }
    leafAlphaNode.successors.push(joinNode);
    leafAlphaNode.successors.sort((x, y) => (isAncestor(x, y) ? 1 : -1));
    const memNode: MemoryNode<T> = {
      id: session.nextId(),
      parent: joinNode,
      type: i === last ? MEMORY_NODE_TYPE.Enum.LEAF : MEMORY_NODE_TYPE.Enum.PARTIAL,
      condition,
      ruleName: production.name,
      lastMatchId: -1,
      matches: new Map<IdAttrsHash.Type, { idAttrs: IdAttrs<T>; match: Match<T> }>(),
      matchIds: new Map<number, IdAttrs<T>>(),
    };
    if (memNode.type === MEMORY_NODE_TYPE.Enum.LEAF) {
      memNode.nodeType = {
        condFn: production.condFn,
      };

      const pThenFn = production.thenFn;
      if (pThenFn) {
        const sess = { ...session, insideRule: true };
        memNode.nodeType.thenFn = (vars) => {
          pThenFn({
            session: sess,
            rule: production,
            vars: production.convertMatchFn(vars),
          });
        };
      }
      const pThenFinallyFn = production.thenFinallyFn;
      if (pThenFinallyFn) {
        const sess = { ...session, insideRule: true };
        memNode.nodeType.thenFinallyFn = () => {
          pThenFinallyFn(sess, production);
        };
      }

      if (session.leafNodes.has(production.name)) {
        throw new Error(`${production.name} already exists in session, this should have been handled above`);
      }
      session.leafNodes.set(production.name, memNode);
    }
    memNodes.push(memNode);
    joinNodes.push(joinNode);
    joinNode.child = memNode;
  }

  const leafMemNode = memNodes[memNodes.length - 1];
  for (let i = 0; i < memNodes.length; i++) {
    memNodes[i]!.leafNode = leafMemNode;
  }

  for (let i = 0; i < joinNodes.length; i++) {
    const node = joinNodes[i]!;
    const vars = node.condition.vars;
    for (let j = 0; j < vars.length; j++) {
      const v = vars[j]!;
      if (v.field === Field.Enum.VALUE && joinedBindings.has(v.name)) {
        node.disableFastUpdates = true;
        break;
      }
    }
  }
};

export default addProductionToSession;
