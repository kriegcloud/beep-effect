import { RouterLink } from "@beep/ui/routing";
import type { ButtonProps } from "@mui/material/Button";
import Button from "@mui/material/Button";

export function SignInButton({ sx, ...other }: ButtonProps) {
  return (
    <Button component={RouterLink} href={"/"} variant="outlined" sx={sx ?? {}} {...other}>
      Sign in
    </Button>
  );
}
