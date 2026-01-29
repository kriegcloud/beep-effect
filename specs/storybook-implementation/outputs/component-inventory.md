# Component Inventory - @beep/ui and @beep/ui-editor

**Inventory Date**: 2026-01-29

---

## Summary

| Package | Component Files | Status |
|---------|-----------------|--------|
| @beep/ui | 271 .tsx files | Active |
| @beep/ui-editor | 0 components | Stub package |
| @beep/ui-spreadsheet | Formula engine only | No UI components |
| Lexical Editor (apps/todox) | 90+ files | Not extracted |

---

## @beep/ui Component Directories

| Directory | Count | Purpose |
|-----------|-------|---------|
| components/ | 53 | shadcn/ui primitives |
| atoms/ | 6 | Base visual elements |
| molecules/ | 6 | Composed elements |
| organisms/ | 10 | Complex widgets |
| inputs/ | 30+ | Form inputs |
| layouts/ | 35+ | Page layouts |
| animate/ | 10 | Animation components |
| flexlayout-react/ | 18 | Docking layout system |
| routing/ | 25+ | Navigation components |
| form/ | 5 | Form components |
| settings/ | 8 | Settings UI |
| icons/ | 8 | SVG icon components |
| progress/ | 4 | Loading indicators |
| sections/ | 3 | Error pages |
| providers/ | 3 | Context providers |

---

## Complex Components (>200 lines)

| Component | Path | Lines | Dependencies |
|-----------|------|-------|--------------|
| Layout (FlexLayout) | flexlayout-react/view/Layout.tsx | 1295 | Internal |
| Sidebar | components/sidebar.tsx | 625 | radix-ui |
| TabSet (FlexLayout) | flexlayout-react/view/TabSet.tsx | 488 | Internal |
| SettingsDrawer | settings/drawer/settings-drawer.tsx | 312 | @mui/material |
| Toolbar | components/toolbar.tsx | 287 | radix-ui |
| TabOverflowHook | flexlayout-react/view/TabOverflowHook.tsx | 274 | Internal |
| BorderTabSet | flexlayout-react/view/BorderTabSet.tsx | 267 | Internal |
| DashboardLayout | layouts/dashboard/layout.tsx | 264 | @mui/material |
| OTPInput | inputs/otp-input/OTPInput.tsx | 248 | @mui/material |
| Splitter | flexlayout-react/view/Splitter.tsx | 243 | Internal |
| PasswordFieldsGroup | form/groups/PasswordFieldsGroup.tsx | 235 | @mui/material |
| NavItem (mini) | routing/nav-section/mini/nav-item.tsx | 221 | @mui/material |
| DropdownMenu | components/dropdown-menu.tsx | 215 | radix-ui |
| AnimateBorder | animate/animate-border.tsx | 213 | framer-motion |
| CountryField | inputs/CountryField.tsx | 212 | @mui/material |
| Field | components/field.tsx | 207 | radix-ui |
| ComponentLayout | layouts/component-layout/component-layout.tsx | 203 | @mui/material |
| NavItem (horizontal) | routing/nav-section/horizontal/nav-item.tsx | 201 | @mui/material |
| Searchbar | layouts/components/searchbar/index.tsx | 199 | @mui/material |
| ContextMenu | components/context-menu.tsx | 193 | radix-ui |
| Markdown | data-display/markdown/markdown.tsx | 191 | react-markdown |

---

## shadcn/ui Components (components/)

