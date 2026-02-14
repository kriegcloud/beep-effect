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
import SvgIcon from "@mui/material/SvgIcon";
import TextField from "@mui/material/TextField";
import { CaretDownIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useMemo } from "react";
import type { CountryListProps, PhoneCountry } from "./types";

// ----------------------------------------------------------------------

export function CountryListPopover({
  sx,
  options,
  disabled,
  searchCountry,
  selectedCountry,
  onSearchCountry,
  onSelectedCountry,
  ...other
}: CountryListProps) {
  const { open, onClose, onOpen, anchorEl } = usePopover();
  const dialogContainer = anchorEl ? anchorEl.closest("[role='dialog']") : null;

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: options,
        query: searchCountry,
      }),
    [options, searchCountry]
  );

  const notFound = dataFiltered.length === 0 && !!searchCountry;

  const btnId = "country-list-button";
  const menuId = "country-list-menu";

  const renderFlag = () =>
    selectedCountry ? (
      <FlagIcon
        code={selectedCountry}
        sx={{
          borderRadius: "50%",
          width: "var(--popover-button-height)",
          height: "var(--popover-button-height)",
        }}
      />
    ) : (
      <SvgIcon
        // https://icon-sets.iconify.design/solar/global-outline/
        sx={{
          width: "var(--popover-button-height)",
          height: "var(--popover-button-height)",
        }}
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M9.206 3.182A9.25 9.25 0 0 0 2.78 11.25h4.48c.033-1.096.135-2.176.305-3.2c.207-1.254.515-2.41.91-3.4a9.3 9.3 0 0 1 .731-1.468M12 1.25a10.75 10.75 0 1 0 0 21.5a10.75 10.75 0 0 0 0-21.5m0 1.5c-.261 0-.599.126-.991.532c-.396.41-.791 1.051-1.141 1.925c-.347.869-.63 1.917-.824 3.089c-.155.94-.25 1.937-.282 2.954h6.476a22.5 22.5 0 0 0-.282-2.954c-.194-1.172-.477-2.22-.824-3.089c-.35-.874-.745-1.515-1.14-1.925c-.393-.406-.73-.532-.992-.532m4.74 8.5a24 24 0 0 0-.305-3.2c-.207-1.254-.515-2.41-.91-3.4a9.3 9.3 0 0 0-.732-1.468a9.24 9.24 0 0 1 3.748 2.277a9.25 9.25 0 0 1 2.678 5.791zm-1.502 1.5H8.762c.031 1.017.127 2.014.282 2.954c.194 1.172.477 2.22.824 3.089c.35.874.745 1.515 1.14 1.925c.393.406.73.532.992.532c.261 0 .599-.126.991-.532c.396-.41.791-1.051 1.141-1.925c.347-.869.63-1.917.824-3.089c.155-.94.25-1.937.282-2.954m-.444 8.068c.27-.434.515-.929.73-1.468c.396-.99.704-2.146.911-3.4a24 24 0 0 0 .304-3.2h4.48a9.25 9.25 0 0 1-6.426 8.068m-5.588 0a9.3 9.3 0 0 1-.73-1.468c-.396-.99-.704-2.146-.911-3.4a24 24 0 0 1-.304-3.2H2.78a9.25 9.25 0 0 0 6.425 8.068"
          clipRule="evenodd"
        />
      </SvgIcon>
    );

  const renderButton = () => (
    <ButtonBase
      disableRipple
      disabled={Boolean(disabled)}
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
      {...other}
    >
      {renderFlag()}

      {!disabled && (
        <Box
          component="span"
          sx={{
            ml: 0.25,
            flexShrink: 0,
            color: "text.disabled",
            display: "inline-flex",
            ...(open && { color: "text.primary" }),
          }}
        >
          <CaretDownIcon weight="fill" />
        </Box>
      )}

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
          selected={open && selectedCountry === country.code}
          autoFocus={open && selectedCountry === country.code}
          onClick={() => {
            onClose();
            onSearchCountry("");
            onSelectedCountry(country.code as PhoneCountry);
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

  const renderPopover = () => (
    <Popover
      id={menuId}
      aria-labelledby={btnId}
      open={open}
      anchorEl={anchorEl}
      disablePortal={Boolean(dialogContainer)}
      container={dialogContainer ?? undefined}
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
                  <Box component="span" sx={{ color: "text.disabled", display: "inline-flex" }}>
                    <MagnifyingGlassIcon weight="fill" />
                  </Box>
                </InputAdornment>
              ),
              endAdornment: searchCountry && (
                <InputAdornment position="end">
                  <IconButton size="small" edge="end" onClick={() => onSearchCountry("")}>
                    <XIcon size={16} />
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
  );

  return (
    <>
      {renderButton()}
      {renderPopover()}
    </>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  query: string;
  inputData: CountryListProps["options"];
};

function applyFilter({ inputData, query }: ApplyFilterProps) {
  if (!query) return inputData;

  const lowerQuery = query.toLowerCase();

  return inputData.filter(({ label, code, phone }) =>
    [label, code, phone].some((field) => field?.toLowerCase().includes(lowerQuery))
  );
}
