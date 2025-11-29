import type { Language } from "./types";

export const languages: Language[] = [
  { id: 1, name: "English (US)", label: "English (US)" },
  { id: 2, name: "English (UK)", label: "English (UK)" },
  { id: 3, name: "English (Australia)", label: "English (Australia)" },
  { id: 4, name: "English (Canada)", label: "English (Canada)" },
  { id: 5, name: "English (Ireland)", label: "English (Ireland)" },
  { id: 6, name: "English (India)", label: "English (India)" },
  { id: 7, name: "বাংলা", label: "Bengali" },
  { id: 8, name: "日本語", label: "Japanese" },
  { id: 9, name: "Française", label: "French" },
  { id: 10, name: "हिन्दी", label: "Hindi" },
];

export const regions = [
  "United States",
  "United Kingdom",
  "East Europe",
  "West Europe",
  "Africa",
  "Latin America",
  "Middle East",
  "South Asia",
  "Oceania",
] as const;
export const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
export const dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY/MM/DD", "DD-MM-YYYY", "MMMM D, YYYY"] as const;
export const numberFormats = ["12,34,567.89", "123,456.78", "123.456,78", "1,23,45,678.90", "123 456,78"] as const;
export const listSortOrders = [
  "Universal",
  "Alphabetical (A-Z)",
  "Alphabetical (Z-A)",
  "By Date (Newest First)",
  "By Date (Oldest First)",
] as const;
