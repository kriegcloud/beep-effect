"use client";

import type { Organization } from "better-auth/plugins/organization";
import { useContext, useMemo, useState } from "react";

import { useCurrentOrganization } from "../../hooks/use-current-organization";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import type { SettingsCardProps } from "../settings/shared/settings-card";
import { SettingsCard } from "../settings/shared/settings-card";
import { DeleteOrganizationDialog } from "./delete-organization-dialog";

export function DeleteOrganizationCard({
  className,
  classNames,
  localization: localizationProp,
  slug,
  ...props
}: SettingsCardProps & { slug?: string }) {
  const { localization: contextLocalization } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { data: organization } = useCurrentOrganization({ slug });

  if (!organization)
    return (
      <SettingsCard
        className={className}
        classNames={classNames}
        actionLabel={localization?.DELETE_ORGANIZATION}
        description={localization?.DELETE_ORGANIZATION_DESCRIPTION}
        isPending
        title={localization?.DELETE_ORGANIZATION}
        variant="destructive"
      />
    );

  return (
    <DeleteOrganizationForm
      className={className}
      classNames={classNames}
      localization={localization}
      organization={organization}
      {...props}
    />
  );
}

function DeleteOrganizationForm({
  className,
  classNames,
  localization: localizationProp,
  organization,
}: SettingsCardProps & { organization: Organization }) {
  const {
    localization: contextLocalization,
    hooks: { useHasPermission },
  } = useContext(AuthUIContext);

  const localization = useMemo(
    () => ({ ...contextLocalization, ...localizationProp }),
    [contextLocalization, localizationProp]
  );

  const { data: hasPermission, isPending } = useHasPermission({
    organizationId: organization.id,
    permissions: {
      organization: ["delete"],
    },
  });

  const [showDialog, setShowDialog] = useState(false);

  if (!hasPermission?.success) return null;

  return (
    <>
      <SettingsCard
        className={className}
        classNames={classNames}
        actionLabel={localization?.DELETE_ORGANIZATION}
        description={localization?.DELETE_ORGANIZATION_DESCRIPTION}
        isPending={isPending}
        title={localization?.DELETE_ORGANIZATION}
        variant="destructive"
        action={() => setShowDialog(true)}
      />

      <DeleteOrganizationDialog
        classNames={classNames}
        localization={localization}
        open={showDialog}
        onOpenChange={setShowDialog}
        organization={organization}
      />
    </>
  );
}
