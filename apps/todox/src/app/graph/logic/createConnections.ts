import * as A from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";

export type Connections = MutableHashMap.MutableHashMap<string, MutableHashSet.MutableHashSet<string>>;

export const createConnections = (tags: string[][]) => {
  const connections = MutableHashMap.empty<string, MutableHashSet.MutableHashSet<string>>();

  A.forEach(tags, (tagList) => {
    A.forEach(tagList, (tag) => {
      if (!MutableHashMap.has(tag)(connections)) {
        MutableHashMap.set(tag, MutableHashSet.empty<string>());
      }
      const newSet = MutableHashMap.get(tag)(connections).pipe(O.getOrElse(MutableHashSet.empty<string>));

      A.forEach(tagList, (otherTag) => {
        if (tag === otherTag) {
          return;
        }
        MutableHashSet.add(otherTag)(newSet);
      });
      MutableHashMap.set(tag, newSet)(connections);
    });
  });
  return connections;
};
