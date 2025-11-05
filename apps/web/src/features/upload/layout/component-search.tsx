import { Iconify } from "@beep/ui/atoms";
import { usePathname, useRouter } from "@beep/ui/hooks";
import { SearchNotFound } from "@beep/ui/messages/search-not-found";
import { RouterLink } from "@beep/ui/routing";
import { isEqualPath } from "@beep/ui-core/utils";

import Autocomplete, { autocompleteClasses } from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import { inputBaseClasses } from "@mui/material/InputBase";
import Link, { linkClasses } from "@mui/material/Link";
import type { SxProps, Theme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { useCallback, useState } from "react";

import type { NavItemData } from "../layout/nav-config-components";

type NavSearchProps = {
  readonly sx?: SxProps<Theme> | undefined;
  readonly navData?:
    | {
        readonly title: string;
        readonly items: NavItemData[];
      }[]
    | undefined;
};

export function NavSearch({ navData = [], sx }: NavSearchProps) {
  const router = useRouter();
  const pathname = usePathname();

  const options = navData?.flatMap((section) => section.items);
  const activeOption = options?.find((opt) => isEqualPath(opt.href, pathname));

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<NavItemData | null>(activeOption || null);

  const handleChange = useCallback(
    (item: NavItemData | null) => {
      setSelectedItem(item);
      if (item) {
        router.push(item?.href);
      }
    },
    [router]
  );

  const paperStyles: SxProps<Theme> = {
    width: 240,
    [`& .${autocompleteClasses.listbox}`]: {
      [`& .${autocompleteClasses.option}`]: {
        p: 0,
        [`& .${linkClasses.root}`]: {
          px: 1,
          py: 0.5,
          width: 1,
        },
      },
    },
  };

  const textFieldStyles: SxProps<Theme> = {
    [`& .${inputBaseClasses.input}`]: {
      typography: "body2",
      fontWeight: "fontWeightMedium",
    },
  };

  return (
    <Autocomplete
      sx={sx}
      autoHighlight
      disableClearable
      popupIcon={null}
      options={options}
      value={selectedItem as NavItemData}
      onChange={(_event, newValue) => handleChange(newValue)}
      onInputChange={(_event, newValue) => setSearchQuery(newValue)}
      getOptionLabel={(option) => option.name}
      noOptionsText={<SearchNotFound query={searchQuery} />}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      slotProps={{ paper: { sx: paperStyles } }}
      renderInput={(params) => (
        <TextField
          {...params}
          hiddenLabel
          size="small"
          variant="filled"
          placeholder="Search..."
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={textFieldStyles}
        />
      )}
      renderOption={(props, item, { inputValue }) => {
        const matches = match(item.name, inputValue);
        const parts = parse(item.name, matches);

        return (
          <li {...props} key={item.name}>
            <Link key={item.name} component={RouterLink} href={item.href} color="inherit" underline="none">
              {parts.map((part, index) => (
                <Typography
                  key={index}
                  component="span"
                  color={part.highlight ? "primary" : "textPrimary"}
                  sx={{
                    typography: "body2",
                    fontWeight: part.highlight ? "fontWeightSemiBold" : "fontWeightMedium",
                  }}
                >
                  {part.text}
                </Typography>
              ))}
            </Link>
          </li>
        );
      }}
    />
  );
}
