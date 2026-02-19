// Shared types that can be used in both client and server components

export const TextStyle = {
  DEFAULT: "DEFAULT",
  SERIF: "SERIF",
  MONO: "MONO",
} as const;

export type TextStyle = (typeof TextStyle)[keyof typeof TextStyle];
