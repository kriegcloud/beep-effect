import { type Auditor as A, type AuditorMode as AM, consoleAuditor as cA } from "@beep/rete/rete";

export type Auditor = A;
export type AuditorMode = AM;
export const consoleAuditor = cA;
