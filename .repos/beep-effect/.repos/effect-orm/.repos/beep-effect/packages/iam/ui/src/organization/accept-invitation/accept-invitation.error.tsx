import { paths } from "@beep/shared-domain";
import { Iconify } from "@beep/ui/atoms";
import { RouterLink } from "@beep/ui/routing";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export function InvitationError() {
  return (
    <Card sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Iconify icon="solar:danger-bold" width={24} sx={{ color: "error.main" }} />
          <Typography variant="h6" color="error.main">
            Invitation error
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          There was an issue with your invitation.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          The invitation you&apos;re trying to access is either invalid or you don&apos;t have the correct permissions.
          Please check your email for a valid invitation or contact the person who sent it.
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button component={RouterLink} href={paths.dashboard.root} variant="outlined" fullWidth>
          Go back to home
        </Button>
      </CardActions>
    </Card>
  );
}
