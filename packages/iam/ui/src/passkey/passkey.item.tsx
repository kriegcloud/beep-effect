import type { PasskeyView } from "@beep/iam-sdk/clients/passkey/passkey.contracts";
import { Iconify } from "@beep/ui/atoms/iconify/iconify";
import IconButton from "@mui/material/Button";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";

type Props = {
  readonly passkey: PasskeyView.Type;
  readonly onUpdate: (passkey: PasskeyView.Type) => void;
  readonly onDelete: (passkey: PasskeyView.Type) => Promise<void>;
};

export const PasskeyItem = ({ passkey, onUpdate, onDelete }: Props) => {
  return (
    <ListItem
      secondaryAction={
        <Stack direction={"row"}>
          <IconButton
            sx={{ borderRadius: "50%", height: "36px", width: "36px" }}
            component={ListItemIcon}
            onClick={() => onUpdate(passkey)}
          >
            <Iconify icon={"material-symbols:edit"} />
          </IconButton>
          <IconButton
            sx={{ borderRadius: "50%", height: "36px", width: "36px" }}
            component={ListItemIcon}
            onClick={async () => onDelete(passkey)}
          >
            <Iconify icon={"solar:trash-bin-trash-bold"} />
          </IconButton>
        </Stack>
      }
      sx={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <ListItemText primary={passkey.name} />
    </ListItem>
  );
};
