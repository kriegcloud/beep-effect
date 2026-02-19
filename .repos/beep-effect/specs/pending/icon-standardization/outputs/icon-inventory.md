# Icon Inventory

## Summary

- **Total unique Iconify icons**: 49 (excluding social/custom variants counted separately)
- **Total unique Lucide icons**: 11
- **MUI override SVG components**: 11 files, ~25 custom SVG icon components
- **Iconify wrapper usages**: 47 files (39 in packages/, 8 in apps/todox)
- **Lucide-react usages**: 8 files (5 in packages/, 3 in apps/todox)
- **MUI override SVG files**: 11 files in packages/ui/core/src/theme/core/components/
- **Custom/brand icons requiring special handling**: 10 (4 custom:, 6 socials:)

## Icon Mapping Table

### Iconify: Solar Icons

| Current Icon | Phosphor Replacement | Weight | Notes |
|---|---|---|---|
| `solar:eye-bold` | `EyeIcon` | bold | Password visibility toggle |
| `solar:eye-closed-bold` | `EyeClosedIcon` | bold | Password visibility toggle (hidden) |
| `solar:home-angle-bold-duotone` | `HouseIcon` | duotone | Dashboard home nav |
| `solar:notes-bold-duotone` | `NotepadIcon` | duotone | Notes nav item |
| `solar:shield-keyhole-bold-duotone` | `ShieldCheckIcon` | duotone | Security nav; no exact "keyhole" variant, ShieldCheck is closest |
| `solar:settings-bold-duotone` | `GearSixIcon` | duotone | Settings nav/notifications |
| `solar:bell-bing-bold-duotone` | `BellRingingIcon` | duotone | Notification bell |
| `solar:users-group-rounded-bold-duotone` | `UsersThreeIcon` | duotone | Contacts/users group |
| `solar:trash-bin-trash-bold` | `TrashIcon` | bold | Delete action |
| `solar:info-circle-bold` | `InfoIcon` | bold | Info snackbar |
| `solar:check-circle-bold` | `CheckCircleIcon` | bold | Success snackbar |
| `solar:danger-triangle-bold` | `WarningIcon` | bold | Warning snackbar |
| `solar:danger-bold` | `WarningCircleIcon` | bold | Error snackbar / spam label |
| `solar:camera-add-bold` | `CameraPlusIcon` | bold | Upload avatar placeholder |
| `solar:double-alt-arrow-up-bold-duotone` | `CaretDoubleUpIcon` | duotone | Back to top button |
| `solar:restart-bold` | `ArrowCounterClockwiseIcon` | bold | Reset/restart settings |
| `solar:quit-full-screen-square-outline` | `ArrowsInIcon` | regular | Exit fullscreen |
| `solar:full-screen-square-outline` | `ArrowsOutIcon` | regular | Enter fullscreen |
| `solar:pen-bold` | `PenIcon` | bold | Compose mail |
| `solar:letter-bold` | `EnvelopeIcon` | bold | Mail/letter label |
| `solar:chat-round-dots-bold` | `ChatCircleDotsIcon` | bold | Chat toggle |
| `solar:archive-down-minimlistic-bold` | `ArchiveIcon` | bold | Archive mail |
| `solar:letter-unread-bold` | `EnvelopeOpenIcon` | bold | Mark unread |
| `solar:reply-bold` | `ArrowBendUpLeftIcon` | bold | Reply to mail |
| `solar:multiple-forward-left-broken` | `ArrowBendDoubleUpLeftIcon` | bold | Reply all |
| `solar:forward-bold` | `ArrowBendUpRightIcon` | bold | Forward mail |
| `solar:gallery-add-bold` | `ImageIcon` | bold | Add image/gallery |
| `solar:inbox-bold` | `TrayIcon` | bold | Inbox label |
| `solar:file-text-bold` | `FileTextIcon` | bold | Drafts label |
| `solar:tag-horizontal-bold-duotone` | `TagIcon` | duotone | Category tag (social/promotions/forums) |

### Iconify: Eva Icons

| Current Icon | Phosphor Replacement | Weight | Notes |
|---|---|---|---|
| `eva:search-fill` | `MagnifyingGlassIcon` | fill | Search fields |
| `eva:done-all-fill` | `ChecksIcon` | fill | Mark all read |
| `eva:arrow-ios-downward-fill` | `CaretDownIcon` | fill | Expand/collapse arrow |
| `eva:arrow-ios-forward-fill` | `CaretRightIcon` | fill | Forward/next arrow |
| `eva:arrow-ios-back-fill` | `CaretLeftIcon` | fill | Back arrow |
| `eva:external-link-fill` | `ArrowSquareOutIcon` | fill | External link indicator |
| `eva:info-outline` | `InfoIcon` | regular | Info tooltip in nav items |
| `eva:checkmark-fill` | `CheckIcon` | fill | Checkmark (color picker, password validation) |
| `eva:star-outline` | `StarIcon` | regular | Star unchecked |
| `eva:star-fill` | `StarIcon` | fill | Star checked / starred label |
| `eva:more-vertical-fill` | `DotsThreeVerticalIcon` | fill | More actions menu |
| `eva:attach-2-fill` | `PaperclipIcon` | fill | Attachment |
| `eva:cloud-upload-fill` | `CloudArrowUpIcon` | fill | Upload |
| `eva:cloud-download-fill` | `CloudArrowDownIcon` | fill | Download |
| `eva:chevron-down-fill` | `CaretDownIcon` | fill | Dropdown chevron (phone input) |

