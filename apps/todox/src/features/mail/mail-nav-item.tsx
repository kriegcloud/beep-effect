import type { MailLabel } from "@beep/todox/types/mail";
import Box from "@mui/material/Box";
import type { ListItemButtonProps } from "@mui/material/ListItemButton";
import ListItemButton from "@mui/material/ListItemButton";
import type { Icon } from "@phosphor-icons/react";
import {
  BookmarkSimpleIcon,
  EnvelopeSimpleIcon,
  FileTextIcon,
  PaperPlaneTiltIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
  TrayIcon,
  WarningIcon,
} from "@phosphor-icons/react";

// ----------------------------------------------------------------------

const LABEL_ICONS: Record<string, Icon> = {
  all: EnvelopeSimpleIcon,
  inbox: TrayIcon,
  trash: TrashIcon,
  drafts: FileTextIcon,
  spam: WarningIcon,
  sent: PaperPlaneTiltIcon,
  starred: StarIcon,
  important: BookmarkSimpleIcon,
  social: TagIcon,
  promotions: TagIcon,
  forums: TagIcon,
};

// ----------------------------------------------------------------------

type Props = ListItemButtonProps & {
  readonly selected: boolean;
  readonly label: MailLabel;
  readonly onClickNavItem: () => void;
};

export function MailNavItem({ selected, label, onClickNavItem, ...other }: Props) {
  const LabelIcon = LABEL_ICONS[label.name] ?? TagIcon;

  return (
    <Box component="li" sx={{ display: "flex" }}>
      <ListItemButton
        disableGutters
        onClick={onClickNavItem}
        sx={{
          pl: 1,
          pr: 1.5,
          gap: 2,
          borderRadius: 0.75,
          color: "text.secondary",
          ...(selected && { color: "text.primary" }),
        }}
        {...other}
      >
        <LabelIcon size={22} weight="bold" style={{ color: label.color ?? undefined }} />

        <Box
          component="span"
          sx={{
            flexGrow: 1,
            textTransform: "capitalize",
            typography: selected ? "subtitle2" : "body2",
          }}
        >
          {label.name}
        </Box>

        {!!label.unreadCount && (
          <Box component="span" sx={{ typography: "caption" }}>
            {label.unreadCount}
          </Box>
        )}
      </ListItemButton>
    </Box>
  );
}
