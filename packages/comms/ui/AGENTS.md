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
- ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`) when using Effect utilities in components.
- Use `"use client"` directive for components requiring client-side interactivity.
- Follow MUI and Tailwind patterns from `@beep/ui-core` for consistent styling.
- Compose hooks from `@beep/runtime-client` for Effect integration in React components.
- Keep components focused on presentation — business logic should live in contracts or domain layer.
- Use React 19 patterns and NEVER use deprecated lifecycle methods.
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

## Security

### XSS Prevention
- NEVER render notification content with `dangerouslySetInnerHTML` — use React's built-in escaping.
- ALWAYS sanitize any HTML content before rendering — use DOMPurify or similar libraries if HTML is required.
- User-provided notification titles and messages MUST be treated as untrusted — escape before display.

### Sensitive Data Display
- NEVER display full email addresses in UI — use masked formats (e.g., `j***@example.com`).
- Notification content MUST NOT include sensitive data (passwords, tokens, API keys) — reject such content at the server level.
- PREFER summary views over full content display — link to secure detail pages when needed.

### Client-Side Security
- NEVER store notification content in localStorage or sessionStorage — prefer in-memory state or encrypted storage.
- WebSocket connections MUST be established only after user authentication is verified.
- ALWAYS implement proper cleanup for notification subscriptions on component unmount to prevent memory leaks and stale handlers.

### Accessibility and Security Intersection
- Screen reader announcements for notifications MUST NOT read sensitive information aloud.
- ARIA live regions SHOULD use `polite` mode to prevent notification flooding attacks.
- Toast timeouts MUST be configurable for accessibility while preventing UI blocking attacks.

## Gotchas

### React 19 / Next.js 15 App Router
- The `"use client"` directive MUST be the first line of the file, BEFORE any imports. Misplacement causes silent server-side rendering.
- Notification components using `useState`, `useContext`, or browser APIs (`Notification` API) require `"use client"`.
- `useSearchParams()` suspends in App Router. Notification routing with URL state needs `<Suspense>` boundaries.

### TanStack Query Invalidation
- When marking notifications as read, invalidate both the unread count query AND the notification list query.
- Optimistic updates for "mark all read" operations should update cached unread counts immediately.
- Real-time notification streams (WebSocket) may conflict with TanStack Query. Consider shorter `staleTime` or manual cache updates via `queryClient.setQueryData`.

### Server vs Client Component Boundaries
- `NotificationBell` and `ToastProvider` require `"use client"` because they manage interactive state.
- Notification list fetching CAN happen in Server Components, but click handlers and real-time updates need Client Components.
- WebSocket connections for real-time notifications MUST be established only in Client Components after hydration.

### Effect Integration in React
- Notification fetch contracts return Effects. Bridge to TanStack Query using `Effect.runPromise` in `queryFn`.
- WebSocket message handling with Effect requires careful lifecycle management. Use `useEffect` cleanup to properly dispose Effect fibers.
- Toast state is typically React state, not Effect. Reserve Effect for async operations like API calls.

### Communication-Specific Pitfalls
- Browser `Notification` API requires user permission. Always check `Notification.permission` before attempting to show native notifications.
- Toast stacking can overwhelm users. Implement a maximum visible toast limit and queue excess notifications.
- WebSocket reconnection logic must handle authentication token refresh. Stale tokens cause silent connection failures.
- Notification timestamps should use `effect/DateTime` for display. NEVER use native `Date` for formatting.
- Email preference changes may not take effect immediately. Show users appropriate feedback about propagation delays.

## Contributor Checklist
- [ ] Add `"use client"` directive for interactive components.
- [ ] Follow MUI/Tailwind styling patterns from `@beep/ui-core`.
- [ ] Integrate with TanStack Query for data fetching via comms contracts.
- [ ] Ensure accessibility — ARIA labels, focus management, screen reader support.
- [ ] Add TypeScript doc comments for exported components.
- [ ] Create Storybook stories for visual component testing.
- [ ] Verify no dangerouslySetInnerHTML usage with untrusted content.
- [ ] Re-run verification commands above before handing work off.
