# Form Validation Message

Use this file when building or reviewing form validation UX.

## Scope

- A validation message is a single inline message attached to one form control.
- The message exists to help the user finish the task.
- It should explain why a value is invalid and help the user correct it.
- It is not enough to show a generic invalid state without recovery guidance.

## One Message Per Control

- Show a single validation message for a form control.
- Keep the message specific to that control's current problem.
- Do not stack multiple competing inline messages for the same control.

## Grouped Inputs

- An individual checkbox or radio must not have its own validation message.
- An individual checkbox or radio must not have its own validation style as though it were validated separately.
- For checkbox groups and radio groups, validate the group as one unit.
- Show one validation message for the group container, legend, or equivalent field wrapper.

## Captions And Validation Messages

- Do not repeat caption information in the validation message.
- When the caption becomes redundant with the validation message, remove or hide the caption while the validation message is shown.
- Keep the caption only if it adds distinct information that still helps during the error state.
- The validation message should have stronger salience than a redundant caption because it helps users scan for invalid fields.

## What Error Messages Must Do

- Every invalid field must have a message explaining why the value does not pass validation.
- The message must help the user recover, not just label the state.
- The message must guide the user toward a valid value.
- The goal is to unblock the user from completing the task.

## Success Messages

- Error messages are required for invalid fields.
- Success messages are optional.
- Use a success message only when the user benefits from extra reassurance that the value is valid.
- A good example is a field where validity is uncertain or externally checked, such as name availability.
- If success is already obvious, do not add extra confirmation.

## Validation Timing

### Default Behavior

- Default to validation on submit.
- This lets users move through the form without interruption.

### After Failed Submit

- After a submit attempt fails validation, inline validation may begin.
- Once the form has established that a field is invalid, faster follow up feedback is acceptable.

### Do Not Validate Too Early

- Do not validate an input before the user is done with it.
- If the control is currently valid, wait until the user has made a change and then removed focus before validating.
- Avoid showing premature inline errors on untouched or in progress fields.

### Revalidate While Editing Only After Invalid State Exists

- After a field has already been validated and is currently invalid, validation may run while the user is typing or changing the selection.
- This lets the error clear as soon as the user fixes the problem.

### Slow Validation

- If validation is likely to take more than one second, show a loading indicator.

## Accessibility Requirements

- Do not use browser native validation UI.
- Native browser validation messages are not an acceptable pattern here.
- Mark every invalid input with `aria-invalid="true"`.
- Tie each inline validation message to its invalid input with `aria-describedby`.
- If the validation message is removed from the DOM, also remove the matching `aria-describedby` reference.
- Do not use live regions for form validation.
- Use focus management and semantic relationships instead.

## Focus Management

- On submit failure, move focus intentionally.
- Focus the first invalid field, or focus the interactive error summary when one is present.
- If the summary is a banner with links, focus the banner when it appears.
- If the summary has no focusable elements, focus its heading.
- Activating a summary link should move focus to the corresponding input.

## Error Summaries

- If a form has three or more errors, an interactive summary may be shown.
- Place the summary in a banner at the top of the form.
- List invalid inputs as anchor style links.
- Each link should move focus to the related input.
- The summary supplements inline messages. It does not replace them.

## Inline Validation Risks

- Inline validation can interrupt flow if shown too early.
- Server side validation can make inline feedback feel slow.
- Screen reader users can experience extra interruption if validation keeps firing while they move through fields.
- This is why validation on submit is the default and early validation should be limited.

## Practical Do Rules

- Show one inline validation message per control.
- Validate checkbox groups and radio groups at the group level.
- Explain why the current value is invalid.
- Tell the user enough to reach a valid value.
- Hide a caption when it only duplicates the error message.
- Use `aria-invalid` and `aria-describedby` correctly.
- Remove stale accessibility references when the message disappears.
- Use focus movement instead of live regions.
- Show a loading indicator for slow validation.

## Practical Do Not Rules

- Do not show a separate validation message for each checkbox or radio inside a group.
- Do not repeat the caption inside the error message.
- Do not use generic invalid text that fails to explain recovery.
- Do not rely on browser native validation UI.
- Do not use live regions for form validation.
- Do not validate before the user is done with the field.
- Do not leave `aria-describedby` pointing at a message that no longer exists.

## Pattern Selection Guide

- Simple form success usually needs no extra message beyond the visible resulting state.
- Complex form success can use a persistent confirmation pattern if additional reassurance is useful.
- Field level invalid states need inline validation messages connected to the field.
- Multi error forms may add an error summary banner on top of the inline messages.

## Review Checklist

- Does each invalid field have a clear recovery message?
- Are grouped choices validated at the group level?
- Is any caption hidden when it becomes redundant?
- Is validation delayed until submit or blur unless the field is already invalid?
- Does slow validation show progress?
- Are `aria-invalid` and `aria-describedby` correct?
- Are live regions avoided?
- Does submit failure move focus to the first invalid field or the summary?
- If there are many errors, does the summary link back to the fields?
