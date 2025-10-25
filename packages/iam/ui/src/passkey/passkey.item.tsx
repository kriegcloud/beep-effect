import type { PasskeyView } from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import { Iconify } from "@beep/ui/atoms/iconify/iconify";
import IconButton from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";

type Props = {
  readonly passkey: PasskeyView.Type;
  readonly onUpdate: () => void;
  readonly onDelete: (passkey: PasskeyView.Type) => void;
};

export const PasskeyItem = ({ passkey, onUpdate, onDelete }: Props) => {
  return (
    <ListItem
      sx={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <ListItemText title={passkey.name} />
      <Stack direction={"column"} spacing={2}>
        <IconButton onClick={() => onUpdate()}>
          <Iconify icon={"material-symbols:edit"} />
        </IconButton>
        <IconButton onClick={() => onDelete(passkey)}>
          <Iconify icon={"solar:trash-bin-trash-bold"} />
        </IconButton>
      </Stack>
    </ListItem>
  );
};
