import type { Session } from "@beep/rete/network";
import { hashIdAttr } from "../utils";

export const contains = <T extends object>(session: Session<T>, id: string, attr: keyof T): boolean =>
  session.idAttrNodes.has(hashIdAttr([id, attr]));

export default contains;
