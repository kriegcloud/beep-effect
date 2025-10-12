"use client";

import { Iconify } from "@beep/ui/atoms";
import sitemap, { type MenuItem } from "@beep/ui/layouts/main-layout/sitemap";
import { Button, Stack } from "@mui/material";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useNavContext } from "../NavProvider";
import NavitemPopover from "./NavItemPopover";

interface TopnavItemsProps {
  type?: "default" | "slim";
}

const TopnavItems = ({ type = "default" }: TopnavItemsProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<null | MenuItem>(null);
  const pathname = usePathname();
  const { isNestedItemOpen } = useNavContext();

  useEffect(() => {
    setAnchorEl(null);
    setSelectedMenu(null);
  }, [pathname]);

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        gap: "2px",
      }}
      className="nav-items"
    >
      {sitemap.map((menu) => (
        <Button
          key={menu.id}
          variant="text"
          className={clsx({
            active: isNestedItemOpen(menu.items),
          })}
          color="inherit"
          size={type === "slim" ? "small" : "large"}
          endIcon={<Iconify icon="material-symbols:expand-more-rounded" />}
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
            setSelectedMenu(menu);
          }}
          sx={[
            (theme) => ({
              px: 2,
              fontSize: 14,
              color: theme.vars.palette.text.secondary,
              "&:hover": {
                color: theme.vars.palette.text.primary,
              },
            }),
            isNestedItemOpen(menu.items) && {
              color: "primary.main",
            },
          ]}
        >
          {menu.subheader}
        </Button>
      ))}
      {selectedMenu && (
        <NavitemPopover
          handleClose={() => {
            setAnchorEl(null);
            setSelectedMenu(null);
          }}
          anchorEl={anchorEl}
          open={!!anchorEl && !!selectedMenu}
          items={selectedMenu.items}
          level={0}
        />
      )}
    </Stack>
  );
};

export default TopnavItems;
