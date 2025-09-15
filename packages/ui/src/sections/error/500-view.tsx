"use client";

import { MotionContainer, varBounce } from "@beep/ui/animate";
import { ServerErrorIllustration } from "@beep/ui/assets/illustrations";
import { SimpleLayout } from "@beep/ui/layouts/simple";
import { RouterLink } from "@beep/ui/routing";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { m } from "framer-motion";

export function View500() {
  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <Container component={MotionContainer}>
        <m.div variants={varBounce("in")}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            500 Internal server error
          </Typography>
        </m.div>

        <m.div variants={varBounce("in")}>
          <Typography sx={{ color: "text.secondary" }}>There was an error, please try again later.</Typography>
        </m.div>

        <m.div variants={varBounce("in")}>
          <ServerErrorIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </m.div>

        <Button component={RouterLink} href="/" size="large" variant="contained">
          Go to home
        </Button>
      </Container>
    </SimpleLayout>
  );
}
