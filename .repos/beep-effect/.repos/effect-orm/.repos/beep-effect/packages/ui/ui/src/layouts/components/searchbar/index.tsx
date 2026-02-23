"use client";

import { Iconify, Label } from "@beep/ui/atoms";
import { useBoolean } from "@beep/ui/hooks";
import { SearchNotFound } from "@beep/ui/messages";
import { Scrollbar } from "@beep/ui/molecules";
import type { NavSectionProps } from "@beep/ui/routing";
import { rgbaFromChannel } from "@beep/ui-core/utils";
import { match, parse } from "@beep/utils/autosuggest-highlight";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import Dialog, { dialogClasses } from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputBase, { inputBaseClasses } from "@mui/material/InputBase";
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import type { Breakpoint } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as Str from "effect/String";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ResultItem } from "./result-item";
import { applyFilter, flattenNavSections } from "./utils";

export type SearchbarProps = BoxProps & {
  readonly data?: NavSectionProps["data"] | undefined;
};

const breakpoint: Breakpoint = "sm";

export function Searchbar({ data: navItems = [], sx, ...other }: SearchbarProps) {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up(breakpoint));

  const { value: open, onFalse: onClose, onTrue: onOpen, onToggle } = useBoolean();
  const [searchQuery, setSearchQuery] = useState("");

  const handleClose = useCallback(() => {
    onClose();
    setSearchQuery("");
  }, [onClose]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.metaKey && pipe(event.key, Str.toLowerCase) === "k") {
        event.preventDefault();
        onToggle();
        setSearchQuery("");
      }
    },
    [onToggle]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleSearch = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  const formattedNavItems = flattenNavSections(navItems);

  const dataFiltered = useMemo(
    () =>
      applyFilter({
        inputData: formattedNavItems,
        query: searchQuery,
      }),
    [formattedNavItems, searchQuery]
  );

  const notFound = searchQuery && !dataFiltered.length;

  const renderButton = () => (
    <Box
      onClick={onOpen}
      sx={[
        {
          display: "flex",
          alignItems: "center",
          [theme.breakpoints.up(breakpoint)]: {
            pr: 1,
            borderRadius: 1.5,
            cursor: "pointer",
            bgcolor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
            transition: theme.transitions.create("background-color", {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.shortest,
            }),
            "&:hover": {
              bgcolor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.16),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : A.make(sx)),
      ]}
      {...other}
    >
      <Box
        component={smUp ? "span" : IconButton}
        sx={{
          [theme.breakpoints.up(breakpoint)]: {
            p: 1,
            display: "inline-flex",
            color: "action.active",
          },
        }}
      >
        <Iconify icon="eva:search-fill" />
      </Box>

      <Label
        sx={{
          color: "grey.800",
          cursor: "inherit",
          bgcolor: "common.white",
          fontSize: theme.typography.pxToRem(12),
          ...(theme.vars.customShadows.z1 ? { boxShadow: theme.vars.customShadows.z1 } : {}),
          display: { xs: "none", [breakpoint]: "inline-flex" },
        }}
      >
        ⌘K
      </Label>
    </Box>
  );

  const renderResults = () => (
    <MenuList
      disablePadding
      sx={{
        [`& .${menuItemClasses.root}`]: {
          p: 0,
          mb: 0,
          "&:hover": { bgcolor: "transparent" },
        },
      }}
    >
      {A.map(dataFiltered, (item) => {
        const matchesTitle = match(item.title, searchQuery, {
          insideWords: true,
        });
        const partsTitle = parse(item.title, matchesTitle);

        const matchesPath = match(item.path, searchQuery, {
          insideWords: true,
        });
        const partsPath = parse(item.path, matchesPath);

        return (
          <MenuItem disableRipple key={`${item.title}${item.path}`}>
            <ResultItem
              path={partsPath}
              title={partsTitle}
              href={item.path}
              labels={pipe(item.group, Str.split("."))}
              onClick={handleClose}
            />
          </MenuItem>
        );
      })}
    </MenuList>
  );

  return (
    <>
      {renderButton()}

      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={handleClose}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: 100,
        }}
        sx={[
          {
            [`& .${dialogClasses.paper}`]: { mt: 15, overflow: "unset" },
            [`& .${dialogClasses.container}`]: { alignItems: "flex-start" },
          },
        ]}
      >
        <InputBase
          fullWidth
          autoFocus={open}
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" width={24} sx={{ color: "text.disabled" }} />
            </InputAdornment>
          }
          endAdornment={<Label sx={{ letterSpacing: 1, color: "text.secondary" }}>esc</Label>}
          inputProps={{ id: "search-input" }}
          sx={{
            p: 3,
            borderBottom: `solid 1px ${theme.vars.palette.divider}`,
            [`& .${inputBaseClasses.input}`]: { typography: "h6" },
          }}
        />

        {notFound ? (
          <SearchNotFound query={searchQuery} sx={{ py: 15, px: 2.5 }} />
        ) : (
          <Scrollbar sx={{ p: 2.5, height: 400 }}>{renderResults()}</Scrollbar>
        )}
      </Dialog>
    </>
  );
}
