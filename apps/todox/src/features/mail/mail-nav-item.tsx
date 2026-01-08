import type { IMailLabel } from "@beep/mock/_mail";
import type { IconifyName } from "@beep/ui/atoms/iconify";
import { Iconify } from "@beep/ui/atoms/iconify";
import Box from "@mui/material/Box";
import type { ListItemButtonProps } from "@mui/material/ListItemButton";
import ListItemButton from "@mui/material/ListItemButton";

// ----------------------------------------------------------------------

const LABEL_ICONS: Record<string, IconifyName> = {
  all: "solar:letter-bold",
  inbox: "solar:inbox-bold",
  trash: "solar:trash-bin-trash-bold",
  drafts: "solar:file-text-bold",
  spam: "solar:danger-bold",
  sent: "custom:send-fill",
  starred: "eva:star-fill",
  important: "ic:round-label-important",
  social: "solar:tag-horizontal-bold-duotone",
  promotions: "solar:tag-horizontal-bold-duotone",
  forums: "solar:tag-horizontal-bold-duotone",
};

// ----------------------------------------------------------------------

type Props = ListItemButtonProps & {
  selected: boolean;
  label: IMailLabel;
  onClickNavItem: () => void;
};

export function MailNavItem({ selected, label, onClickNavItem, ...other }: Props) {
  const labelIcon = LABEL_ICONS[label.name] ?? "solar:tag-horizontal-bold-duotone";

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
        <Iconify icon={labelIcon} width={22} sx={{ color: label.color }} />

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
