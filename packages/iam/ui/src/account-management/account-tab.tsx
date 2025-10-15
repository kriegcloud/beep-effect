import type { JSX } from "react";

type AccountTabShared = {
  readonly label: string;
  readonly title: string;
  readonly icon: string;
  readonly panelIcon: string;
  readonly tabPanel: JSX.Element;
};

export type AccountTab =
  | (AccountTabShared & { value: "personal_information" })
  | (AccountTabShared & { value: "work_education" })
  | (AccountTabShared & { value: "privacy_protection" })
  | (AccountTabShared & { value: "language_region" })
  | (AccountTabShared & { value: "notification_alerts" })
  | (AccountTabShared & { value: "accessibility" })
  | (AccountTabShared & { value: "credit_card_information" })
  | (AccountTabShared & { value: "date_time" })
  | (AccountTabShared & { value: "users_permissions" })
  | (AccountTabShared & { value: "shipping_billing_address" })
  | (AccountTabShared & { value: "storage" })
  | (AccountTabShared & { value: "touch_id" })
  | (AccountTabShared & { value: "audio_video" })
  | (AccountTabShared & { value: "chat_preferences" });

export const accountTabs: AccountTab[] = [
  {
    label: "Personal Information",
    title: "Personal Info",
    value: "personal_information",
    icon: "material-symbols:person-outline",
    panelIcon: "material-symbols:person-outline",
    tabPanel: <></>,
  },
  {
    label: "Work & Education",
    title: "Work & Education",
    value: "work_education",
    icon: "material-symbols:school-outline",
    panelIcon: "material-symbols:school-outline",
    tabPanel: <></>,
  },
  {
    label: "Privacy & Protection",
    title: "Privacy & Protection",
    value: "privacy_protection",
    icon: "material-symbols:shield-outline",
    panelIcon: "material-symbols:shield-outline",
    tabPanel: <></>,
  },
  {
    label: "Language & Region",
    title: "Language & Region",
    value: "language_region",
    icon: "material-symbols:language",
    panelIcon: "material-symbols:language",
    tabPanel: <></>,
  },
  {
    label: "Notification & Alerts",
    title: "Notification & Alerts",
    value: "notification_alerts",
    icon: "material-symbols:notifications-outline-rounded",
    panelIcon: "material-symbols:notifications-outline-rounded",
    tabPanel: <></>,
  },
  {
    label: "Accessibility",
    title: "Accessibility",
    value: "accessibility",
    icon: "material-symbols:front-hand-outline-rounded",
    panelIcon: "material-symbols:front-hand-outline-rounded",
    tabPanel: <></>,
  },
  {
    label: "Credit Card Information",
    title: "Credit Card Information",
    value: "credit_card_information",
    icon: "material-symbols:credit-card-outline",
    panelIcon: "material-symbols:credit-card-outline",
    tabPanel: <></>,
  },
  {
    label: "Date & Time",
    title: "Date and Time",
    value: "date_time",
    icon: "material-symbols:calendar-month-outline-rounded",
    panelIcon: "material-symbols:calendar-month-outline-rounded",
    tabPanel: <></>,
  },
  {
    label: "Users & Permissions",
    title: "Users & Permissions",
    value: "users_permissions",
    icon: "material-symbols:manage-accounts-outline",
    panelIcon: "material-symbols:manage-accounts-outline",
    tabPanel: <></>,
  },
  {
    label: "Shipping & Billing Address",
    title: "Shipping & Billing Address",
    value: "shipping_billing_address",
    icon: "material-symbols:home-pin-outline",
    panelIcon: "material-symbols:home-pin-outline",
    tabPanel: <></>,
  },
  {
    label: "Storage",
    title: "Storage",
    value: "storage",
    icon: "material-symbols:data-usage",
    panelIcon: "material-symbols:data-usage",
    tabPanel: <></>,
  },
  {
    label: "Fingerprint Access Setup",
    title: "Fingerprint Access Setup",
    value: "touch_id",
    icon: "material-symbols:touch-app-outline",
    panelIcon: "material-symbols:touch-app-outline",
    tabPanel: <></>,
  },
  {
    label: "Audio & Video",
    title: "Audio & Video",
    value: "audio_video",
    icon: "material-symbols:video-settings-rounded",
    panelIcon: "material-symbols:video-settings-rounded",
    tabPanel: <></>,
  },
  {
    label: "Chat Preferences",
    title: "Chat Preferences",
    value: "chat_preferences",
    icon: "material-symbols:chat-outline-rounded",
    panelIcon: "material-symbols:chat-outline-rounded",
    tabPanel: <></>,
  },
];
