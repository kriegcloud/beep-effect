import { Label } from "@beep/ui/atoms";
import { RouterLink } from "@beep/ui/routing";
import { isExternalLink, rgbaFromChannel } from "@beep/ui-core/utils";
import Box from "@mui/material/Box";
import type { ListItemButtonProps } from "@mui/material/ListItemButton";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

type Props = Omit<ListItemButtonProps, "title"> & {
  readonly href: string;
  readonly labels: string[];
  readonly title: ReadonlyArray<{ readonly text: string; readonly highlight: boolean }>;
  readonly path: ReadonlyArray<{ readonly text: string; readonly highlight: boolean }>;
};

export function ResultItem({ title, path, labels, href, sx, ...other }: Props) {
  const linkProps = isExternalLink(href)
    ? { component: "a", href, target: "_blank", rel: "noopener noreferrer" }
    : { component: RouterLink, href };

  return (
    <ListItemButton
      {...linkProps}
      disableRipple
      sx={[
        (theme) => ({
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: "transparent",
          borderBottomColor: theme.vars.palette.divider,
          "&:hover": {
            borderRadius: 1,
            borderColor: theme.vars.palette.primary.main,
            backgroundColor: rgbaFromChannel(
              theme.vars.palette.primary.mainChannel,
              theme.vars.palette.action.hoverOpacity
            ),
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <ListItemText
        primary={title.map((part, index) => (
          <Box
            key={index}
            component="span"
            sx={{
              ...(part.highlight && {
                color: "primary.main",
              }),
            }}
          >
            {part.text}
          </Box>
        ))}
        secondary={path.map((part, index) => (
          <Box
            key={index}
            component="span"
            sx={{
              color: "text.secondary",
              ...(part.highlight && {
                color: "primary.main",
                fontWeight: "fontWeightSemiBold",
              }),
            }}
          >
            {part.text}
          </Box>
        ))}
        slotProps={{
          secondary: {
            noWrap: true,
            sx: { typography: "caption" },
          },
        }}
      />

      <Box sx={{ gap: 0.75, display: "flex" }}>
        {[...labels].reverse().map((label) => (
          <Label key={label} color="default">
            {label}
          </Label>
        ))}
      </Box>
    </ListItemButton>
  );
}
