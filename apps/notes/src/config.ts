import { Icons } from "@beep/notes/components/ui/icons";
import { env } from "@beep/notes/env";

export type NavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
  href?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export type SiteConfig = {
  author: {
    name: string;
    url: URL | string;
    x: string;
  };
  description: string;
  footerItems: NavItem[];
  keywords: string[];
  links: {
    discord: string;
    docs: string;
    github: string;
    x: string;
  };
  name: string;
  ogImage: string;
  publisher: string;
  socialLinks: NavItem[];
  support: string;
  url: string;
};

const siteLinks = {
  discord: "https://discord.gg/mAZRuBzGM3",
  docs: "https://todox.com",
  github: "https://github.com/udecode/plate",
  x: "https://x.com/zbeyens",
};

export const siteConfig: SiteConfig = {
  author: {
    name: "Todox",
    url: "https://todox.com/",
    x: "https://x.com/zbeyens",
  },
  description: "Todox editor",
  footerItems: [
    { href: "/terms", title: "Terms of Use" },
    { href: "/privacy", title: "Privacy" },
    { href: "/faq", title: "FAQ" },
  ],
  keywords: ["Plate", "Editor", "Rich Text", "WYSIWYG"],
  links: siteLinks,
  name: "Todox",
  ogImage: "/og.png",
  publisher: "zbeyens",
  socialLinks: [
    {
      href: siteLinks.x,
      icon: Icons.logoX,
      title: "X",
    },
    {
      href: siteLinks.discord,
      icon: Icons.logoDiscord,
      title: "Discord",
    },
  ],
  support: "zbeyens@udecode.dev",
  url: env.NEXT_PUBLIC_SITE_URL,
};

export const META_THEME_COLORS = {
  dark: "#09090b",
  light: "#ffffff",
};