### Iconify: Mingcute Icons

| Current Icon | Phosphor Replacement | Weight | Notes |
|---|---|---|---|
| `mingcute:close-line` | `XIcon` | regular | Close/dismiss (used in 7+ places) |
| `mingcute:add-line` | `PlusIcon` | regular | Add action |

### Iconify: Other Libraries

| Current Icon | Library | Phosphor Replacement | Weight | Notes |
|---|---|---|---|---|
| `carbon:chevron-sort` | carbon | `CaretUpDownIcon` | regular | Sort chevron |
| `carbon:close` | carbon | `XIcon` | regular | Close (toast) |
| `material-symbols:close` | material-symbols | `XIcon` | regular | Close (form dialog, password validation) |
| `material-symbols:mood-outline-rounded` | material-symbols | `SmileyIcon` | regular | Emoji picker trigger |
| `material-symbols:add` | material-symbols | `PlusIcon` | regular | Add connection |
| `material-symbols:chevron-right` | material-symbols | `CaretRightIcon` | regular | Navigate right |
| `ic:round-label-important` | ic (material) | `FlagPennantIcon` | fill | Important label; closest Phosphor equivalent |

### Iconify: Custom Icons (Registered via Iconify JSON)

| Current Icon | Phosphor Replacement | Weight | Notes |
|---|---|---|---|
| `custom:profile-duotone` | `UserCircleIcon` | duotone | Profile nav item |
| `custom:invoice-duotone` | `ReceiptIcon` | duotone | Invoice nav item |
| `custom:menu-duotone` | `ListIcon` | duotone | Hamburger menu |
| `custom:send-fill` | `PaperPlaneTiltIcon` | fill | Send message |

### Iconify: Social/Brand Icons

| Current Icon | Phosphor Replacement | Weight | Notes |
|---|---|---|---|
| `socials:twitter` | `TwitterLogoIcon` | regular | Social login / footer; Note: consider `XLogoIcon` for modern X branding |
| `socials:facebook` | `FacebookLogoIcon` | regular | Footer social |
| `socials:instagram` | `InstagramLogoIcon` | regular | Footer social |
| `socials:linkedin` | `LinkedinLogoIcon` | regular | Footer social / social login |
| `socials:google` | `GoogleLogoIcon` | regular | Social login |
| `socials:github` | `GithubLogoIcon` | regular | Social login |

### Lucide-react Icons

| Current Icon | Phosphor Replacement | Weight | Notes |
|---|---|---|---|
| `Loader2Icon` | `SpinnerGapIcon` | regular | Spinner (animate with CSS `animate-spin`) |
| `ChevronDown` | `CaretDownIcon` | regular | Toolbar dropdown |
| `Check` | `CheckIcon` | regular | Mic selector check mark |
| `ChevronsUpDown` | `CaretUpDownIcon` | regular | Combobox chevrons |
| `Mic` | `MicrophoneIcon` | regular | Microphone on |
| `MicOff` | `MicrophoneSlashIcon` | regular | Microphone off |
| `AlertCircleIcon` | `WarningCircleIcon` | regular | Banner/alert warning |
| `CheckCircleIcon` | `CheckCircleIcon` | regular | Banner success |
| `InfoIcon` | `InfoIcon` | regular | Banner info |
| `XIcon` | `XIcon` | regular | Banner close / error alert close |
| `GripVertical` | `DotsSixVerticalIcon` | regular | Draggable block handle |
| `Plus` | `PlusIcon` | regular | Add block |
| `AlertCircle` | `WarningCircleIcon` | regular | Error alert (apps/todox) |
| `RefreshCw` | `ArrowClockwiseIcon` | regular | Refresh/retry |
| `X` | `XIcon` | regular | Close (error alert) |
| `LucideProps` (type only) | - | - | table-icons.tsx uses LucideProps type for custom SVG border icons |

## MUI Override SVG Inventory

These files use `SvgIcon` with inline SVG paths and require special migration via MUI slots API.

### packages/ui/core/src/theme/core/components/accordion.tsx

| SVG Component | Concept | Phosphor Replacement | Weight | Notes |
|---|---|---|---|---|
| `PlusIcon` | Expand accordion | `PlusIcon` | regular | MUI slots API: `expandIcon` |
| `MinusIcon` | Collapse accordion | `MinusIcon` | regular | MUI slots API: `expandIcon` |

### packages/ui/core/src/theme/core/components/alert.tsx

