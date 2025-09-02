export interface ValidationResult {
  readonly isValid: boolean;
  readonly error?:
    | undefined
    | {
        readonly message: string;
        readonly element: object;
      };
}
