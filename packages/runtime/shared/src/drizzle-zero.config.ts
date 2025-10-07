import { drizzleZeroConfig } from "drizzle-zero";
import * as Schema from "./drizzleSchema";

const tables = {
  account: true,
  apiKey: true,
  deviceCode: true,
  file: true,
  invitation: true,
  jwks: true,
  member: true,
  oauthAccessToken: true,
  oauthApplication: true,
  oauthConsent: true,
  organization: true,
  organizationRole: true,
  passkey: true,
  rateLimit: true,
  session: true,
  ssoProvider: true,
  subscription: true,
  team: true,
  teamMember: true,
  twoFactor: true,
  user: true,
  verification: true,
  walletAddress: true,
} as const;

export const schema = drizzleZeroConfig(Schema, {
  tables,
  debug: true,
});

export default schema;