| SVG Component | Concept | Phosphor Replacement | Weight | Notes |
|---|---|---|---|---|
| `InfoIcon` | Info alert | `InfoIcon` | bold | MUI slots API: `iconMapping` |
| `SuccessIcon` | Success alert | `CheckCircleIcon` | bold | MUI slots API: `iconMapping` |
| `WarningIcon` | Warning alert | `WarningIcon` | bold | MUI slots API: `iconMapping` |
| `ErrorIcon` | Error alert | `WarningCircleIcon` | bold | MUI slots API: `iconMapping` |

### packages/ui/core/src/theme/core/components/autocomplete.tsx

| SVG Component | Concept | Phosphor Replacement | Weight | Notes |
|---|---|---|---|---|
| `ArrowDownIcon` | Dropdown arrow | `CaretDownIcon` | bold | MUI slots API: `popupIcon` |

### packages/ui/core/src/theme/core/components/checkbox.tsx

| SVG Component | Concept | Phosphor Replacement | Weight | Notes |
|---|---|---|---|---|
| `Icon` | Unchecked state | `SquareIcon` | regular | MUI slots API: `icon` |
| `CheckedIcon` | Checked state | `CheckSquareIcon` | bold | MUI slots API: `checkedIcon` |
| `IndeterminateIcon` | Indeterminate state | `MinusSquareIcon` | bold | MUI slots API: `indeterminateIcon` |

### packages/ui/core/src/theme/core/components/chip.tsx

| SVG Component | Concept | Phosphor Replacement | Weight | Notes |
|---|---|---|---|---|
| `DeleteIcon` | Chip delete | `XIcon` | bold | MUI slots API: `deleteIcon` |

### packages/ui/core/src/theme/core/components/mui-x-data-grid.tsx

| SVG Component | Source Icon | Phosphor Replacement | Weight | Notes |
|---|---|---|---|---|
| `ArrowUpIcon` | solar:alt-arrow-up-bold-duotone | `CaretUpIcon` | duotone | Column sort ascending |
| `ArrowDownIcon` | solar:alt-arrow-down-bold-duotone | `CaretDownIcon` | duotone | Column sort descending |
| `FilterIcon` | mingcute:filter-fill | `FunnelIcon` | fill | Filter button |
| `ExportIcon` | solar:download-bold | `DownloadIcon` | bold | Export/download |
| `EyeIcon` | solar:eye-bold | `EyeIcon` | bold | Column visibility |
| `EyeCloseIcon` | solar:eye-closed-bold | `EyeClosedIcon` | bold | Column hidden |
| `SearchIcon` | eva:search-fill | `MagnifyingGlassIcon` | fill | Quick filter search |
| `CloseIcon` | eva:close-fill | `XIcon` | fill | Close/clear |
| `MoreIcon` | eva:more-horizontal-fill | `DotsThreeIcon` | fill | More actions |
| `DensityCompactIcon` | material-symbols:table-rows-narrow-rounded | `RowsIcon` | regular | Compact density |
| `DensityComfortableIcon` | mingcute:rows-2-fill | `RowsIcon` | fill | Comfortable density; same icon, different weight |
| `DensityStandardIcon` | mingcute:rows-4-fill | `RowsIcon` | fill | Standard density |
| `ViewColumnsIcon` | flowbite:column-solid | `ColumnsIcon` | fill | Column view |
| `RemoveAllIcon` | solar:trash-bin-trash-bold | `TrashIcon` | bold | Remove all |
| `SeparatorIcon` | (custom vertical line) | NEEDS_CUSTOM_SVG | - | Simple vertical separator line; no Phosphor equivalent |

### packages/ui/core/src/theme/core/components/mui-x-date-picker.tsx

| SVG Component | Concept | Phosphor Replacement | Weight | Notes |
|---|---|---|---|---|
| `SwitchViewIcon` | Switch calendar/year view | `CaretUpDownIcon` | bold | MUI slots: `switchViewIcon` |
| `LeftArrowIcon` | Previous month | `CaretLeftIcon` | bold | MUI slots: `leftArrowIcon` |
| `RightArrowIcon` | Next month | `CaretRightIcon` | bold | MUI slots: `rightArrowIcon` |
| `CalendarIcon` | Open date picker | `CalendarIcon` | bold | MUI slots: `openPickerIcon` |
| `ClockIcon` | Open time picker | `ClockIcon` | bold | MUI slots: `openPickerIcon` |

### packages/ui/core/src/theme/core/components/radio.tsx

| SVG Component | Concept | Phosphor Replacement | Weight | Notes |
|---|---|---|---|---|
| `Icon` | Unchecked radio | `RadioButtonIcon` | regular | MUI slots API: `icon` |
| `CheckedIcon` | Checked radio | `RadioButtonIcon` | fill | MUI slots API: `checkedIcon` |

### packages/ui/core/src/theme/core/components/rating.tsx

| SVG Component | Concept | Phosphor Replacement | Weight | Notes |
|---|---|---|---|---|
| `Icon` | Rating star | `StarIcon` | fill | MUI slots API: `icon` |

### packages/ui/core/src/theme/core/components/select.tsx

