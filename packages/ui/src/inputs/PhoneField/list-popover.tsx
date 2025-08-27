import { Iconify } from "@beep/ui/atoms";
import { usePopover } from "@beep/ui/hooks";
import { FlagIcon } from "@beep/ui/icons";
import { SearchNotFound } from "@beep/ui/messages";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import { useMemo } from "react";
import type { Country } from "react-phone-number-input/input";

import type { CountryListProps } from "./types";

export function CountryListPopover({
  sx,
  countries,
  countryCode,
  searchCountry,
  onClickCountry,
  onSearchCountry,
}: CountryListProps) {
  const { open, onClose, onOpen, anchorEl } = usePopover();

  const selectedCountry = useMemo(
    () => countries.find((country) => country.code === countryCode),
    [countries, countryCode]
  );

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: countries,
        query: searchCountry,
      }),
    [countries, searchCountry]
  );

  const notFound = dataFiltered.length === 0 && !!searchCountry;

  const btnId = "country-list-button";
  const menuId = "country-list-menu";

  const renderButton = () => (
    <ButtonBase
      disableRipple
      id={btnId}
      aria-haspopup="true"
      aria-controls={open ? menuId : undefined}
      aria-expanded={open ? "true" : undefined}
      onClick={onOpen}
      sx={[
        {
          zIndex: 9,
          display: "flex",
          position: "absolute",
          justifyContent: "flex-start",
          width: "var(--popover-button-width)",
          height: "var(--popover-button-height)",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FlagIcon
        code={selectedCountry?.code}
        sx={{
          borderRadius: "50%",
          width: "var(--popover-button-height)",
          height: "var(--popover-button-height)",
        }}
      />

      <Iconify icon="eva:chevron-down-fill" sx={{ ml: 0.25, flexShrink: 0, color: "text.disabled" }} />

      <Box
        component="span"
        sx={(theme) => ({
          height: 20,
          ml: "auto",
          width: "1px",
          bgcolor: theme.vars.palette.divider,
        })}
      />
    </ButtonBase>
  );

  const renderList = () => (
    <MenuList>
      {dataFiltered.map((country) => (
        <MenuItem
          key={country.code}
          selected={open && countryCode === country.code}
          autoFocus={open && countryCode === country.code}
          onClick={() => {
            onClose();
            onSearchCountry("");
            onClickCountry(country.code as Country);
          }}
        >
          <FlagIcon code={country.code} sx={{ mr: 1, width: 22, height: 22, borderRadius: "50%" }} />

          <ListItemText
            primary={country.label}
            secondary={`${country.code} (+${country.phone})`}
            slotProps={{
              primary: { noWrap: true, sx: { typography: "body2" } },
              secondary: { sx: { typography: "caption" } },
            }}
          />
        </MenuItem>
      ))}
    </MenuList>
  );

  return (
    <>
      {renderButton()}

      <Popover
        id={menuId}
        aria-labelledby={btnId}
        open={open}
        anchorEl={anchorEl}
        onClose={() => {
          onClose();
          onSearchCountry("");
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              width: 1,
              height: 320,
              maxWidth: 320,
              display: "flex",
              flexDirection: "column",
            },
          },
        }}
      >
        <Box sx={{ px: 1, py: 1.5 }}>
          <TextField
            autoFocus
            fullWidth
            value={searchCountry}
            onChange={(event) => onSearchCountry(event.target.value)}
            placeholder="Search..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
                endAdornment: searchCountry && (
                  <InputAdornment position="end">
                    <IconButton size="small" edge="end" onClick={() => onSearchCountry("")}>
                      <Iconify width={16} icon="mingcute:close-line" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box sx={{ flex: "1 1 auto", overflowX: "hidden" }}>
          {notFound ? <SearchNotFound query={searchCountry} sx={{ px: 2, pt: 5 }} /> : renderList()}
        </Box>
      </Popover>
    </>
  );
}

type ApplyFilterProps = {
  query: string;
  inputData: CountryListProps["countries"];
};

function applyFilter({ inputData, query }: ApplyFilterProps) {
  if (!query) return inputData;

  return inputData.filter(({ label, code, phone }) =>
    [label, code, phone].some((field) => field?.toLowerCase().includes(query.toLowerCase()))
  );
}
