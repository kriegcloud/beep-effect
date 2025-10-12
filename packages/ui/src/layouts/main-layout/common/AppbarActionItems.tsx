import type { SxProps } from "@mui/material";
import Stack from "@mui/material/Stack";
import type { ReactElement } from "react";
import LanguageMenu from "./LanguageMenu";
// import NotificationMenu from './NotificationMenu';
import ProfileMenu from "./ProfileMenu";
import ThemeToggler from "./ThemeToggler";

interface AppbarActionItemsProps {
  type?: "default" | "slim";
  sx?: SxProps;
  searchComponent?: ReactElement;
}

const AppbarActionItems = ({ type = "default", sx, searchComponent }: AppbarActionItemsProps) => {
  return (
    <Stack
      className="action-items"
      spacing={1}
      sx={{
        alignItems: "center",
        ml: "auto",
        ...sx,
      }}
    >
      {searchComponent}
      <LanguageMenu type={type} />
      <ThemeToggler type={type} />
      {/*<NotificationMenu type={type} />*/}
      <ProfileMenu type={type} />
    </Stack>
  );
};

export default AppbarActionItems;