| SVG Component | Concept | Phosphor Replacement | Weight | Notes |
|---|---|---|---|---|
| `ArrowDownIcon` | Select dropdown | `CaretDownIcon` | bold | MUI slots API: `IconComponent` |

### packages/ui/core/src/theme/core/components/svg-icon.tsx

No custom SVG icons. Only configures default `MuiSvgIcon` font size. No migration needed.

## Custom SVG Components (packages/ui/ui/src/components/table-icons.tsx)

This file defines 6 custom SVG border icons using `LucideProps` type. These are specialized table-cell border controls with no Phosphor equivalent. They should be migrated to use a generic `SVGProps` type instead of `LucideProps`, and kept as custom SVGs.

| SVG Component | Concept | Phosphor Replacement | Notes |
|---|---|---|---|
| `BorderAllIcon` | All borders | NEEDS_CUSTOM_SVG | Keep as custom SVG, change type from LucideProps |
| `BorderBottomIcon` | Bottom border | NEEDS_CUSTOM_SVG | Keep as custom SVG, change type from LucideProps |
| `BorderLeftIcon` | Left border | NEEDS_CUSTOM_SVG | Keep as custom SVG, change type from LucideProps |
| `BorderNoneIcon` | No borders | NEEDS_CUSTOM_SVG | Keep as custom SVG, change type from LucideProps |
| `BorderRightIcon` | Right border | NEEDS_CUSTOM_SVG | Keep as custom SVG, change type from LucideProps |
| `BorderTopIcon` | Top border | NEEDS_CUSTOM_SVG | Keep as custom SVG, change type from LucideProps |

## File-by-File Inventory

### packages/ui/ui/src/layouts/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `dashboard/layout.tsx` | `solar:home-angle-bold-duotone` | `HouseIcon` weight="duotone" |
| `dashboard/layout.tsx` | `custom:profile-duotone` | `UserCircleIcon` weight="duotone" |
| `dashboard/layout.tsx` | `solar:notes-bold-duotone` | `NotepadIcon` weight="duotone" |
| `dashboard/layout.tsx` | `custom:invoice-duotone` | `ReceiptIcon` weight="duotone" |
| `dashboard/layout.tsx` | `solar:shield-keyhole-bold-duotone` | `ShieldCheckIcon` weight="duotone" |
| `dashboard/layout.tsx` | `solar:settings-bold-duotone` | `GearSixIcon` weight="duotone" |
| `nav-config-dashboard.tsx` | `solar:bell-bing-bold-duotone` | `BellRingingIcon` weight="duotone" |
| `nav-config-dashboard.tsx` | `eva:external-link-fill` | `ArrowSquareOutIcon` weight="fill" |
| `nav-config-main.tsx` | `solar:home-angle-bold-duotone` | `HouseIcon` weight="duotone" |
| `main/footer.tsx` | `socials:twitter` | `TwitterLogoIcon` |
| `main/footer.tsx` | `socials:facebook` | `FacebookLogoIcon` |
| `main/footer.tsx` | `socials:instagram` | `InstagramLogoIcon` |
| `main/footer.tsx` | `socials:linkedin` | `LinkedinLogoIcon` |
| `main/nav/desktop/nav-desktop-item.tsx` | `eva:arrow-ios-downward-fill` | `CaretDownIcon` weight="fill" |
| `main/nav/mobile/nav-mobile-item.tsx` | `eva:arrow-ios-downward-fill`, `eva:arrow-ios-forward-fill` | `CaretDownIcon`/`CaretRightIcon` weight="fill" |
| `components/searchbar/index.tsx` | `eva:search-fill` (x2) | `MagnifyingGlassIcon` weight="fill" |
| `components/notifications-drawer/index.tsx` | `eva:done-all-fill` | `ChecksIcon` weight="fill" |
| `components/notifications-drawer/index.tsx` | `mingcute:close-line` | `XIcon` |
| `components/notifications-drawer/index.tsx` | `solar:settings-bold-duotone` | `GearSixIcon` weight="duotone" |
| `components/notifications-drawer/index.tsx` | `solar:bell-bing-bold-duotone` | `BellRingingIcon` weight="duotone" |
| `components/contacts-popover.tsx` | `solar:users-group-rounded-bold-duotone` | `UsersThreeIcon` weight="duotone" |
| `components/account-drawer.tsx` | `mingcute:close-line` | `XIcon` |
| `components/account-drawer.tsx` | `mingcute:add-line` | `PlusIcon` |
| `components/workspaces-popover.tsx` | `carbon:chevron-sort` | `CaretUpDownIcon` |
| `components/workspaces-popover.tsx` | `mingcute:add-line` | `PlusIcon` |
| `components/nav-toggle-button.tsx` | `eva:arrow-ios-forward-fill`, `eva:arrow-ios-back-fill` | `CaretRightIcon`/`CaretLeftIcon` weight="fill" |
| `components/menu-button.tsx` | `custom:menu-duotone` | `ListIcon` weight="duotone" |
| `component-layout/component-search.tsx` | `eva:search-fill` | `MagnifyingGlassIcon` weight="fill" |

