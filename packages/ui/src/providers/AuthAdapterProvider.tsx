import type React from "react";
import { createCtx } from "../utils";

type Org = {
  readonly id: string | number;
  readonly name: string;
  readonly logo?: string;
};

type Account = {
  readonly id: string | number;
  readonly name: string;
};

type User = {
  readonly id: string | number;
  readonly email: string;
  readonly name: string;
  readonly username?: undefined | null | string;
  readonly image?: string | null | undefined;
  readonly role?: string | null | undefined;
};

type Session = {
  readonly user: User;
};
type Notification = {
  readonly id: string;
  readonly avatarUrl: string;
  readonly type: string;
  readonly category: string;
  readonly isUnread: boolean;
  readonly createdAt: string;
  readonly title: string;
};

type Contact = {
  readonly id: string;
  readonly status: string;
  readonly role: string;
  readonly email: string;
  readonly name: string;
  readonly phoneNumber: string;
  readonly lastActivity: string;
  readonly avatarUrl: string;
  readonly address: string;
};

type Workspace = {
  readonly id: string;
  readonly name: string;
  readonly plan: string;
  readonly logo: string;
};

type AuthAdapterProviderCtx = {
  readonly signOut: () => Promise<void>;
  readonly switchAccount: () => Promise<void>;
  readonly switchOrganization: () => Promise<void>;
  readonly userOrgs: ReadonlyArray<Org>;
  readonly userAccounts: ReadonlyArray<Account>;
  readonly session: Session;
  readonly notifications: ReadonlyArray<Notification>;
  readonly contacts: ReadonlyArray<Contact>;
  readonly workspaces: ReadonlyArray<Workspace>;
};

const [useAuthAdapterProvider, Provider] = createCtx<AuthAdapterProviderCtx>("AuthAdapterProvider");

type AuthAdapterProviderProps = AuthAdapterProviderCtx & {
  readonly children: React.ReactNode;
};

export const AuthAdapterProvider: React.FC<AuthAdapterProviderProps> = ({ children, ...props }) => {
  return <Provider value={props}>{children}</Provider>;
};

export { useAuthAdapterProvider };
