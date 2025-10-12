"use client";

import { Iconify } from "@beep/ui/atoms";
import { useBreakpoints } from "@beep/ui/providers";
import type { ButtonOwnProps } from "@mui/material";
import { Box, Button, type SxProps } from "@mui/material";
import { type MouseEvent, useState } from "react";
import SearchDialog from "./SearchDialog";
import SearchPopover from "./SearchPopover";
import SearchTextField from "./SearchTextField";

interface SearchBoxButtonProps extends ButtonOwnProps {
  type?: "default" | "slim";
}

interface SearchBoxProps {
  sx?: SxProps;
}

const SearchBox = ({ sx }: SearchBoxProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | HTMLButtonElement | null>(null);

  const handleClick = (event: MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <SearchTextField
        sx={sx}
        focused={false}
        disabled={Boolean(anchorEl)}
        slotProps={{
          input: {
            onClick: handleClick,
            sx: {
              borderRadius: 5,
              border: 1,
              borderStyle: "solid",
              borderColor: "transparent",
            },
          },
        }}
      />
      <SearchPopover anchorEl={anchorEl} handleClose={handleClose} />
    </>
  );
};

export const SearchBoxButton = ({ type = "default", sx, ...rest }: SearchBoxButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | HTMLButtonElement | null>(null);
  const { up } = useBreakpoints();
  const upSm = up("sm");

  const handleClick = (event: MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {type === "slim" && upSm ? (
        <Button
          className="search-box-button"
          color="neutral"
          size="small"
          variant="soft"
          onClick={handleClick}
          startIcon={<Iconify icon="material-symbols:search-rounded" sx={{ fontSize: 20 }} />}
          sx={{ borderRadius: 11, py: "5px", ...sx }}
          {...rest}
        >
          <Box sx={{ mb: 0.25 }} component="span">
            Search
          </Box>
        </Button>
      ) : (
        <Button
          className="search-box-button"
          color="neutral"
          shape="circle"
          variant="soft"
          size={type === "slim" ? "small" : "medium"}
          onClick={handleClick}
          sx={sx}
          {...rest}
        >
          <Iconify
            icon="material-symbols:search-rounded"
            sx={[{ fontSize: 20 }, type === "slim" && { fontSize: 18 }]}
          />
        </Button>
      )}
      <SearchDialog anchorEl={anchorEl} handleClose={handleClose} />
    </>
  );
};

export default SearchBox;
