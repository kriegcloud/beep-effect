import * as A from "effect/Array";
import * as Struct from "effect/Struct";
import type { PermissionAction } from "./policy-builder";
export type PermissionConfig = Record<string, ReadonlyArray<PermissionAction.Type>>;

export type InferPermissions<T extends PermissionConfig> = {
  readonly [K in keyof T]: T[K][number] extends PermissionAction.Type ? `${K & string}:${T[K][number]}` : never;
}[keyof T];

export const makePermissions = <T extends PermissionConfig>(config: T): Array<InferPermissions<T>> => {
  return A.flatMap(Struct.entries(config), ([domain, actions]) =>
    A.map(actions, (action) => `${domain}:${action}` as InferPermissions<T>)
  );
};
