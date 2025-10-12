import type { NavColor } from "@beep/ui-core/settings";
import { Box, Button, Stack, type SxProps, Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useSettingsContext } from "../SettingsProvider";
import { SET_NAV_COLOR } from "../SettingsReducer";

interface ItemProps {
  label: string;
  sx: SxProps;
  active?: boolean;
  onClick: () => void;
}

const Item = ({ label, sx, active, onClick }: ItemProps) => {
  return (
    <Button
      sx={{
        p: 2,
        gap: 2,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        bgcolor: active ? "primary.lighter" : "background.elevation1",
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          height: 40,
          width: 40,
          borderRadius: "50%",
          ...sx,
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontWeight: active ? 500 : 400,
          color: active ? "primary.main" : "text.primary",
        }}
      >
        {label}
      </Typography>
    </Button>
  );
};

const NavColorPanel = () => {
  const {
    config: { navColor },
    configDispatch,
  } = useSettingsContext();

  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (value: NavColor.Type) => {
    router.replace(pathname);
    configDispatch({
      type: SET_NAV_COLOR,
      payload: value,
    });
  };

  return (
    <Stack
      sx={{
        gap: 2,
      }}
    >
      <Item
        label="Default"
        sx={{
          bgcolor: "background.default",
          border: 2,
          borderColor: "divider",
        }}
        active={navColor === "default"}
        onClick={() => handleClick("default")}
      />
      <Item
        label="Vibrant"
        sx={{
          background: "linear-gradient(163.93deg, #7DB1F5 3.83%, #62C29F 132.96%)",
        }}
        active={navColor === "vibrant"}
        onClick={() => handleClick("vibrant")}
      />
    </Stack>
  );
};

export default NavColorPanel;
