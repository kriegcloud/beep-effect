export class InvariantViolation extends Error {
  readonly file?: string;
  readonly line?: number;
  readonly args?: ReadonlyArray<unknown>;
  constructor(args: {
    readonly message: string;
    /** File where the invariant was defined/called (best-effort trimmed path). */
    readonly file?: string;
    /** Line number (0-based or 1-based depending on environment; treat as opaque). */
    readonly line?: number;
    /** Best-effort, JSON-serializable view of extra args (may be lossy). */
    readonly args?: ReadonlyArray<unknown>;
  }) {
    super(args.message);
    this.file = args.file;
    this.line = args.line;
    this.args = args.args;
    // NOTE: Restores prototype chain (https://stackoverflow.com/a/48342359).
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
