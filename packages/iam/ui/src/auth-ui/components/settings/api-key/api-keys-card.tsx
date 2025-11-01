"use client";

import { CardContent } from "@beep/ui/components/card";
import { cn } from "@beep/ui-core/utils";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { useContext, useMemo, useState } from "react";
import { AuthUIContext } from "../../../lib/auth-ui-provider";
import type { SettingsCardProps } from "../shared/settings-card";
import { SettingsCard } from "../shared/settings-card";
import { ApiKeyCell } from "./api-key-cell";
import { ApiKeyDisplayDialog } from "./api-key-display-dialog";
import { CreateApiKeyDialog } from "./create-api-key-dialog";

export interface ApiKeysCardProps extends SettingsCardProps {
  organizationId?: string;
}

export function ApiKeysCard({ className, classNames, localization, organizationId, ...props }: ApiKeysCardProps) {
  const {
    hooks: { useListApiKeys },
    localization: contextLocalization,
  } = useContext(AuthUIContext);

  localization = { ...contextLocalization, ...localization };

  const { data: apiKeys, isPending, refetch } = useListApiKeys();

  // Filter API keys by organizationId
  const filteredApiKeys = useMemo(() => {
    return apiKeys?.filter(
      (apiKey) =>
        organizationId ===
        F.pipe(
          apiKey.metadata,
          O.match({
            onNone: () => undefined,
            onSome: (metadata) => JSON.parse(metadata).organizationId,
          })
        ).organizationId
    );
  }, [apiKeys, organizationId]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [displayDialogOpen, setDisplayDialogOpen] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState("");

  const handleCreateApiKey = (apiKey: string) => {
    setCreatedApiKey(apiKey);
    setDisplayDialogOpen(true);
  };

  return (
    <>
      <SettingsCard
        className={className}
        classNames={classNames}
        actionLabel={localization.CREATE_API_KEY}
        description={localization.API_KEYS_DESCRIPTION}
        instructions={localization.API_KEYS_INSTRUCTIONS}
        isPending={isPending}
        title={localization.API_KEYS}
        action={() => setCreateDialogOpen(true)}
        {...props}
      >
        {filteredApiKeys && filteredApiKeys.length > 0 && (
          <CardContent className={cn("grid gap-4", classNames?.content)}>
            {filteredApiKeys?.map((apiKey) => (
              <ApiKeyCell
                key={apiKey.id}
                classNames={classNames}
                apiKey={apiKey}
                localization={localization}
                refetch={refetch}
              />
            ))}
          </CardContent>
        )}
      </SettingsCard>

      <CreateApiKeyDialog
        classNames={classNames}
        localization={localization}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateApiKey}
        refetch={refetch}
        organizationId={organizationId}
      />

      <ApiKeyDisplayDialog
        classNames={classNames}
        apiKey={createdApiKey}
        localization={localization}
        open={displayDialogOpen}
        onOpenChange={setDisplayDialogOpen}
      />
    </>
  );
}
