import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { Fade, Popover } from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import type { ReactElement } from "react";
import SearchResult from "./SearchResult";

interface TransitionComponentProps extends TransitionProps {
  children: ReactElement<any>;
  ref?: React.Ref<unknown>;
}

const Transition = ({ ref, ...props }: TransitionComponentProps) => <Fade ref={ref} {...props} />;

interface SearchPopoverProps {
  anchorEl: HTMLDivElement | HTMLButtonElement | null;
  handleClose: () => void;
}

const SearchPopover = ({ anchorEl, handleClose }: SearchPopoverProps) => {
  const open = Boolean(anchorEl);
  const {
    config: { navigationMenuType },
  } = useSettingsContext();

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      marginThreshold={0}
      elevation={3}
      transitionDuration={150}
      slots={{ transition: Transition }}
      slotProps={{
        paper: {
          sx: [
            {
              width: 1,
              maxWidth: { sm: 420 },
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              borderWidth: "0 !important",
              boxShadow: (theme) => `0 0 0 1px ${theme.vars.palette.menuDivider}`,
            },
            (navigationMenuType === "topnav" || navigationMenuType === "combo") && {
              maxWidth: { sm: 480 },
            },
          ],
        },
        root: {
          slotProps: {
            backdrop: {
              invisible: false,
            },
          },
        },
      }}
    >
      <SearchResult handleClose={handleClose} />
    </Popover>
  );
};

export default SearchPopover;