### packages/ui/ui/src/routing/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `custom-breadcrumbs/back-link.tsx` | `eva:arrow-ios-back-fill` | `CaretLeftIcon` weight="fill" |
| `nav-section/components/nav-subheader.tsx` | `eva:arrow-ios-downward-fill`, `eva:arrow-ios-forward-fill` | `CaretDownIcon`/`CaretRightIcon` weight="fill" |
| `nav-section/vertical/nav-item.tsx` | `eva:arrow-ios-downward-fill`, `eva:arrow-ios-forward-fill` | `CaretDownIcon`/`CaretRightIcon` weight="fill" |
| `nav-section/horizontal/nav-item.tsx` | `eva:info-outline` | `InfoIcon` |
| `nav-section/horizontal/nav-item.tsx` | `eva:arrow-ios-forward-fill`, `eva:arrow-ios-downward-fill` | `CaretRightIcon`/`CaretDownIcon` weight="fill" |
| `nav-section/mini/nav-item.tsx` | `eva:info-outline` | `InfoIcon` |
| `nav-section/mini/nav-item.tsx` | `eva:arrow-ios-forward-fill` | `CaretRightIcon` weight="fill" |
| `nav-basic/desktop/nav-item.tsx` | `eva:arrow-ios-forward-fill`, `eva:arrow-ios-downward-fill` | `CaretRightIcon`/`CaretDownIcon` weight="fill" |
| `nav-basic/mobile/nav-item.tsx` | `eva:arrow-ios-downward-fill`, `eva:arrow-ios-forward-fill` | `CaretDownIcon`/`CaretRightIcon` weight="fill" |

### packages/ui/ui/src/molecules/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `snackbar/snackbar.tsx` | `solar:info-circle-bold` | `InfoIcon` weight="bold" |
| `snackbar/snackbar.tsx` | `solar:check-circle-bold` | `CheckCircleIcon` weight="bold" |
| `snackbar/snackbar.tsx` | `solar:danger-triangle-bold` | `WarningIcon` weight="bold" |
| `snackbar/snackbar.tsx` | `solar:danger-bold` | `WarningCircleIcon` weight="bold" |
| `filters-result/filters-result.tsx` | `solar:trash-bin-trash-bold` | `TrashIcon` weight="bold" |

### packages/ui/ui/src/form/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `FormDialog.tsx` | `material-symbols:close` | `XIcon` |
| `groups/PasswordFieldsGroup.tsx` | `solar:eye-bold`, `solar:eye-closed-bold` | `EyeIcon`/`EyeClosedIcon` weight="bold" |
| `groups/PasswordFieldsGroup.tsx` | `eva:checkmark-fill` | `CheckIcon` weight="fill" |
| `groups/PasswordFieldsGroup.tsx` | `material-symbols:close` | `XIcon` |

### packages/ui/ui/src/inputs/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `emoji/emoji-picker.tsx` | `material-symbols:mood-outline-rounded` | `SmileyIcon` |
| `color/color-picker.tsx` | `eva:checkmark-fill` | `CheckIcon` weight="fill" |
| `upload/default/upload-default.tsx` | `eva:cloud-upload-fill` | `CloudArrowUpIcon` weight="fill" |
| `upload/default/upload-default.tsx` | `mingcute:close-line` | `XIcon` |
| `upload/components/multi-file-preview.tsx` | `mingcute:close-line` | `XIcon` |
| `upload/box/upload-box.tsx` | `eva:cloud-upload-fill` | `CloudArrowUpIcon` weight="fill" |
| `upload/avatar/upload-avatar.tsx` | `solar:camera-add-bold` | `CameraPlusIcon` weight="bold" |
| `phone-input/phone-input.tsx` | `mingcute:close-line` | `XIcon` |
| `phone-input/list-popover.tsx` | `eva:chevron-down-fill` | `CaretDownIcon` weight="fill" |
| `phone-input/list-popover.tsx` | `eva:search-fill` | `MagnifyingGlassIcon` weight="fill" |
| `phone-input/list-popover.tsx` | `mingcute:close-line` | `XIcon` |

### packages/ui/ui/src/atoms/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `file-thumbnail/file-thumbnail.tsx` | `mingcute:close-line` | `XIcon` |
| `file-thumbnail/file-thumbnail.tsx` | `eva:cloud-download-fill` | `CloudArrowDownIcon` weight="fill" |

