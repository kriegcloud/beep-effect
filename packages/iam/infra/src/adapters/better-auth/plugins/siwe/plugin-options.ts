import type { AuthPluginSchema, InferOptionSchema } from "better-auth";
export interface WalletAddress {
  id: string;
  userId: string;
  address: string;
  chainId: number;
  isPrimary: boolean;
  createdAt: Date;
}

interface CacaoHeader {
  t: "caip122";
}

// Signed Cacao (CAIP-74)
interface CacaoPayload {
  domain: string;
  aud: string;
  nonce: string;
  iss: string;
  version?: string;
  iat?: string;
  nbf?: string;
  exp?: string;
  statement?: string;
  requestId?: string;
  resources?: string[];
  type?: string;
}

interface Cacao {
  h: CacaoHeader;
  p: CacaoPayload;
  s: {
    t: "eip191" | "eip1271";
    s: string;
    m?: string;
  };
}

export interface SIWEVerifyMessageArgs {
  message: string;
  signature: string;
  address: string;
  chainId: number;
  cacao?: Cacao;
}

export interface ENSLookupArgs {
  walletAddress: string;
}

export interface ENSLookupResult {
  name: string;
  avatar: string;
}
export const schema = {
  walletAddress: {
    fields: {
      userId: {
        type: "string",
        references: {
          model: "user",
          field: "id",
        },
        required: true,
      },
      address: {
        type: "string",
        required: true,
      },
      chainId: {
        type: "number",
        required: true,
      },
      isPrimary: {
        type: "boolean",
        defaultValue: false,
      },
      createdAt: {
        type: "date",
        required: true,
      },
    },
  },
} satisfies AuthPluginSchema;

export interface SIWEPluginOptions {
  domain: string;
  emailDomainName?: string;
  anonymous?: boolean;
  getNonce: () => Promise<string>;
  verifyMessage: (args: SIWEVerifyMessageArgs) => Promise<boolean>;
  ensLookup?: (args: ENSLookupArgs) => Promise<ENSLookupResult>;
  schema?: InferOptionSchema<typeof schema>;
}
