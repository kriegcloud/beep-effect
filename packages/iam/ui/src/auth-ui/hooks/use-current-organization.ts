import type { Organization } from "better-auth/plugins/organization";
import { useMemo } from "react";
import type { AuthHooks, OrganizationOptionsContext } from "../types";

export function useCurrentOrganization(
  { slug: slugProp }: { readonly slug?: string | undefined } = {},
  hooks?: AuthHooks | undefined,
  organizationOptions?: OrganizationOptionsContext | undefined
) {
  // If hooks not provided, this will fail - caller must provide them
  if (!hooks) {
    throw new Error("useCurrentOrganization requires hooks to be provided");
  }
  const { useActiveOrganization, useListOrganizations } = hooks;

  const { pathMode, slug: contextSlug } = organizationOptions || {};

  let data: Organization | null | undefined;
  let isPending: boolean | undefined;
  let isRefetching: boolean | undefined;

  let refetch: (() => void) | undefined;

  const {
    data: organizations,
    isPending: organizationsPending,
    isRefetching: organizationsRefetching,
  } = useListOrganizations();

  if (pathMode === "slug") {
    const slug = slugProp || contextSlug;

    data = organizations?.find((organization) => organization.slug === slug);
    isPending = organizationsPending;
    isRefetching = organizationsRefetching;
  } else {
    const {
      data: activeOrganization,
      isPending: organizationPending,
      isRefetching: organizationRefetching,
      refetch: refetchOrganization,
    } = useActiveOrganization();

    refetch = refetchOrganization;

    data = activeOrganization;
    isPending = organizationPending;
    isRefetching = organizationRefetching;
  }

  return useMemo(
    () => ({
      data,
      isPending,
      isRefetching,
      refetch,
    }),
    [data, isPending, isRefetching, refetch]
  );
}
