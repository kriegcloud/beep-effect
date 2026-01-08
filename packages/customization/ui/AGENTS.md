# @beep/customization-ui — Agent Guide

## Purpose & Fit
- Provides React UI components for the customization slice, enabling user preference management in the frontend.
- Contains components for hotkey configuration, theme selection, and other personalization features.
- Integrates with `@beep/customization-client` contracts via TanStack Query hooks.
- Currently a minimal scaffold awaiting component implementations as the customization feature matures.

## Surface Map (Exports)

> **Status**: Awaiting implementation - no exports yet

Planned components will include theme customization UI.

## Usage Snapshots
- Next.js app imports components from this package for settings pages.
- Components use TanStack Query hooks wrapping customization contracts for data fetching.
- Theme and preference components integrate with client-side ManagedRuntime for Effect-based state.
- Storybook stories showcase component variants and interactions.

## Authoring Guardrails
- ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`) when using Effect utilities in components.
- Use `"use client"` directive for components requiring client-side interactivity.
- Follow MUI and Tailwind patterns from `@beep/ui-core` for consistent styling.
- Compose hooks from `@beep/runtime-client` for Effect integration in React components.
- Keep components focused on presentation — business logic should live in contracts or domain layer.
- Use React 19 patterns and NEVER use deprecated lifecycle methods.

### Accessibility (a11y)
- ALWAYS include proper ARIA labels on interactive elements (buttons, inputs, toggles).
- ALWAYS ensure keyboard navigation works for all components—users must be able to tab through and activate controls.
- ALWAYS maintain sufficient color contrast ratios (WCAG AA minimum: 4.5:1 for normal text, 3:1 for large text).
- ALWAYS provide visible focus indicators for keyboard users.
- NEVER rely solely on color to convey information—use icons, text, or patterns as secondary indicators.

## Quick Recipes
- **Create a hotkey settings component**
  ```tsx
  "use client";
  import { useQuery } from "@tanstack/react-query";
  import { Box, Typography } from "@mui/material";
  // import { hotkeyContract } from "@beep/customization-client";

  export function HotkeySettings({ userId }: { userId: string }) {
    // const { data: hotkeys, isLoading } = useQuery({
    //   queryKey: ["hotkeys", userId],
    //   queryFn: () => hotkeyContract.get({ userId }),
    // });

    return (
      <Box>
        <Typography variant="h6">Keyboard Shortcuts</Typography>
        {/* Hotkey configuration UI */}
      </Box>
    );
  }
  ```

## Verifications
- `bun run check --filter @beep/customization-ui`
- `bun run lint --filter @beep/customization-ui`
- `bun run test --filter @beep/customization-ui`

## Testing

- Type check: `bun run check --filter=@beep/customization-ui`
- Visual testing via Storybook (if available)
- ALWAYS verify component accessibility

## Gotchas

### React 19 / Next.js 15 App Router
- The `"use client"` directive MUST be the first line of the file, BEFORE any imports. Next.js silently runs misplaced client components on the server.
- Settings/preference components require `"use client"` because they use hooks for state management.
- `useSearchParams()` suspends in App Router. Preference pages with URL-based state need `<Suspense>` boundaries.

### TanStack Query Invalidation
- After saving user preferences, invalidate ALL queries that depend on those preferences (e.g., theme, hotkeys).
- Optimistic updates for preference toggles should immediately reflect in UI while the save is in progress.
- Preference changes may affect multiple components across the app. Use broad invalidation patterns like `queryClient.invalidateQueries({ queryKey: ["preferences"] })`.

### Server vs Client Component Boundaries
- Theme selection components need `"use client"` due to MUI `ThemeProvider` interaction.
- Hotkey configuration requires `"use client"` because it listens to keyboard events.
- Preference display (read-only) can be a Server Component, but editing forms must be Client Components.

### Effect Integration in React
- Preference save contracts return Effects. Use `Effect.runPromise` in mutation handlers or TanStack Query `mutationFn`.
- Effect schemas validate preference values. Use `S.decodeUnknownSync` for immediate form validation feedback.
- NEVER construct Effects during render. Create them in event handlers or `useEffect`.

### Customization-Specific Pitfalls
- Theme changes may cause full-page re-renders. Ensure `ThemeProvider` is high in the component tree to minimize re-render scope.
- Hotkey conflicts between application shortcuts and browser shortcuts (e.g., Ctrl+S) require careful handling.
- Preference persistence timing matters. Save preferences on blur or with debouncing, not on every keystroke.
- Local preference overrides (via localStorage) may conflict with server-synced preferences. Establish clear precedence rules.
- Accessibility settings (font size, contrast) affect all `@beep/ui` components. Test changes across the entire application.

## Contributor Checklist
- [ ] Add `"use client"` directive for interactive components.
- [ ] Follow MUI/Tailwind styling patterns from `@beep/ui-core`.
- [ ] Integrate with TanStack Query for data fetching via customization contracts.
- [ ] Add TypeScript doc comments for exported components.
- [ ] Create Storybook stories for visual component testing.
- [ ] Re-run verification commands above before handing work off.
