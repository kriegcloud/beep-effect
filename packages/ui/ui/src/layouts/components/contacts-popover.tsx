"use client";

import { transitionTap, varHover, varTap } from "@beep/ui/animate";
import { usePopover } from "@beep/ui/hooks";
import { Scrollbar } from "@beep/ui/molecules";
import { CustomPopover } from "@beep/ui/organisms";
import { fToNow } from "@beep/ui-core/utils/format-time";
import Avatar from "@mui/material/Avatar";
import type { BadgeProps } from "@mui/material/Badge";
import Badge from "@mui/material/Badge";
import type { IconButtonProps } from "@mui/material/IconButton";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Typography from "@mui/material/Typography";
import { UsersThreeIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { m } from "framer-motion";
import { useEffect, useState } from "react";

// ----------------------------------------------------------------------

export type ContactsPopoverProps = IconButtonProps & {
  readonly data?:
    | {
        readonly id: string;
        readonly role: string;
        readonly name: string;
        readonly email: string;
        readonly status: string;
        readonly address: string;
        readonly avatarUrl: string;
        readonly phoneNumber: string;
        readonly lastActivity: string;
      }[]
    | undefined;
};

type Contact = NonNullable<ContactsPopoverProps["data"]>[number];

type ContactWithRelativeLastActivity = Contact & {
  relativeLastActivity: string;
};

export function ContactsPopover({ data = [], sx, ...other }: ContactsPopoverProps) {
  const { open, anchorEl, onClose, onOpen } = usePopover();

  const [contactsWithRelativeLastActivity, setContactsWithRelativeLastActivity] = useState<
    ContactWithRelativeLastActivity[]
  >(() =>
    F.pipe(
      data,
      A.map(
        (contact): ContactWithRelativeLastActivity => ({
          ...contact,
          relativeLastActivity: "",
        })
      )
    )
  );

  useEffect(() => {
    setContactsWithRelativeLastActivity(
      F.pipe(
        data,
        A.map(
          (contact): ContactWithRelativeLastActivity => ({
            ...contact,
            relativeLastActivity: contact.status === "offline" ? fToNow(contact.lastActivity) : "",
          })
        )
      )
    );
  }, [data]);

  const renderMenuList = () => (
    <CustomPopover open={open} anchorEl={anchorEl} onClose={onClose}>
      <Typography variant="h6" sx={{ p: 1.5 }}>
        Contacts <span>({contactsWithRelativeLastActivity.length})</span>
      </Typography>

      <Scrollbar sx={{ height: 320, width: 320 }}>
        <MenuList>
          {F.pipe(
            contactsWithRelativeLastActivity,
            A.map((contact) => (
              <MenuItem key={contact.id} sx={{ p: 1 }}>
                <Badge variant={contact.status as Exclude<BadgeProps["variant"], undefined>} badgeContent=" ">
                  <Avatar alt={contact.name} src={contact.avatarUrl} />
                </Badge>

                <ListItemText
                  primary={contact.name}
                  secondary={contact.relativeLastActivity}
                  slotProps={{
                    secondary: {
                      sx: { typography: "caption", color: "text.disabled" },
                    },
                  }}
                />
              </MenuItem>
            ))
          )}
        </MenuList>
      </Scrollbar>
    </CustomPopover>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap={varTap(0.96)}
        whileHover={varHover(1.04)}
        transition={transitionTap()}
        aria-label="Contacts button"
        onClick={onOpen}
        sx={[
          (theme) => ({
            ...(open && { bgcolor: theme.vars.palette.action.selected }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...other}
      >
        <UsersThreeIcon size={24} weight="duotone" />
      </IconButton>

      {renderMenuList()}
    </>
  );
}