### packages/ui/ui/src/components/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `toast.tsx` | `carbon:close` | `XIcon` |
| `spinner.tsx` | `Loader2Icon` (lucide) | `SpinnerGapIcon` + `animate-spin` |
| `toolbar.tsx` | `ChevronDown` (lucide) | `CaretDownIcon` |
| `banner.tsx` | `AlertCircleIcon` (lucide) | `WarningCircleIcon` |
| `banner.tsx` | `CheckCircleIcon` (lucide) | `CheckCircleIcon` |
| `banner.tsx` | `InfoIcon` (lucide) | `InfoIcon` |
| `banner.tsx` | `Loader2Icon` (lucide) | `SpinnerGapIcon` + `animate-spin` |
| `banner.tsx` | `XIcon` (lucide) | `XIcon` |
| `mic-selector.tsx` | `Check` (lucide) | `CheckIcon` |
| `mic-selector.tsx` | `ChevronsUpDown` (lucide) | `CaretUpDownIcon` |
| `mic-selector.tsx` | `Mic` (lucide) | `MicrophoneIcon` |
| `mic-selector.tsx` | `MicOff` (lucide) | `MicrophoneSlashIcon` |
| `table-icons.tsx` | `LucideProps` type only | Replace with `React.SVGProps<SVGSVGElement>` |

### packages/ui/ui/src/animate/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `back-to-top-button.tsx` | `solar:double-alt-arrow-up-bold-duotone` | `CaretDoubleUpIcon` weight="duotone" |

### packages/ui/ui/src/settings/drawer/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `styles.tsx` | `solar:restart-bold` (x2) | `ArrowCounterClockwiseIcon` weight="bold" |
| `styles.tsx` | `eva:info-outline` | `InfoIcon` |
| `base-option.tsx` | `eva:info-outline` | `InfoIcon` |
| `fullscreen-button.tsx` | `solar:quit-full-screen-square-outline` | `ArrowsInIcon` |
| `fullscreen-button.tsx` | `solar:full-screen-square-outline` | `ArrowsOutIcon` |
| `settings-drawer.tsx` | `solar:restart-bold` | `ArrowCounterClockwiseIcon` weight="bold" |
| `settings-drawer.tsx` | `mingcute:close-line` | `XIcon` |

### packages/iam/ui/src/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `_components/form-return-link.tsx` | `eva:arrow-ios-back-fill` | `CaretLeftIcon` weight="fill" |
| `_components/social-icons/twitter-icon.tsx` | `socials:twitter` | `TwitterLogoIcon` |
| `_components/social-icons/linkedin-icon.tsx` | `socials:linkedin` | `LinkedinLogoIcon` |
| `_components/form-socials.tsx` | `socials:google` | `GoogleLogoIcon` |
| `_components/form-socials.tsx` | `socials:github` | `GithubLogoIcon` |
| `_components/form-socials.tsx` | `socials:twitter` | `TwitterLogoIcon` |
| `sign-in/email/form.tsx` | `solar:eye-bold`, `solar:eye-closed-bold` | `EyeIcon`/`EyeClosedIcon` weight="bold" |

### apps/todox/src/features/mail/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `mail-nav.tsx` | `solar:pen-bold` | `PenIcon` weight="bold" |
| `mail-nav-item.tsx` | `solar:letter-bold` | `EnvelopeIcon` weight="bold" |
| `mail-nav-item.tsx` | `solar:inbox-bold` | `TrayIcon` weight="bold" |
| `mail-nav-item.tsx` | `solar:trash-bin-trash-bold` | `TrashIcon` weight="bold" |
| `mail-nav-item.tsx` | `solar:file-text-bold` | `FileTextIcon` weight="bold" |
| `mail-nav-item.tsx` | `solar:danger-bold` | `WarningCircleIcon` weight="bold" |
| `mail-nav-item.tsx` | `custom:send-fill` | `PaperPlaneTiltIcon` weight="fill" |
| `mail-nav-item.tsx` | `eva:star-fill` | `StarIcon` weight="fill" |
| `mail-nav-item.tsx` | `ic:round-label-important` | `FlagPennantIcon` weight="fill" |
| `mail-nav-item.tsx` | `solar:tag-horizontal-bold-duotone` (x3) | `TagIcon` weight="duotone" |
| `mail-header.tsx` | `solar:letter-bold` | `EnvelopeIcon` weight="bold" |
| `mail-header.tsx` | `solar:chat-round-dots-bold` | `ChatCircleDotsIcon` weight="bold" |
| `mail-header.tsx` | `eva:search-fill` | `MagnifyingGlassIcon` weight="fill" |
| `mail-list.tsx` | `eva:search-fill` | `MagnifyingGlassIcon` weight="fill" |
| `mail-details.tsx` | `eva:star-outline` | `StarIcon` |
| `mail-details.tsx` | `eva:star-fill` | `StarIcon` weight="fill" |
| `mail-details.tsx` | `ic:round-label-important` (x2) | `FlagPennantIcon` weight="fill" |
| `mail-details.tsx` | `solar:archive-down-minimlistic-bold` | `ArchiveIcon` weight="bold" |
| `mail-details.tsx` | `solar:letter-unread-bold` | `EnvelopeOpenIcon` weight="bold" |
| `mail-details.tsx` | `solar:trash-bin-trash-bold` | `TrashIcon` weight="bold" |
| `mail-details.tsx` | `eva:more-vertical-fill` | `DotsThreeVerticalIcon` weight="fill" |
| `mail-details.tsx` | `solar:reply-bold` | `ArrowBendUpLeftIcon` weight="bold" |
| `mail-details.tsx` | `solar:multiple-forward-left-broken` | `ArrowBendDoubleUpLeftIcon` weight="bold" |
| `mail-details.tsx` | `solar:forward-bold` | `ArrowBendUpRightIcon` weight="bold" |
| `mail-details.tsx` | `eva:attach-2-fill` (x2) | `PaperclipIcon` weight="fill" |
| `mail-details.tsx` | `eva:cloud-download-fill` | `CloudArrowDownIcon` weight="fill" |
| `mail-details.tsx` | `solar:gallery-add-bold` | `ImageIcon` weight="bold" |
| `mail-details.tsx` | `custom:send-fill` | `PaperPlaneTiltIcon` weight="fill" |
| `mail-compose.tsx` | `mingcute:close-line` | `XIcon` |
| `mail-compose.tsx` | `solar:gallery-add-bold` | `ImageIcon` weight="bold" |
| `mail-compose.tsx` | `eva:attach-2-fill` | `PaperclipIcon` weight="fill" |
| `mail-compose.tsx` | `custom:send-fill` | `PaperPlaneTiltIcon` weight="fill" |

