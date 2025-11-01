"use client";

import { CardContent } from "@beep/ui/components/card";
import { cn } from "@beep/ui-core/utils";
import type { Organization } from "better-auth/plugins/organization";
import { useContext, useMemo, useState } from "react";
import { useCurrentOrganization } from "../../hooks/use-current-organization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import type { SettingsCardProps } from "../settings/shared/settings-card";
import { SettingsCard } from "../settings/shared/settings-card";
import { InviteMemberDialog } from "./invite-member-dialog";
import { MemberCell } from "./member-cell";

export function OrganizationMembersCard({
  className,
  classNames,
  localization: localizationProp,
  slug: slugProp,
  ...props
}: SettingsCardProps & { slug?: string }) {
  const { localization: contextLocalization, organization: organizationOptions } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const slug = slugProp || organizationOptions?.slug;

  const { data: organization } = useCurrentOrganization({ slug });

  if (!organization) {
    return (
      <SettingsCard
        className={className}
        classNames={classNames}
        title={localization.MEMBERS}
        description={localization.MEMBERS_DESCRIPTION}
        instructions={localization.MEMBERS_INSTRUCTIONS}
        actionLabel={localization.INVITE_MEMBER}
        isPending
        {...props}
      />
    );
  }

  return (
    <OrganizationMembersContent
      className={className}
      classNames={classNames}
      localization={localization}
      organization={organization}
      {...props}
    />
  );
}

function OrganizationMembersContent({
  className,
  classNames,
  localization: localizationProp,
  organization,
  ...props
}: SettingsCardProps & { organization: Organization }) {
  const {
    hooks: { useHasPermission, useListMembers },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { data: hasPermissionInvite, isPending: isPendingInvite } = useHasPermission({
    organizationId: organization.id,
    permissions: {
      invitation: ["create"],
    },
  });

  const { data: hasPermissionUpdateMember, isPending: isPendingUpdateMember } = useHasPermission({
    organizationId: organization.id,
    permission: {
      member: ["update"],
    },
  });

  const isPending = isPendingInvite || isPendingUpdateMember;

  const { data } = useListMembers({
    query: { organizationId: organization.id },
  });

  const members = data?.members;

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <>
      <SettingsCard
        className={className}
        classNames={classNames}
        title={localization.MEMBERS}
        description={localization.MEMBERS_DESCRIPTION}
        instructions={localization.MEMBERS_INSTRUCTIONS}
        actionLabel={localization.INVITE_MEMBER}
        action={() => setInviteDialogOpen(true)}
        isPending={isPending}
        disabled={!hasPermissionInvite?.success}
        {...props}
      >
        {!isPending && members && members.length > 0 && (
          <CardContent className={cn("grid gap-4", classNames?.content)}>
            {members
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((member) => (
                <MemberCell
                  key={member.id}
                  classNames={classNames}
                  member={member}
                  localization={localization}
                  hideActions={!hasPermissionUpdateMember?.success}
                />
              ))}
          </CardContent>
        )}
      </SettingsCard>

      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        classNames={classNames}
        localization={localization}
        organization={organization}
      />
    </>
  );
}
