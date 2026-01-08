"use client";

import type * as React from "react";
import {
  SquaresFourIcon,
  RobotIcon,
  BookOpenIcon,
  GearIcon,
  FrameCornersIcon,
  ChartPieIcon,
  MapPinIcon,
  BuildingsIcon,
  WaveformIcon,
  TerminalIcon,
} from "@phosphor-icons/react";

import { NavMain, type NavMainItem } from "./nav-main";
import { NavProjects, type Project } from "./nav-projects";
import { NavUser, type User } from "./nav-user";
import { TeamSwitcher, type Team } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@beep/todox/components/ui/sidebar";

// Sample data - can be replaced with actual data
const data = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/john.jpg",
  } satisfies User,
  teams: [
    {
      name: "Acme Inc",
      logo: BuildingsIcon,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: WaveformIcon,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: TerminalIcon,
      plan: "Free",
    },
  ] satisfies Team[],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquaresFourIcon,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: RobotIcon,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpenIcon,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: GearIcon,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ] satisfies NavMainItem[],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: FrameCornersIcon,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: ChartPieIcon,
    },
    {
      name: "Travel",
      url: "#",
      icon: MapPinIcon,
    },
  ] satisfies Project[],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
