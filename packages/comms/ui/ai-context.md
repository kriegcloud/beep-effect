---
path: packages/comms/ui
summary: React components for notifications, toasts, and messaging interfaces (scaffold awaiting implementation)
tags: [comms, ui, react, mui, tanstack-query, notifications]
---

# @beep/comms-ui

React UI components for the communications slice. Provides notification displays, toast messages, inbox views, and communication preference forms. Integrates with `@beep/comms-client` contracts via TanStack Query. Currently a scaffold awaiting component implementations.

## Architecture

```
|-------------------|     |-------------------|
| NotificationBell  |---->|  TanStack Query   |
| ToastProvider     |     |  (useQuery)       |
| MessageList       |     |                   |
|-------------------|     |-------------------|
        |                         |
        v                         v
|-------------------|     |-------------------|
|  @beep/comms-     |---->|  Effect.runPromise|
|  client contracts |     |  (queryFn bridge) |
|-------------------|     |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `NotificationBell` | User notification indicator with badge count (planned) |
| `ToastProvider` | Context provider for transient toast messages (planned) |
| `MessageList` | Display message history (planned) |

## Usage Patterns

### Notification Bell Component

```tsx
"use client";
import * as Effect from "effect/Effect";
import { Badge, IconButton, Popover } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export function NotificationBell({ userId }: { userId: string }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // const { data: notifications } = useQuery({
  //   queryKey: ["notifications", userId, "unread"],
  //   queryFn: () => Effect.runPromise(notificationContract.getUnread({ userId })),
  // });

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={0} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
      >
        {/* Notification list */}
      </Popover>
    </>
  );
}
```

### Toast Provider

```tsx
"use client";
import { Snackbar, Alert } from "@mui/material";
import { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "warning" | "info";

const ToastContext = createContext<{ showToast: (msg: string, type?: ToastType) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");

  const showToast = useCallback((msg: string, t: ToastType = "info") => {
    setMessage(msg);
    setType(t);
    setOpen(true);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
        <Alert severity={type}>{message}</Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `"use client"` for interactive components | Required for useState, useContext, browser APIs in Next.js App Router |
| Effect.runPromise in queryFn | Bridge Effect contracts to TanStack Query's Promise-based API |
| MUI + Tailwind styling | Consistent with `@beep/ui-core` design system |
| ARIA live regions for toasts | Accessibility for screen readers; `polite` mode prevents flooding |

## Dependencies

**Internal**: `@beep/comms-client` (RPC contracts), `@beep/ui-core` (styling), `@beep/runtime-client` (Effect hooks)

**External**: `effect`, `@tanstack/react-query`, `@mui/material`, `react`

## Related

- **AGENTS.md** - React 19/Next.js 16 gotchas, TanStack Query invalidation, XSS prevention
