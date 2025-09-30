"use client";
import { FormHead } from "@beep/iam-ui/_components";
import { paths } from "@beep/shared-domain";
import { useBoolean } from "@beep/ui/hooks";
import { EmailInboxIcon } from "@beep/ui/icons";
import { SplashScreen } from "@beep/ui/progress/loading-screen/splash-screen";
import { RouterLink } from "@beep/ui/routing";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
export const EmailVerificationSent = () => {
  const { value: isLoading, setValue: setIsLoading } = useBoolean();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack spacing={2}>
      <FormHead
        icon={<EmailInboxIcon />}
        title={"Please check your email!"}
        description={`We've emailed a confirmation link to you your email address.`}
      />
      <Button
        variant={"contained"}
        color={"primary"}
        component={RouterLink}
        onClick={() => setIsLoading(true)}
        href={paths.root}
        fullWidth
      >
        continue.
      </Button>
    </Stack>
  );
};
