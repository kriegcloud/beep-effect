import { Iconify } from "@beep/ui/atoms";
import { Stack, Typography } from "@mui/material";
import * as DateTime from "effect/DateTime";
import { useState } from "react";
import type { ConnectedInDevice } from "@/features/account/security/types";
import { InfoCard } from "../common/InfoCard";
import SecurityKeyEditFormDialog from "./SecurityKeyEditFormDialog";

interface ConnectedDeviceProps {
  readonly connectedDevice: ConnectedInDevice;
}

const ConnectedDevice = ({ connectedDevice }: ConnectedDeviceProps) => {
  const { deviceName, connected, used, currentlyUsed, lastUsedDate, deviceIcon } = connectedDevice;

  const [open, setOpen] = useState(false);

  return (
    <>
      <InfoCard setOpen={setOpen} sx={{ p: 3 }}>
        <Stack direction={"row"} alignItems={"flex-start"} spacing={2} flexGrow={1}>
          <Iconify icon={deviceIcon} width={40} height={40} />
          <Stack direction="column" spacing={1}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {deviceName}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 400, color: "text.secondary", mb: 1 }}>
              {connected ? "Connected" : "Not connected"}
            </Typography>
            <Typography variant="body2">
              {used
                ? currentlyUsed
                  ? "Currently Used"
                  : `Last used at ${DateTime.format({
                      locale: "en-US",
                      dateStyle: "long",
                      timeStyle: "short",
                    })(DateTime.unsafeFromDate(lastUsedDate))}`
                : "Not yet Used"}
            </Typography>
          </Stack>
        </Stack>
        <Iconify
          icon="material-symbols-light:edit-outline"
          sx={{ fontSize: 20, color: "neutral.dark", visibility: "hidden" }}
        />
      </InfoCard>
      <SecurityKeyEditFormDialog open={open} handleDialogClose={() => setOpen(false)} device={connectedDevice} />
    </>
  );
};

export default ConnectedDevice;
