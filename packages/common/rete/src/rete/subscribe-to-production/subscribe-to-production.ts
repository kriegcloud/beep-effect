import type { Production, QueryFilter, Session } from "@beep/rete/rete";
import { queryAll } from "../query-all";

export const subscribeToProduction = <T extends object, U>(
  session: Session<T>,
  production: Production<T, U>,
  callback: (results: U[]) => void,
  filter?: QueryFilter<T>
): (() => void) => {
  const sub = { callback, filter };
  production.subscriptions.add(sub);
  if (!session.subscriptionsOnProductions.has(production.name)) {
    session.subscriptionsOnProductions.set(production.name, () => {
      production.subscriptions.forEach(({ callback, filter }) => callback(queryAll(session, production, filter)));
    });
  }
  const ret = () => {
    production.subscriptions.delete(sub);
    if (production.subscriptions.size === 0) {
      session.subscriptionsOnProductions.delete(production.name);
    }
  };
  return ret;
};

export default subscribeToProduction;
