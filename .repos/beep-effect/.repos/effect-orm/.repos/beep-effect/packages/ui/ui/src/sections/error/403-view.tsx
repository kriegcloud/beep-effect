"use client";

import { MotionContainer, varBounce } from "@beep/ui/animate";
import { ForbiddenIllustration } from "@beep/ui/assets/illustrations";
import { SimpleLayout } from "@beep/ui/layouts/simple";
import { RouterLink } from "@beep/ui/routing";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { m } from "framer-motion";

export function View403() {
  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <Container component={MotionContainer}>
        <m.div variants={varBounce("in")}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            No permission
          </Typography>
        </m.div>

        <m.div variants={varBounce("in")}>
          <Typography sx={{ color: "text.secondary" }}>
            The page you’re trying to access has restricted access. Please refer to your system administrator.
          </Typography>
        </m.div>

        <m.div variants={varBounce("in")}>
          <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </m.div>

        <Button component={RouterLink} href="/" size="large" variant="contained">
          Go to home
        </Button>
      </Container>
    </SimpleLayout>
  );
}
