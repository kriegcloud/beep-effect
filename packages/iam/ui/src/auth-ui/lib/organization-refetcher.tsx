import { useEffect } from "react";
import { useCurrentOrganization } from "../hooks/use-current-organization";
import type { AuthHooks, OrganizationOptionsContext } from "../types";

interface OrganizationRefetcherProps {
  readonly hooks: AuthHooks;
  readonly organizationOptions?: OrganizationOptionsContext | undefined;
  readonly navigate: (href: string) => void;
  readonly redirectTo: string;
}

export const OrganizationRefetcher = ({
  hooks,
  organizationOptions,
  navigate,
  redirectTo,
}: OrganizationRefetcherProps) => {
  const { useListOrganizations, useSession } = hooks;

  const { slug, pathMode, personalPath } = organizationOptions || {};

  const { data: sessionData } = useSession();

  const {
    data: organization,
    isPending: organizationPending,
    isRefetching: organizationRefetching,
    refetch: refetchOrganization,
  } = useCurrentOrganization({}, hooks, organizationOptions);

  const { refetch: refetchListOrganizations } = useListOrganizations();

  const { data: organizations } = useListOrganizations();

  useEffect(() => {
    if (!sessionData?.user.id) return;

    if (organization || organizations) {
      refetchOrganization?.();
      refetchListOrganizations?.();
    }
  }, [sessionData?.user.id]);

  useEffect(() => {
    if (organizationRefetching || organizationPending) return;

    if (slug && pathMode === "slug" && !organization) {
      navigate(personalPath || redirectTo);
    }
  }, [organization, organizationRefetching, organizationPending, slug, pathMode, personalPath, navigate, redirectTo]);

  return null;
};
