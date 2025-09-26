import { paths } from "@beep/constants";
import { FormDivider } from "@beep/iam-ui/_components";
import { FormHead } from "@beep/ui/form/Form";
import { RouterLink } from "@beep/ui/routing/RouterLink";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

export const SignUpEmailView = (
  <>
    <FormHead
      title={"Get Started"}
      description={
        <>
          {`Already have an account? `}
          <Link component={RouterLink} href={paths.auth.signIn} variant={"subtitle2"}>
            Sign in
          </Link>
        </>
      }
      sx={{ textAlign: { xs: "center", md: "left" } }}
    />
    <Box sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
      <FormDivider />
    </Box>
  </>
);
