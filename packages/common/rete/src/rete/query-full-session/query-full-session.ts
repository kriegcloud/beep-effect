import type { Fact, Session } from "@beep/rete/rete";

export const queryFullSession = <T extends object>(session: Session<T>): Fact<T>[] => {
  const result: Fact<T>[] = [];
  session.idAttrNodes.forEach(({ alphaNodes, idAttr }) => {
    const nodesArr = [...alphaNodes];
    if (nodesArr.length <= 0) throw new Error("No nodes in session?");
    const firstNode = nodesArr[0]!;
    const fact = firstNode.facts.get(idAttr[0].toString())?.get(idAttr[1].toString());
    if (fact) {
      result.push([idAttr[0], idAttr[1], fact[2]]);
    } else {
      console.warn("Missing fact??");
    }
  });

  return result;
};
export default queryFullSession;
