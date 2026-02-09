"use client";

import { GmailScopes } from "@beep/google-workspace-domain";
import { Core, OAuth2 } from "@beep/iam-client";
import { Organization } from "@beep/iam-client/organization";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { Iconify } from "@beep/ui/atoms";
import { toast } from "@beep/ui/molecules";
import { Result } from "@effect-atom/atom-react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import React from "react";

const ACTIVE_GOOGLE_PROVIDER_ACCOUNT_ID_KEY = "google.activeProviderAccountId" as const;

const MetadataRecord = S.Record({ key: S.String, value: S.Unknown });

const decodeMetadata = (input: unknown): Record<string, unknown> => (S.is(MetadataRecord)(input) ? input : {});

const getMetadataString = (metadata: Record<string, unknown>, key: string): string | undefined => {
  const value = metadata[key];
  return S.is(S.String)(value) ? value : undefined;
};

const DEFAULT_GOOGLE_SCOPES: ReadonlyArray<string> = [
  // Minimal demo-friendly scopes; adapters may still request incremental consent if more is needed.
  GmailScopes.read,
  GmailScopes.send,
];

export function ConnectionsTabPanel() {
  const runtime = useRuntime();
  const run = React.useMemo(() => makeRunClientPromise(runtime, "web.account.connections"), [runtime]);

  const { sessionResult } = Core.Atoms.use();

  const sessionData = React.useMemo(() => {
    return Result.builder(sessionResult)
      .onInitial(() => O.none<Core.GetSession.SessionData>())
      .onFailure(() => O.none<Core.GetSession.SessionData>())
      .onDefect(() => O.none<Core.GetSession.SessionData>())
      .onSuccess(({ data }) => data)
      .render();
  }, [sessionResult]);

  const activeOrganizationIdOpt = React.useMemo(
    () => sessionData.pipe(O.flatMap((s) => O.fromNullable(s.session.activeOrganizationId ?? null))),
    [sessionData]
  );

  const [googleAccounts, setGoogleAccounts] = React.useState<ReadonlyArray<Core.ListAccounts.Account>>([]);
  const [activeGoogleProviderAccountId, setActiveGoogleProviderAccountId] = React.useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState(false);

  const reload = React.useCallback(async () => {
    if (O.isNone(activeOrganizationIdOpt)) return;
    const activeOrganizationId = activeOrganizationIdOpt.value;

    setLoading(true);
    try {
      const { accounts, active } = await run(
        Effect.gen(function* () {
          const accounts = yield* Core.ListAccounts.Handler(undefined);

          const org = yield* Organization.Crud.GetFull.Handler({
            query: { organizationId: activeOrganizationId },
          });

          const metadata = decodeMetadata(org.metadata);
          const active = getMetadataString(metadata, ACTIVE_GOOGLE_PROVIDER_ACCOUNT_ID_KEY);

          const google = F.pipe(
            accounts,
            A.filter((acc) => acc.providerId === "google")
          );

          return { accounts: google, active };
        })
      );

      setGoogleAccounts(accounts);
      setActiveGoogleProviderAccountId(active);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [activeOrganizationIdOpt, run]);

  React.useEffect(() => {
    void reload();
  }, [reload]);

  const handleLink = React.useCallback(
    async (scopes: ReadonlyArray<string> | undefined) => {
      try {
        const res = await run(
          OAuth2.Link.Handler({
            providerId: "google",
            callbackURL: "/settings?settingsTab=connections",
            errorCallbackURL: "/settings?settingsTab=connections&relink=failed",
            scopes: scopes ? [...scopes] : undefined,
          })
        );
        window.location.href = res.url;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        toast.error(message);
      }
    },
    [run]
  );

  const handleUnlink = React.useCallback(async () => {
    setLoading(true);
    try {
      await run(Core.UnlinkAccount.Handler({ providerId: "google" }).pipe(Effect.asVoid));
      toast.success("Google account unlinked");
      await reload();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [reload, run]);

  const saveActiveSelection = React.useCallback(
    async (providerAccountId: string | undefined) => {
      if (O.isNone(activeOrganizationIdOpt)) return;
      const activeOrganizationId = activeOrganizationIdOpt.value;

      setLoading(true);
      try {
        await run(
          Effect.gen(function* () {
            const org = yield* Organization.Crud.GetFull.Handler({
              query: { organizationId: activeOrganizationId },
            });

            const metadata = decodeMetadata(org.metadata);

            const next: Record<string, unknown> =
              providerAccountId === undefined
                ? Object.fromEntries(
                    Object.entries(metadata).filter(([k]) => k !== ACTIVE_GOOGLE_PROVIDER_ACCOUNT_ID_KEY)
                  )
                : { ...metadata, [ACTIVE_GOOGLE_PROVIDER_ACCOUNT_ID_KEY]: providerAccountId };

            yield* Organization.Crud.Update.Handler({
              organizationId: activeOrganizationId,
              data: { metadata: next },
            }).pipe(Effect.asVoid);
          })
        );

        setActiveGoogleProviderAccountId(providerAccountId);
        toast.success("Active Google account saved");
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [activeOrganizationIdOpt, run]
  );

  const selectedAccountId = activeGoogleProviderAccountId ?? "";

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6">Connections</Typography>
            <Typography variant="body2" color="text.secondary">
              Link Google, manage granted scopes, and select the active account for org-scoped sync/extraction.
            </Typography>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ px: 2, py: 1.5, gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<Iconify icon="material-symbols:add" />}
            onClick={() => void handleLink(undefined)}
            disabled={loading}
          >
            Link Google
          </Button>
          <Button
            variant="outlined"
            startIcon={<Iconify icon="material-symbols:chevron-right" />}
            onClick={() => void handleLink(DEFAULT_GOOGLE_SCOPES)}
            disabled={loading}
          >
            Relink (Scopes)
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Iconify icon="material-symbols:close" />}
            onClick={() => void handleUnlink()}
            disabled={loading}
          >
            Unlink Google
          </Button>
        </CardActions>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1">Active Google Account (Org)</Typography>
              <Typography variant="body2" color="text.secondary">
                The server will not choose a default account. If multiple Google accounts are linked, you must select
                one explicitly for demo-critical operations.
              </Typography>
            </Stack>

            {O.isNone(activeOrganizationIdOpt) ? (
              <Typography variant="body2" color="text.secondary">
                No active organization in session.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                <FormControl size="small" sx={{ minWidth: 360 }}>
                  <InputLabel id="connections-active-google-account-label">Active account</InputLabel>
                  <Select
                    labelId="connections-active-google-account-label"
                    label="Active account"
                    value={selectedAccountId}
                    onChange={(e) => {
                      const next = String(e.target.value);
                      const id = next.length > 0 ? next : undefined;
                      void saveActiveSelection(id);
                    }}
                    disabled={loading || googleAccounts.length === 0}
                  >
                    <MenuItem value={""}>
                      <em>None selected</em>
                    </MenuItem>
                    {F.pipe(
                      googleAccounts,
                      A.map((acc) => (
                        <MenuItem key={acc.id} value={acc.id}>
                          {acc.accountId ?? acc.id}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>

                {activeGoogleProviderAccountId ? (
                  <Chip label="Active" color="primary" variant="filled" />
                ) : (
                  <Chip label="Not set" color="default" variant="outlined" />
                )}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="subtitle1">Linked Google Accounts</Typography>
            {googleAccounts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No Google accounts linked.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {F.pipe(
                  googleAccounts,
                  A.map((acc) => (
                    <Box
                      key={acc.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        px: 2,
                        py: 1,
                      }}
                    >
                      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {acc.accountId ?? acc.id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          providerAccountId: {acc.id}
                        </Typography>
                        {acc.scope ? (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            scopes: {acc.scope}
                          </Typography>
                        ) : null}
                      </Stack>
                      {activeGoogleProviderAccountId === acc.id ? (
                        <Chip label="Active" color="primary" size="small" />
                      ) : (
                        <Chip label="Inactive" color="default" size="small" variant="outlined" />
                      )}
                    </Box>
                  ))
                )}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
