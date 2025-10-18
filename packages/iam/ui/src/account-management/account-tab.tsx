import { PersonalInfoTabPanel } from "@beep/iam-ui/account-management/components/personal-info/PersonalInfoTabPanel";
import { PrivacyProtectionTabPanel } from "@beep/iam-ui/account-management/components/privacy-protection/PrivacyProtectionTabPanel";
import type { StringTypes } from "@beep/types";
import type { IconifyProps } from "@beep/ui/atoms/iconify/iconify";
import type { JSX } from "react";

type AccountTab<TabValue extends StringTypes.NonEmptyString> = {
  readonly value: TabValue;
  readonly label: string;
  readonly title: string;
  readonly icon: IconifyProps["icon"];
  readonly panelIcon: IconifyProps["icon"];
  readonly tabPanel: JSX.Element;
};

export type AccountTabUnion = AccountTab<"personal_information"> | AccountTab<"privacy_protection">;
// | AccountTab<"notification_alerts">
// | AccountTab<"accessibility">
// | AccountTab<"credit_card_information">
// | AccountTab<"date_time">
// | AccountTab<"users_permissions">
// | AccountTab<"shipping_billing_address">
// | AccountTab<"storage">
// | AccountTab<"touch_id">
// | AccountTab<"audio_video">
// | AccountTab<"chat_preferences">;

export const accountTabs = [
  {
    label: "Personal Information",
    title: "Personal Info",
    value: "personal_information",
    icon: "material-symbols:person-outline",
    panelIcon: "material-symbols:person-outline",
    tabPanel: <PersonalInfoTabPanel />,
  } as AccountTab<"personal_information">,
  {
    label: "Privacy & Protection",
    title: "Privacy & Protection",
    value: "privacy_protection",
    icon: "material-symbols:shield-outline",
    panelIcon: "material-symbols:shield-outline",
    tabPanel: <PrivacyProtectionTabPanel />,
  } as AccountTab<"privacy_protection">,
  // {
  //   label: "Language & Region",
  //   title: "Language & Region",
  //   value: "language_region",
  //   icon: "material-symbols:language",
  //   panelIcon: "material-symbols:language",
  //   tabPanel: <></>,
  // },
  // {
  //   label: "Notification & Alerts",
  //   title: "Notification & Alerts",
  //   value: "notification_alerts",
  //   icon: "material-symbols:notifications-outline-rounded",
  //   panelIcon: "material-symbols:notifications-outline-rounded",
  //   tabPanel: <></>,
  // },
  // {
  //   label: "Accessibility",
  //   title: "Accessibility",
  //   value: "accessibility",
  //   icon: "material-symbols:front-hand-outline-rounded",
  //   panelIcon: "material-symbols:front-hand-outline-rounded",
  //   tabPanel: <></>,
  // },
  // {
  //   label: "Credit Card Information",
  //   title: "Credit Card Information",
  //   value: "credit_card_information",
  //   icon: "material-symbols:credit-card-outline",
  //   panelIcon: "material-symbols:credit-card-outline",
  //   tabPanel: <></>,
  // },
  // {
  //   label: "Date & Time",
  //   title: "Date and Time",
  //   value: "date_time",
  //   icon: "material-symbols:calendar-month-outline-rounded",
  //   panelIcon: "material-symbols:calendar-month-outline-rounded",
  //   tabPanel: <></>,
  // },
  // {
  //   label: "Users & Permissions",
  //   title: "Users & Permissions",
  //   value: "users_permissions",
  //   icon: "material-symbols:manage-accounts-outline",
  //   panelIcon: "material-symbols:manage-accounts-outline",
  //   tabPanel: <></>,
  // },
  // {
  //   label: "Shipping & Billing Address",
  //   title: "Shipping & Billing Address",
  //   value: "shipping_billing_address",
  //   icon: "material-symbols:home-pin-outline",
  //   panelIcon: "material-symbols:home-pin-outline",
  //   tabPanel: <></>,
  // },
  // {
  //   label: "Storage",
  //   title: "Storage",
  //   value: "storage",
  //   icon: "material-symbols:data-usage",
  //   panelIcon: "material-symbols:data-usage",
  //   tabPanel: <></>,
  // },
  // {
  //   label: "Fingerprint Access Setup",
  //   title: "Fingerprint Access Setup",
  //   value: "touch_id",
  //   icon: "material-symbols:touch-app-outline",
  //   panelIcon: "material-symbols:touch-app-outline",
  //   tabPanel: <></>,
  // },
  // {
  //   label: "Audio & Video",
  //   title: "Audio & Video",
  //   value: "audio_video",
  //   icon: "material-symbols:video-settings-rounded",
  //   panelIcon: "material-symbols:video-settings-rounded",
  //   tabPanel: <></>,
  // },
  // {
  //   label: "Chat Preferences",
  //   title: "Chat Preferences",
  //   value: "chat_preferences",
  //   icon: "material-symbols:chat-outline-rounded",
  //   panelIcon: "material-symbols:chat-outline-rounded",
  //   tabPanel: <></>,
  // },
] as const;
