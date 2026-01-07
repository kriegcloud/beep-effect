# @beep/comms-ui — Agent Guide

## Purpose & Fit
- Provides React UI components for the communications slice, enabling notification displays, messaging interfaces, and communication preference management.
- Contains components for notification bells, toast messages, inbox views, and email preference forms.
- Integrates with `@beep/comms-client` contracts via TanStack Query hooks for data fetching.
- Currently a minimal scaffold awaiting component implementations as the comms feature matures.

## Surface Map
- **(Scaffold)** — Package is initialized but awaiting component implementations. Future exports will include:
  - `NotificationBell` — Header notification indicator with dropdown
  - `NotificationList` — Paginated list of user notifications
  - `ToastProvider` — Context provider for toast notifications
  - `InboxView` — Messaging inbox component
  - `EmailPreferences` — Email notification settings form

## Usage Snapshots
- Next.js app imports notification components for header and dashboard layouts.
- Components use TanStack Query hooks wrapping comms contracts for data fetching.
- Real-time notification updates via WebSocket integration with Effect client runtime.
- Toast notifications display transient messages without persisting to database.

## Authoring Guardrails
- Always import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`) when using Effect utilities in components.
- Use `"use client"` directive for components requiring client-side interactivity.
- Follow MUI and Tailwind patterns from `@beep/ui-core` for consistent styling.
- Compose hooks from `@beep/runtime-client` for Effect integration in React components.
- Keep components focused on presentation — business logic should live in contracts or domain layer.
- Use React 19 patterns and avoid deprecated lifecycle methods.
- Consider accessibility (a11y) for notification components — screen reader announcements, focus management.

## Quick Recipes
- **Create a notification bell component**
  ```tsx
  "use client";
  import { Badge, IconButton, Popover } from "@mui/material";
  import NotificationsIcon from "@mui/icons-material/Notifications";
  import { useState } from "react";
  // import { useQuery } from "@tanstack/react-query";
  // import { notificationContract } from "@beep/comms-client";

  export function NotificationBell({ userId }: { userId: string }) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    // const { data: notifications } = useQuery({
    //   queryKey: ["notifications", userId, "unread"],
    //   queryFn: () => notificationContract.getUnread({ userId }),
    // });
    // const unreadCount = notifications?.length ?? 0;

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

- **Create a toast provider**
  ```tsx
  "use client";
  import { Snackbar, Alert } from "@mui/material";
  import { createContext, useContext, useState, useCallback } from "react";

  type ToastType = "success" | "error" | "warning" | "info";

  interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
  }

  const ToastContext = createContext<ToastContextValue | null>(null);

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

## Verifications
- `bun run check --filter @beep/comms-ui`
- `bun run lint --filter @beep/comms-ui`
- `bun run test --filter @beep/comms-ui`

## Contributor Checklist
- [ ] Add `"use client"` directive for interactive components.
- [ ] Follow MUI/Tailwind styling patterns from `@beep/ui-core`.
- [ ] Integrate with TanStack Query for data fetching via comms contracts.
- [ ] Ensure accessibility — ARIA labels, focus management, screen reader support.
- [ ] Add TypeScript doc comments for exported components.
- [ ] Create Storybook stories for visual component testing.
- [ ] Re-run verification commands above before handing work off.
