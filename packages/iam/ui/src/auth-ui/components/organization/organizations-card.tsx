"use client";
import { CardContent } from "@beep/ui/components/card";

import { useIsHydrated } from "@beep/ui/hooks/use-hydrated";
import { cn } from "@beep/ui-core/utils";
import { useContext, useMemo, useState } from "react";
import { AuthUIContext } from "../../lib/auth-ui-provider";
import type { SettingsCardProps } from "../settings/shared/settings-card";
import { SettingsCard } from "../settings/shared/settings-card";
import { SettingsCellSkeleton } from "../settings/skeletons/settings-cell-skeleton";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { OrganizationCell } from "./organization-cell";

export function OrganizationsCard({ className, classNames, localization, ...props }: SettingsCardProps) {
  const {
    hooks: { useListOrganizations },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  localization = useMemo(() => ({ ...contextLocalization, ...localization }), [contextLocalization, localization]);

  const isHydrated = useIsHydrated();
  const { data: organizations, isPending: organizationsPending } = useListOrganizations();

  const isPending = !isHydrated || organizationsPending;

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <>
      <SettingsCard
        className={className}
        classNames={classNames}
        title={localization.ORGANIZATIONS}
        description={localization.ORGANIZATIONS_DESCRIPTION}
        instructions={localization.ORGANIZATIONS_INSTRUCTIONS}
        actionLabel={localization.CREATE_ORGANIZATION}
        action={() => setCreateDialogOpen(true)}
        isPending={isPending}
        {...props}
      >
        <CardContent className={cn("grid gap-4", classNames?.content)}>
          {isPending && <SettingsCellSkeleton />}
          {organizations?.map((organization) => (
            <OrganizationCell
              key={organization.id}
              classNames={classNames}
              organization={organization}
              localization={localization}
            />
          ))}
        </CardContent>
      </SettingsCard>

      <CreateOrganizationDialog
        classNames={classNames}
        localization={localization}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
