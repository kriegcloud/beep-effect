export type PermissionAction = "read" | "manage" | "delete";
export type PermissionConfig = Record<string, ReadonlyArray<PermissionAction>>;

export type InferPermissions<T extends PermissionConfig> = {
  [K in keyof T]: T[K][number] extends PermissionAction ? `${K & string}:${T[K][number]}` : never;
}[keyof T];

export const makePermissions = <T extends PermissionConfig>(config: T): Array<InferPermissions<T>> => {
  return Object.entries(config).flatMap(([domain, actions]) =>
    actions.map((action) => `${domain}:${action}` as InferPermissions<T>)
  );
};
