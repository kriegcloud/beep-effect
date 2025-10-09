declare module "json-logic-js" {
  export type JsonLogicRule = unknown;
  export interface JsonLogic {
    apply(rule: JsonLogicRule, data?: unknown): unknown;
    add_operation(name: string, operation: (...args: unknown[]) => unknown): void;
    rm_operation(name: string): void;
  }

  const jsonLogic: JsonLogic;
  export default jsonLogic;
}
