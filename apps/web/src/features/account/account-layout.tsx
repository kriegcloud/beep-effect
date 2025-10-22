"use client";

import { paths } from "@beep/shared-domain";
import { Iconify } from "@beep/ui/atoms";
import { usePathname } from "@beep/ui/hooks";
import type { DashboardContentProps } from "@beep/ui/layouts/dashboard";
import { DashboardContent } from "@beep/ui/layouts/dashboard";
import { CustomBreadcrumbs, RouterLink } from "@beep/ui/routing";
import { removeLastSlash } from "@beep/ui-core/utils";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

// ----------------------------------------------------------------------

const NAV_ITEMS = [
  {
    label: "General",
    icon: <Iconify width={24} icon="solar:user-id-bold" />,
    href: paths.dashboard.user.account.root,
  },
  {
    label: "Billing",
    icon: <Iconify width={24} icon="solar:bill-list-bold" />,
    href: paths.dashboard.user.account.billing,
  },
  {
    label: "Notifications",
    icon: <Iconify width={24} icon="solar:bell-bing-bold" />,
    href: paths.dashboard.user.account.notifications,
  },
  {
    label: "Social links",
    icon: <Iconify width={24} icon="solar:share-bold" />,
    href: paths.dashboard.user.account.socials,
  },
  {
    label: "Security",
    icon: <Iconify width={24} icon="ic:round-vpn-key" />,
    href: paths.dashboard.user.account.changePassword,
  },
];

// ----------------------------------------------------------------------

export function AccountLayout({ children, ...other }: DashboardContentProps) {
  const pathname = usePathname();

  return (
    <DashboardContent {...other}>
      <CustomBreadcrumbs
        heading="Account"
        links={[
          { name: "Dashboard", href: paths.dashboard.root },
          { name: "User", href: paths.dashboard.user.root },
          { name: "Account" },
        ]}
        sx={{ mb: 3 }}
      />

      <Tabs value={removeLastSlash(pathname)} sx={{ mb: { xs: 3, md: 5 } }}>
        {NAV_ITEMS.map((tab) => (
          <Tab
            component={RouterLink}
            key={tab.href}
            label={tab.label}
            icon={tab.icon}
            value={tab.href}
            href={tab.href}
          />
        ))}
      </Tabs>

      {children}
    </DashboardContent>
  );
}
