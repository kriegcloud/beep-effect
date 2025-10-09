import type { $Schema, Production, QueryFilter, Session } from "../../network/types";
import { queryAll } from "../query-all";

export const subscribeToProduction = <T extends $Schema, U>(
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
  return () => {
    production.subscriptions.delete(sub);
    if (production.subscriptions.size === 0) {
      session.subscriptionsOnProductions.delete(production.name);
    }
  };
};

export default subscribeToProduction;
