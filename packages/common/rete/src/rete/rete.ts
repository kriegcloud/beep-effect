import { addConditionsToProduction } from "@beep/rete/rete/add-conditions-to-production";
import { initSession } from "@beep/rete/rete/init-session";
import { addProductionToSession } from "./add-production-to-session";
import { contains } from "./contains";
import { fireRules } from "./fire-rules";
import { get } from "./get";
import initProduction from "./init-production/init-production";
import { insertFact } from "./insert-fact";
import { queryAll } from "./query-all";
import { queryFullSession } from "./query-full-session";
import { retractFact } from "./retract-fact";
import { retractFactByIdAndAttr } from "./retract-fact-by-id-and-attr";
import { retrieveFactValueByIdAttr } from "./retrieve-fact-value-by-id-attr";
import { subscribeToProduction } from "./subscribe-to-production";

export const rete = {
  get,
  queryAll,
  queryFullSession,
  initProduction,
  initSession,
  fireRules,
  retractFact,
  retractFactByIdAndAttr,
  insertFact,
  contains,
  retrieveFactValueByIdAttr,
  addProductionToSession,
  addConditionsToProduction,
  subscribeToProduction,
};
