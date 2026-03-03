declare module "virtual:config" {
  export interface VirtualConfig {
    enabled: boolean;
  }
}

export namespace Internal {
  export const value = 1;
}

export const plainValue = 42;
