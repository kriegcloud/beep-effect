import type { BreadcrumbsProps } from "@mui/material/Breadcrumbs";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import type { SxProps, Theme } from "@mui/material/styles";
import type React from "react";
import { BackLink } from "./back-link";
import type { BreadcrumbsLinkProps } from "./breadcrumb-link";
import { BreadcrumbsLink } from "./breadcrumb-link";
import type { MoreLinksProps } from "./more-links";
import { MoreLinks } from "./more-links";
import {
  BreadcrumbsContainer,
  BreadcrumbsContent,
  BreadcrumbsHeading,
  BreadcrumbsRoot,
  BreadcrumbsSeparator,
} from "./styles";

export type CustomBreadcrumbsSlotProps = {
  readonly breadcrumbs: BreadcrumbsProps;
  readonly moreLinks: Omit<MoreLinksProps, "links">;
  readonly heading: React.ComponentProps<typeof BreadcrumbsHeading>;
  readonly content: React.ComponentProps<typeof BreadcrumbsContent>;
  readonly container: React.ComponentProps<typeof BreadcrumbsContainer>;
};

export type CustomBreadcrumbsSlots = {
  readonly breadcrumbs?: React.ReactNode | undefined;
};

export type CustomBreadcrumbsProps = React.ComponentProps<"div"> & {
  readonly sx?: SxProps<Theme> | undefined;
  readonly heading?: string | undefined;
  readonly activeLast?: boolean | undefined;
  readonly backHref?: string | undefined;
  readonly action?: React.ReactNode | undefined;
  readonly links?: BreadcrumbsLinkProps[] | undefined;
  readonly moreLinks?: MoreLinksProps["links"] | undefined;
  readonly slots?: CustomBreadcrumbsSlots | undefined;
  readonly slotProps?: Partial<CustomBreadcrumbsSlotProps> | undefined;
};

export function CustomBreadcrumbs({
  sx,
  action,
  backHref,
  heading,
  slots = {},
  links = [],
  moreLinks = [],
  slotProps = {},
  activeLast = false,
  ...other
}: CustomBreadcrumbsProps) {
  const lastLink = links[links.length - 1]?.name;

  const renderHeading = () => (
    <BreadcrumbsHeading {...slotProps?.heading}>
      {backHref ? <BackLink href={backHref} label={heading} /> : heading}
    </BreadcrumbsHeading>
  );

  const renderLinks = () =>
    slots?.breadcrumbs ?? (
      <Breadcrumbs separator={<BreadcrumbsSeparator />} {...slotProps?.breadcrumbs}>
        {links.map((link, index) => (
          <BreadcrumbsLink
            key={link.name ?? index}
            icon={link.icon}
            href={link.href}
            name={link.name}
            disabled={link.name === lastLink && !activeLast}
          />
        ))}
      </Breadcrumbs>
    );

  const renderMoreLinks = () => <MoreLinks links={moreLinks} {...slotProps?.moreLinks} />;

  return (
    <BreadcrumbsRoot sx={sx} {...other}>
      <BreadcrumbsContainer {...slotProps?.container}>
        <BreadcrumbsContent {...slotProps?.content}>
          {(heading || backHref) && renderHeading()}
          {(!!links.length || slots?.breadcrumbs) && renderLinks()}
        </BreadcrumbsContent>
        {action}
      </BreadcrumbsContainer>

      {!!moreLinks?.length && renderMoreLinks()}
    </BreadcrumbsRoot>
  );
}
