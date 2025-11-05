import { useRouter } from "@beep/ui/hooks";
import { toast } from "@beep/ui/molecules";
import { useAuthAdapterProvider } from "@beep/ui/providers";
import type { ButtonProps } from "@mui/material/Button";
import Button from "@mui/material/Button";
import { useCallback } from "react";

type Props = ButtonProps & {
  onClose?: () => void;
};

export function SignOutButton({ onClose, sx, ...other }: Props) {
  const router = useRouter();

  const { signOut } = useAuthAdapterProvider();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();

      onClose?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Unable to logout!");
    }
  }, [onClose, router]);

  return (
    <Button fullWidth variant="soft" size="large" color="error" onClick={handleLogout} sx={sx ?? {}} {...other}>
      Logout
    </Button>
  );
}
