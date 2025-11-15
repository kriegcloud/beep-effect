// import { toast } from "@beep/ui/molecules";
import { Iconify } from "@beep/ui/atoms";
import { Form } from "@beep/ui/form";
import type { Theme } from "@mui/material";
import {
  Button,
  Chip,
  Link,
  List,
  ListItem,
  ListItemText,
  listItemTextClasses,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useState } from "react";

import { AccountFormDialog } from "../common/AccountFormDialog";

const qrCode = {
  img: `/images/account/2.webp`,
  code: "3412 1234 6355 1234",
};

const AlternateLoginMethod = () => {
  const [open, setOpen] = useState(false);

  const upSm = useMediaQuery<Theme>((theme) => theme.breakpoints.up("sm"));

  return (
    <Form>
      <Stack spacing={1} alignItems="flex-start">
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Use an authenticator app
        </Typography>
        <Chip label="Recommended" color="success" variant="soft" />
      </Stack>
      <List
        sx={{
          [`& .${listItemTextClasses.primary}`]: {
            fontSize: "body2.fontSize",
            color: "text.secondary",
            display: "list-item",
            listStyleType: "decimal",
          },
        }}
      >
        <ListItem>
          <ListItemText
            primary={
              <>
                Download an authenticator app such as <Link href="#!">Microsoft Authenticator</Link>
              </>
            }
            slotProps={{ primary: { variant: "body2" } }}
          />
        </ListItem>
        <ListItem>
          <ListItemText>
            <Stack direction="column" spacing={1}>
              <Typography variant="body2">Scan this QR Code or copy the key</Typography>
              <Stack spacing={{ xs: 3, sm: 5 }} alignItems="center" ml={-2.5}>
                {/*<BaseImage src={qrCode.img} width={90} height={90} alt="qr-code" />*/}

                <Typography variant={upSm ? "h6" : "subtitle1"} sx={{ color: "text.primary", fontWeight: 700 }}>
                  {qrCode.code}
                </Typography>
              </Stack>
            </Stack>
          </ListItemText>
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`
            Copy and enter 6 digit code from the app whenever you are trying to log in.
            `}
            slotProps={{ primary: { variant: "body2" } }}
          />
        </ListItem>
      </List>

      <Stack direction="column" alignItems="flex-start">
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Use security key
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Use a physical security key to gain access to your account instantly.
        </Typography>
        <Button
          variant="soft"
          endIcon={<Iconify icon="material-symbols:chevron-right" sx={{ fontSize: 20 }} />}
          onClick={() => setOpen(true)}
        >
          Register security key
        </Button>
      </Stack>

      <AccountFormDialog
        title="Security Key Setup"
        subtitle={
          <>
            <Typography component="span" variant="body2" sx={{ display: "inline-block", mb: 2, textWrap: "pretty" }}>
              This will allow abcd.com to see the make and model of your security key. abcd.com needs to create a secure
              credential on your key so you can sign in without typing your username.
            </Typography>
            <Typography component="span" variant="body2" sx={{ textWrap: "pretty" }}>
              Enter your security key PIN to proceed securely.
            </Typography>
          </>
        }
        open={open}
        handleDialogClose={() => setOpen(false)}
        onSubmit={() => {}}
        sx={{
          maxWidth: 463,
        }}
      >
        <Stack direction="column" spacing={1} px={0.125} pb={0.125}></Stack>
      </AccountFormDialog>
    </Form>
  );
};

export default AlternateLoginMethod;