| Component | Path | Variants | Dependencies |
|-----------|------|----------|--------------|
| Accordion | accordion.tsx | 3 | radix-ui |
| Alert | alert.tsx | 4 | radix-ui |
| AlertDialog | alert-dialog.tsx | 8 | radix-ui |
| Avatar | avatar.tsx | 3 | radix-ui |
| Badge | badge.tsx | 5 | - |
| Button | button.tsx | 6 | radix-ui |
| Calendar | calendar.tsx | 2 | react-day-picker |
| Card | card.tsx | 5 | - |
| Checkbox | checkbox.tsx | 1 | radix-ui |
| Command | command.tsx | 8 | cmdk |
| Dialog | dialog.tsx | 8 | radix-ui |
| Drawer | drawer.tsx | 6 | vaul |
| DropdownMenu | dropdown-menu.tsx | 14 | radix-ui |
| Input | input.tsx | 1 | - |
| Label | label.tsx | 1 | radix-ui |
| Popover | popover.tsx | 3 | radix-ui |
| Progress | progress.tsx | 1 | radix-ui |
| RadioGroup | radio-group.tsx | 2 | radix-ui |
| ScrollArea | scroll-area.tsx | 3 | radix-ui |
| Select | select.tsx | 9 | radix-ui |
| Sheet | sheet.tsx | 6 | radix-ui |
| Sidebar | sidebar.tsx | 15+ | radix-ui |
| Skeleton | skeleton.tsx | 1 | - |
| Slider | slider.tsx | 1 | radix-ui |
| Switch | switch.tsx | 1 | radix-ui |
| Table | table.tsx | 7 | - |
| Tabs | tabs.tsx | 4 | radix-ui |
| Textarea | textarea.tsx | 1 | - |
| Toast | toast.tsx | 5 | radix-ui |
| Toggle | toggle.tsx | 3 | radix-ui |
| Toolbar | toolbar.tsx | 12 | radix-ui |
| Tooltip | tooltip.tsx | 3 | radix-ui |

---

## Input Components (inputs/)

| Component | Path | Dependencies |
|-----------|------|--------------|
| AutocompleteField | AutocompleteField.tsx | @mui/material |
| CheckboxField | CheckboxField.tsx | @mui/material |
| ColorField | ColorField.tsx | @mui/material |
| ColorPicker | color/color-picker.tsx | @mui/material |
| CountryField | CountryField.tsx | @mui/material |
| DatePickerField | DatePickerField.tsx | @mui/x-date-pickers |
| DateTimePickerField | DateTimePickerField.tsx | @mui/x-date-pickers |
| EmojiField | EmojiField.tsx | emoji-mart |
| MultiCheckboxField | MultiCheckboxField.tsx | @mui/material |
| MultiSelectField | MultiSelectField.tsx | @mui/material |
| OTPField | OTPField.tsx | @mui/material |
| OTPInput | otp-input/OTPInput.tsx | @mui/material |
| PhoneField | PhoneField.tsx | react-phone-number-input |
| PhoneInput | phone-input/phone-input.tsx | react-phone-number-input |
| RadioField | RadioField.tsx | @mui/material |
| RatingField | RatingField.tsx | @mui/material |
| SelectField | SelectField.tsx | @mui/material |
| SliderField | SliderField.tsx | @mui/material |
| SwitchField | SwitchField.tsx | @mui/material |
| TextField | TextField.tsx | @mui/material |
| Upload | upload/default/upload-default.tsx | react-dropzone |
| UploadAvatar | upload/avatar/upload-avatar.tsx | react-dropzone |
| UploadBox | upload/box/upload-box.tsx | react-dropzone |

---

## Layout Components (layouts/)

| Component | Path | Dependencies |
|-----------|------|--------------|
| AuthSplitLayout | auth-split/layout.tsx | @mui/material |
| ComponentLayout | component-layout/component-layout.tsx | @mui/material |
| DashboardLayout | dashboard/layout.tsx | @mui/material |
| DashboardContent | dashboard/content.tsx | @mui/material |
| NavHorizontal | dashboard/nav-horizontal.tsx | @mui/material |
| NavMobile | dashboard/nav-mobile.tsx | @mui/material |
| NavVertical | dashboard/nav-vertical.tsx | @mui/material |
| MainLayout | main/layout.tsx | @mui/material |
| Footer | main/footer.tsx | @mui/material |
| SimpleLayout | simple/layout.tsx | @mui/material |
| AccountButton | components/account-button.tsx | framer-motion |
| AccountDrawer | components/account-drawer.tsx | @mui/material |
| AccountPopover | components/account-popover.tsx | @mui/material |
| NotificationsDrawer | components/notifications-drawer/index.tsx | framer-motion |
| Searchbar | components/searchbar/index.tsx | @mui/material |
| WorkspacesPopover | components/workspaces-popover.tsx | @mui/material |

