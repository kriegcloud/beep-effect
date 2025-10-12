"use client";

import { Iconify, type IconifyProps } from "@beep/ui/atoms";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { SET_LOCALE } from "@beep/ui/settings-v2/SettingsReducer";
import { languages, type SupportedLanguage } from "@beep/ui-core/i18n/languages";
import { Button, ListItemIcon, ListItemText, MenuItem, Typography } from "@mui/material";
import Menu from "@mui/material/Menu";
import { useMemo, useState } from "react";

interface LanguageMenuProps {
  type?: "default" | "slim";
}

const LanguageMenu = ({ type = "default" }: LanguageMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const {
    config: { locale },
    configDispatch,
  } = useSettingsContext();
  const open = Boolean(anchorEl);

  const selectedLanguage = useMemo(() => {
    return languages.find((lang) => lang.locale === locale) || languages[0];
  }, [locale]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (language: SupportedLanguage) => {
    configDispatch({
      type: SET_LOCALE,
      payload: language.locale,
    });
  };

  return (
    <>
      <Button
        color="neutral"
        size={type === "slim" ? "small" : "medium"}
        variant="text"
        shape="circle"
        onClick={handleClick}
      >
        <Iconify icon={selectedLanguage?.icon as IconifyProps["icon"]} sx={{ fontSize: type === "slim" ? 20 : 24 }} />
      </Button>
      <Menu
        anchorEl={anchorEl}
        id="language-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.shortLabel}
            onClick={() => {
              handleItemClick(language);
            }}
            selected={locale === language.locale}
            sx={{ minWidth: 200 }}
          >
            <ListItemIcon>
              <Iconify icon={language.icon as IconifyProps["icon"]} sx={{ fontSize: 24 }} />
            </ListItemIcon>
            <ListItemText
              primary={language.label}
              slotProps={{
                primary: { sx: { fontSize: 14 } },
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{
                color: "text.secondary",
                fontWeight: "normal",
              }}
            >
              {language.currencySymbol}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageMenu;
