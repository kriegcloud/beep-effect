import { assetPaths } from "@beep/constants";
import type { WorkspacesPopoverProps } from "./components/workspaces-popover";
export const _workspaces: WorkspacesPopoverProps["data"] = [
  {
    id: "team-1",
    name: "Team 1",
    plan: "Free",
    logo: assetPaths.assets.icons.workspaces.logo1,
  },
  {
    id: "team-2",
    name: "Team 2",
    plan: "Pro",
    logo: assetPaths.assets.icons.workspaces.logo2,
  },
  {
    id: "team-3",
    name: "Team 3",
    plan: "Pro",
    logo: assetPaths.assets.icons.workspaces.logo3,
  },
];
