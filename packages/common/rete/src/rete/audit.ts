export enum AuditAction {
  INSERTION = "INSERTION",
  UPDATE = "UPDATE",
  RETRACTION = "RETRACTION",
}

export enum AuditRuleTrigger {
  THEN = "THEN",
  THEN_FINALLY = "THEN_FINALLY",
}

export enum AuditEntryState {
  ENTER = "ENTER",
  EXIT = "EXIT",
}

export enum AuditRecordType {
  FACT = "FACT",
  RULE = "RULE",
  FIRE = "FIRE",
}

export type AuditRecord =
  | {
      tag: AuditRecordType.FACT;
      action: AuditAction;

      fact: any;

      oldFact?: any;

      meta?: any;
    }
  | {
      tag: AuditRecordType.RULE;
      rule: string;
      trigger: AuditRuleTrigger;
      state: AuditEntryState;

      meta?: any;
    }
  | {
      tag: AuditRecordType.FIRE;
      state: AuditEntryState;
    };

export enum AuditorMode {
  STREAM = "STREAM",
  BATCH = "BATCH",
}

export interface Auditor {
  // Hook to dump the entire buffer of records and reset it
  flush: () => void;

  // Retrieve the current state of the buffer
  currentBuffer: () => Readonly<AuditRecord[]>;

  log: (record: AuditRecord) => void;

  // Dump the records without triggering flush logic
  reset?: () => void;
}

export const consoleAuditor = (mode: AuditorMode = AuditorMode.STREAM, colorizeOutput = true): Auditor => {
  const buffer: AuditRecord[] = [];
  // use this to search through firings of rules?
  let fireId = 0;
  const createLogEntry = (record: AuditRecord): string => {
    let delta: string;
    const insertColor = colorizeOutput ? `\x1b[32m` : "";
    const retractionColor = colorizeOutput ? `\x1b[31m` : "";
    const thenColor = colorizeOutput ? `\x1b[34m` : "";
    const updateColor = thenColor;
    const thenFinallyColor = colorizeOutput ? `\x1b[36m` : "";
    if (record.tag === AuditRecordType.FACT) {
      if (record.action === AuditAction.UPDATE) {
        delta = `${retractionColor}-[${record.oldFact}] ${updateColor}--> ${insertColor}+[${record.fact}] `;
      } else {
        const symbol = record.action === AuditAction.INSERTION ? `${insertColor}+` : `${retractionColor}-`;
        delta = `${symbol}[${record.fact}]`;
      }
      return `${delta}`;
    }
    if (record.tag === AuditRecordType.RULE) {
      const trigger =
        record.trigger === AuditRuleTrigger.THEN ? `${thenColor}then()` : `${thenFinallyColor}thenFinally()`;
      return `${record.rule} ${trigger}`;
    }
    fireId++;
    return `fire ${fireId}`;
  };

  const log = (record: AuditRecord) => {
    if (mode === AuditorMode.STREAM) {
      const entry = createLogEntry(record);
      if (record.tag === AuditRecordType.FACT) {
        console.timeStamp(entry);
        console.log(entry);
      } else if (record.tag === AuditRecordType.RULE) {
        if (record.state === AuditEntryState.ENTER) {
          console.groupCollapsed(entry);
        } else {
          console.groupEnd();
        }
      } else if (record.tag === AuditRecordType.FIRE) {
        if (record.state === AuditEntryState.ENTER) {
          console.time(entry);
        } else {
          console.timeEnd(entry);
        }
      }
    } else buffer.push(record);
  };

  const flush = () => {
    if (buffer.length === 0) return;
    console.log(buffer.map((r) => createLogEntry(r)).join("\n"));
    buffer.length = 0;
  };

  const currentBuffer = () => buffer;

  const reset = () => (buffer.length = 0);

  return {
    log,
    currentBuffer,
    reset,
    flush,
  };
};
