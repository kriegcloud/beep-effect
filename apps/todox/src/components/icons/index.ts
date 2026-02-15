"use client";

export type { Icon } from "@phosphor-icons/react";

// ---------------------------------------------------------------------------
// Size presets
// ---------------------------------------------------------------------------

export const iconSizes = { sm: 16, md: 20, lg: 24, xl: 32 } as const;

export type IconSize = keyof typeof iconSizes;

export const iconSize = (size: IconSize): number => iconSizes[size];

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export {
  BookOpenIcon,
  CalendarIcon,
  CheckSquareIcon,
  FolderIcon,
  GearIcon,
  GridFourIcon,
  HouseIcon,
  PlusIcon,
  RobotIcon,
  StarIcon,
} from "@phosphor-icons/react";

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export {
  ArchiveIcon,
  BellIcon,
  BuildingsIcon,
  ClockIcon,
  CreditCardIcon,
  CrownIcon,
  LinkIcon,
  LockIcon,
  PlugIcon,
  UserIcon,
  UsersIcon,
} from "@phosphor-icons/react";

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export {
  CaretDownIcon,
  CaretRightIcon,
  DotsThreeIcon,
  MagnifyingGlassIcon,
  SidebarIcon,
} from "@phosphor-icons/react";

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

export {
  MoonIcon,
  SignOutIcon,
  SunIcon,
} from "@phosphor-icons/react";
