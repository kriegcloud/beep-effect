"use client";
import { CardContent } from "@beep/ui/components/card";
import { cn } from "@beep/ui-core/utils";
import { useContext } from "react";
import type { AuthLocalization } from "../../../lib/auth-localization";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import type { SettingsCardClassNames } from "../shared/settings-card";
import { SettingsCard } from "../shared/settings-card";
import { SettingsCellSkeleton } from "../skeletons/settings-cell-skeleton";
import { SessionCell } from "./session-cell";

export interface SessionsCardProps {
  className?: string;
  classNames?: SettingsCardClassNames;
  localization?: Partial<AuthLocalization>;
}

export function SessionsCard({ className, classNames, localization }: SessionsCardProps) {
  const {
    hooks: { useListSessions },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { data: sessions, isPending, refetch } = useListSessions();

  return (
    <SettingsCard
      className={className}
      classNames={classNames}
      description={localization.SESSIONS_DESCRIPTION}
      isPending={isPending}
      title={localization.SESSIONS}
    >
      <CardContent className={cn("grid gap-4", classNames?.content)}>
        {isPending ? (
          <SettingsCellSkeleton classNames={classNames} />
        ) : (
          sessions?.map((session) => (
            <SessionCell
              key={session.id}
              classNames={classNames}
              localization={localization}
              session={session}
              refetch={refetch}
            />
          ))
        )}
      </CardContent>
    </SettingsCard>
  );
}
