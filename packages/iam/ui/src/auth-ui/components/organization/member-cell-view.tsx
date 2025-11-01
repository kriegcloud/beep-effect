"use client";

import type { User } from "@beep/iam-infra/adapters/better-auth/types";
import { Card } from "@beep/ui/components/card";
import { cn } from "@beep/ui-core/utils";
import type { Member } from "better-auth/plugins/organization";
import { useContext } from "react";
import type { AuthLocalization } from "../../lib/auth-localization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import type { SettingsCardClassNames } from "../settings/shared/settings-card-types";
import { UserView } from "../user-view";

export interface MemberCellViewProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  member: Member & { user?: Partial<User> | null };
  localization?: AuthLocalization;
}

export function MemberCellView({ className, classNames, member, localization: localizationProp }: MemberCellViewProps) {
  const { organization: organizationOptions, localization: contextLocalization } = useContext(AuthUIContext);
  const localization = { ...contextLocalization, ...localizationProp };

  const builtInRoles = [
    { role: "owner", label: localization.OWNER },
    { role: "admin", label: localization.ADMIN },
    { role: "member", label: localization.MEMBER },
  ];

  const roles = [...builtInRoles, ...(organizationOptions?.customRoles || [])];
  const role = roles.find((r) => r.role === member.role);

  return (
    <Card className={cn("flex-row items-center p-4", className, classNames?.cell)}>
      <UserView user={member.user} localization={localization} className="flex-1" />
      <span className="text-xs opacity-70">{role?.label}</span>
    </Card>
  );
}
