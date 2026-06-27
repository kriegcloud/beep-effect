# Accessible Notifications And Messages

Use this file when working on notifications, alerts, banners, validation messages, long running task updates, or any UI that might otherwise become a toast.

## Overview

- Communicate updates in ways that are perceivable, understandable, persistent when needed, and connected to the UI that caused them.
- Prefer message patterns that fit the task and stay available long enough for people to notice, review, and act.
- Treat auto dismissing overlay messages as the exception to avoid, not the default.

## Assistive Technology Announcements

- Always announce changes in location so users understand where they are.
- Always announce failed user actions, including validation failures and system errors that happen right after an attempted action.
- Announce other dynamic changes only when they are important enough to justify interruption.
- Some changes are distracting if announced every time, such as presence updates or unrelated comments arriving elsewhere.
- Some changes are important enough to announce, such as essential streaming updates or task output that changes the current experience.

## Toasts

- Toasts are small popup style notifications, often placed near a viewport corner and often dismissed automatically after a short timeout.
- Do not use toast notifications in this repo.
- Even when toasts feel convenient, they create repeated accessibility and usability problems.
- Prefer more established and more durable patterns for communicating updates.

## What To Use Instead

### Successful Simple Actions

- If success is already obvious in the UI, do not add extra confirmation.
- Example: creating something and then seeing it appear in the interface is often enough.
- Redundant success messaging can reduce trust instead of improving clarity.

### Successful Complex Actions

- For multi step or bulk actions, add persistent secondary feedback.
- Good options include a banner that summarizes the result or progressively revealing the generated content.
- Feedback for complex work should persist. It should not disappear on its own.

### Unsuccessful Actions

- Use banners when the error should remain visible without taking over the workflow.
- Use dialogs when the user must stop and address the problem before continuing.

### Successful Forms

- Simple forms often need no extra confirmation beyond showing the new or updated content.
- More complex forms can use an interstitial confirmation view or a persistent banner explaining what happened.

### Validation

- Keep validation messages near the field or form.
- Reuse the product's existing validation patterns instead of inventing a new notification channel.

### Long Running Tasks

- When a task completes or fails later, use a persistent banner in the product.
- Also consider secondary channels such as email, app notifications, or other durable notification systems when appropriate.

### Desynchronized Application State

- If the client is out of sync with the server, use a banner or dialog that explains the problem and the next step, such as refreshing.

## Accessibility Risks

- Time limited messages are a problem because users need enough time to notice, move to, read, and act.
- Messages that live far from the triggering UI can break meaningful reading order and weaken comprehension.
- Interactive controls inside transient messages create keyboard and focus management problems.
- Status updates must still be exposed to assistive technology in a non disruptive way.
- Text resizing and narrow viewport reflow can make popup style messages too large, clipped, or horizontally scrollable.
- Focus order can become confusing when an overlay is far away from the UI that caused it.
- Notification patterns should stay consistent across the product so users can recognize them reliably.

## Usability Risks

- On large displays, corner based popups are easy to miss.
- During multitasking or tab switching, auto dismissing messages can disappear before they are seen.
- Floating overlays can cover important controls or content.
- Users with screen magnification may never see a popup that appears outside the magnified region.
- Users may forget or lose important information if it disappears and cannot be reviewed again.
- Because toast style UI is overused across the web, many users learn to ignore it.
- A message shown far from its related UI can feel disconnected and confusing.
- Keyboard dismissal can conflict with other escape driven UI and lead to accidental dismissal.

## Practical Decision Rule

- If you are about to add a toast, stop.
- Choose a persistent inline message, validation message, banner, dialog, or visible state change instead.
- Pick the least disruptive pattern that still keeps the message understandable and available long enough.
