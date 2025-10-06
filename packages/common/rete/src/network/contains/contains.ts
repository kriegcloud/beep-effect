import type { $Schema, Session } from "@beep/rete/network/types";
import { hashIdAttr } from "../utils";

export const contains = <T extends $Schema>(session: Session<T>, id: string, attr: keyof T): boolean =>
  session.idAttrNodes.has(hashIdAttr([id, attr]));

export default contains;
