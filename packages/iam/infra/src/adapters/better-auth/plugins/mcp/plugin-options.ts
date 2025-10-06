import type { OIDCOptions } from "better-auth/plugins/oidc-provider";

export interface MCPOptions {
  loginPage: string;
  resource?: string;
  oidcConfig?: OIDCOptions;
}
