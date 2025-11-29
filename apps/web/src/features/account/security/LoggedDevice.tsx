import { BaseImage, Iconify } from "@beep/ui/atoms";
import type { Theme } from "@mui/material";
import { Chip, Stack, Typography, useMediaQuery } from "@mui/material";
import * as DateTime from "effect/DateTime";
import { useState } from "react";
import type { LoggedInDevice } from "@/features/account/security/types";
import { InfoCard } from "../common/InfoCard";
import DeviceDialog from "./DeviceDialog";

interface LoggedDeviceProps {
  readonly loggedInDevice: LoggedInDevice;
}

const LoggedDevice = ({ loggedInDevice }: LoggedDeviceProps) => {
  const { name, icon, location, currentlyLoggedIn, lastLoggedTime } = loggedInDevice;
  const upSm = useMediaQuery<Theme>((theme) => theme.breakpoints.up("sm"));
  const downSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));

  const [open, setOpen] = useState(false);

  return (
    <>
      <InfoCard setOpen={setOpen} sx={{ p: 3 }}>
        <Stack spacing={2} flexGrow={1} direction={"row"}>
          <BaseImage src={icon} alt="" height={40} width={40} sx={{ width: "auto", height: 40 }} />

          <Stack direction="column" spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {name}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 400, color: "text.secondary", mb: 1 }}>
              {location}
            </Typography>
            {downSm && currentlyLoggedIn && <Chip label="Currently logged in" color="info" sx={{ mb: 1 }} />}
            <Typography variant="subtitle2" sx={{ fontWeight: 400 }}>
              {currentlyLoggedIn
                ? `Today at ${DateTime.format({
                    locale: "en-US",
                    dateStyle: "long",
                    timeStyle: "short",
                  })(DateTime.unsafeFromDate(lastLoggedTime))}`
                : `Last logged in at ${DateTime.format({
                    locale: "en-US",
                    dateStyle: "long",
                    timeStyle: "short",
                  })(DateTime.unsafeFromDate(lastLoggedTime))}`}
            </Typography>
          </Stack>
        </Stack>
        <Stack spacing={1} alignItems="center" direction={"row"}>
          {upSm && currentlyLoggedIn && <Chip label="Currently logged in" color="info" />}

          <Iconify icon="material-symbols:arrow-forward-ios" sx={{ fontSize: 20 }} />
        </Stack>
      </InfoCard>
      <DeviceDialog open={open} handleDialogClose={() => setOpen(false)} loggedInDevice={loggedInDevice} />
    </>
  );
};

export default LoggedDevice;