---

## External Dependencies Summary

| Dependency | Component Count | Category |
|------------|-----------------|----------|
| @mui/material | 150+ | Core styling |
| radix-ui/* | 28 packages | Shadcn primitives |
| @mui/x-date-pickers | 2 | Date inputs |
| framer-motion | 20+ | Animations |
| @iconify/react | 1 | Icons |
| react-dropzone | 4 | File upload |
| sonner | 3 | Toasts |
| react-markdown | 1 | Markdown |
| emoji-mart | 1 | Emoji picker |
| react-phone-number-input | 2 | Phone input |
| cmdk | 1 | Command palette |
| vaul | 1 | Drawer |

---

## @beep/ui-editor Status

**Current State**: Empty stub package

**Location**: packages/ui/editor/

**Files Present**:
- AGENTS.md
- README.md
- reset.d.ts
- test/Dummy.test.ts

**Action Required**: Extract Lexical editor from apps/todox to this package.

---

## Lexical Editor (apps/todox - Not Extracted)

**Location**: apps/todox/src/app/lexical/

### Plugin Count: 40+

**Complex Plugins (>200 lines)**:
- TableActionMenuPlugin (846+ lines)
- CommentPlugin (631+ lines)
- MentionsPlugin (580+ lines)
- ToolbarPlugin (529+ lines)
- FloatingTextFormatToolbarPlugin (444+ lines)
- TableCellResizer (439+ lines)
- FloatingLinkEditorPlugin (418+ lines)
- TableHoverActionsV2Plugin (411+ lines)
- TestRecorderPlugin (409+ lines)
- ComponentPickerPlugin (382+ lines)
- AutoEmbedPlugin (318+ lines)

### Node Count: 15+
- AutocompleteNode, DateTimeNode, EmojiNode, EquationNode
- ExcalidrawNode, FigmaNode, ImageNode
- LayoutContainerNode, LayoutItemNode, PageBreakNode
- PollNode, StickyNode, TweetNode, YouTubeNode

---

## Priority for Storybook Documentation

### Tier 1: Core Primitives (Document First)
1. Button, Input, Select, Checkbox - Base form controls
2. Dialog, Sheet, Drawer - Modal patterns
3. Dropdown, Popover, Tooltip - Overlays
4. Table, Card, Badge - Data display
5. Tabs, Accordion - Content organization

### Tier 2: Complex Components
1. Sidebar (625 lines) - Navigation
2. Toolbar (287 lines) - Actions
3. DashboardLayout (264 lines) - App shell
4. OTPInput (248 lines) - Auth flow
5. SettingsDrawer (312 lines) - Configuration

### Tier 3: Form System
1. TextField, SelectField, CheckboxField
2. DatePickerField, PhoneField, CountryField
3. Upload components (Avatar, Box, Default)
4. Form, FormDialog, SubmitButton

### Tier 4: FlexLayout (Specialized)
The FlexLayout system is a forked docking library.
Consider separate documentation approach.

### Tier 5: Lexical Editor (Future)
Extract to @beep/ui-editor before documenting.

---

## File Paths Reference

Base: `/home/elpresidank/YeeBois/projects/beep-effect/`

- **@beep/ui**: `packages/ui/ui/src/`
- **@beep/ui-core**: `packages/ui/core/src/`
- **@beep/ui-editor**: `packages/ui/editor/` (stub)
- **@beep/ui-spreadsheet**: `packages/ui/spreadsheet/src/`
- **Lexical Editor**: `apps/todox/src/app/lexical/`