### apps/todox/src/app/settings/

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `ConnectionsSettingsPage.tsx` | `material-symbols:add` | `PlusIcon` |
| `ConnectionsSettingsPage.tsx` | `material-symbols:chevron-right` | `CaretRightIcon` |
| `ConnectionsSettingsPage.tsx` | `material-symbols:close` | `XIcon` |

### apps/todox/src/components/ (lucide-react)

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `ui/mic-selector.tsx` | `Check`, `ChevronsUpDown`, `Mic`, `MicOff` | `CheckIcon`, `CaretUpDownIcon`, `MicrophoneIcon`, `MicrophoneSlashIcon` |
| `editor/plugins/DraggableBlockPlugin/index.tsx` | `GripVertical`, `Plus` | `DotsSixVerticalIcon`, `PlusIcon` |

### apps/todox/src/app/ (lucide-react)

| File | Current Usage | Phosphor Replacement |
|---|---|---|
| `knowledge-demo/components/ErrorAlert.tsx` | `AlertCircle`, `RefreshCw`, `X` | `WarningCircleIcon`, `ArrowClockwiseIcon`, `XIcon` |

## Deduplication Summary

The following Phosphor icons cover all non-Phosphor icon usages in the codebase:

| Phosphor Icon | Import Name | Usage Count | Replaces |
|---|---|---|---|
| `XIcon` | `X` | 15+ | mingcute:close-line, carbon:close, material-symbols:close, lucide X/XIcon |
| `CaretDownIcon` | `CaretDown` | 10+ | eva:arrow-ios-downward-fill, eva:chevron-down-fill, lucide ChevronDown |
| `CaretRightIcon` | `CaretRight` | 8+ | eva:arrow-ios-forward-fill, material-symbols:chevron-right |
| `CaretLeftIcon` | `CaretLeft` | 4+ | eva:arrow-ios-back-fill |
| `MagnifyingGlassIcon` | `MagnifyingGlass` | 6+ | eva:search-fill |
| `InfoIcon` | `Info` | 6+ | solar:info-circle-bold, eva:info-outline, lucide InfoIcon |
| `EyeIcon` | `Eye` | 4+ | solar:eye-bold |
| `EyeClosedIcon` | `EyeClosed` | 4+ | solar:eye-closed-bold |
| `CheckIcon` | `Check` | 4+ | eva:checkmark-fill, lucide Check |
| `PlusIcon` | `Plus` | 5+ | mingcute:add-line, material-symbols:add, lucide Plus |
| `TrashIcon` | `Trash` | 4+ | solar:trash-bin-trash-bold |
| `StarIcon` | `Star` | 4+ | eva:star-outline, eva:star-fill |
| `PaperclipIcon` | `Paperclip` | 4+ | eva:attach-2-fill |
| `CloudArrowUpIcon` | `CloudArrowUp` | 2 | eva:cloud-upload-fill |
| `CloudArrowDownIcon` | `CloudArrowDown` | 2 | eva:cloud-download-fill |
| `WarningCircleIcon` | `WarningCircle` | 4+ | solar:danger-bold, lucide AlertCircle/AlertCircleIcon |
| `WarningIcon` | `Warning` | 2+ | solar:danger-triangle-bold |
| `CheckCircleIcon` | `CheckCircle` | 3+ | solar:check-circle-bold, lucide CheckCircleIcon |
| `GearSixIcon` | `GearSix` | 3 | solar:settings-bold-duotone |
| `BellRingingIcon` | `BellRinging` | 2 | solar:bell-bing-bold-duotone |
| `HouseIcon` | `House` | 2 | solar:home-angle-bold-duotone |
| `EnvelopeIcon` | `Envelope` | 2 | solar:letter-bold |
| `EnvelopeOpenIcon` | `EnvelopeOpen` | 1 | solar:letter-unread-bold |
| `CaretUpDownIcon` | `CaretUpDown` | 2 | carbon:chevron-sort, lucide ChevronsUpDown |
| `PaperPlaneTiltIcon` | `PaperPlaneTilt` | 3 | custom:send-fill |
| `ArrowBendUpLeftIcon` | `ArrowBendUpLeft` | 1 | solar:reply-bold |
| `ArrowBendDoubleUpLeftIcon` | `ArrowBendDoubleUpLeft` | 1 | solar:multiple-forward-left-broken |
| `ArrowBendUpRightIcon` | `ArrowBendUpRight` | 1 | solar:forward-bold |
| `ArrowSquareOutIcon` | `ArrowSquareOut` | 1 | eva:external-link-fill |
| `ArrowCounterClockwiseIcon` | `ArrowCounterClockwise` | 3 | solar:restart-bold |
| `ArrowClockwiseIcon` | `ArrowClockwise` | 1 | lucide RefreshCw |
| `ArrowsOutIcon` | `ArrowsOut` | 1 | solar:full-screen-square-outline |
| `ArrowsInIcon` | `ArrowsIn` | 1 | solar:quit-full-screen-square-outline |
| `CaretDoubleUpIcon` | `CaretDoubleUp` | 1 | solar:double-alt-arrow-up-bold-duotone |
| `CaretUpIcon` | `CaretUp` | 1 | MUI data grid sort up |
| `ChatCircleDotsIcon` | `ChatCircleDots` | 1 | solar:chat-round-dots-bold |
| `UsersThreeIcon` | `UsersThree` | 1 | solar:users-group-rounded-bold-duotone |
| `NotepadIcon` | `Notepad` | 1 | solar:notes-bold-duotone |
| `ShieldCheckIcon` | `ShieldCheck` | 1 | solar:shield-keyhole-bold-duotone |
| `UserCircleIcon` | `UserCircle` | 1 | custom:profile-duotone |
| `ReceiptIcon` | `Receipt` | 1 | custom:invoice-duotone |
| `ListIcon` | `List` | 1 | custom:menu-duotone |
| `CameraPlusIcon` | `CameraPlus` | 1 | solar:camera-add-bold |
| `PenIcon` | `Pen` | 1 | solar:pen-bold |
| `ArchiveIcon` | `Archive` | 1 | solar:archive-down-minimlistic-bold |
| `ImageIcon` | `Image` | 2 | solar:gallery-add-bold |
| `TrayIcon` | `Tray` | 1 | solar:inbox-bold |
| `FileTextIcon` | `FileText` | 1 | solar:file-text-bold |
| `TagIcon` | `Tag` | 3 | solar:tag-horizontal-bold-duotone |
| `FlagPennantIcon` | `FlagPennant` | 3 | ic:round-label-important |
| `ChecksIcon` | `Checks` | 1 | eva:done-all-fill |
| `DotsThreeVerticalIcon` | `DotsThreeVertical` | 1 | eva:more-vertical-fill |
| `DotsThreeIcon` | `DotsThree` | 1 | MUI data grid more |
| `DotsSixVerticalIcon` | `DotsSixVertical` | 1 | lucide GripVertical |
| `SmileyIcon` | `Smiley` | 1 | material-symbols:mood-outline-rounded |
| `FunnelIcon` | `Funnel` | 1 | MUI data grid filter |
| `DownloadIcon` | `Download` | 1 | MUI data grid export |
| `RowsIcon` | `Rows` | 3 | MUI data grid density icons |
| `ColumnsIcon` | `Columns` | 1 | MUI data grid column view |
| `SquareIcon` | `Square` | 1 | MUI checkbox unchecked |
| `CheckSquareIcon` | `CheckSquare` | 1 | MUI checkbox checked |
| `MinusSquareIcon` | `MinusSquare` | 1 | MUI checkbox indeterminate |
| `MinusIcon` | `Minus` | 1 | MUI accordion collapse |
| `RadioButtonIcon` | `RadioButton` | 2 | MUI radio button |
| `CalendarIcon` | `Calendar` | 1 | MUI date picker |
| `ClockIcon` | `Clock` | 1 | MUI time picker |
| `SpinnerGapIcon` | `SpinnerGap` | 2 | lucide Loader2Icon |
| `MicrophoneIcon` | `Microphone` | 1 | lucide Mic |
| `MicrophoneSlashIcon` | `MicrophoneSlash` | 1 | lucide MicOff |
| `TwitterLogoIcon` | `TwitterLogo` | 3 | socials:twitter |
| `FacebookLogoIcon` | `FacebookLogo` | 1 | socials:facebook |
| `InstagramLogoIcon` | `InstagramLogo` | 1 | socials:instagram |
| `LinkedinLogoIcon` | `LinkedinLogo` | 2 | socials:linkedin |
| `GoogleLogoIcon` | `GoogleLogo` | 1 | socials:google |
| `GithubLogoIcon` | `GithubLogo` | 1 | socials:github |

**Total unique Phosphor icons needed: ~70**
**Items marked NEEDS_CUSTOM_SVG: 7** (6 border icons + 1 separator)
