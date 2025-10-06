"use client";

import { MotionContainer, varBounce } from "@beep/ui/animate";
import { PageNotFoundIllustration } from "@beep/ui/assets/illustrations";
import { SimpleLayout } from "@beep/ui/layouts/simple";
import { RouterLink } from "@beep/ui/routing";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { m } from "framer-motion";

export function NotFoundView() {
  return (
    <SimpleLayout
      slotProps={{
        content: { compact: true },
      }}
    >
      <Container component={MotionContainer}>
        <m.div variants={varBounce("in")}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Sorry, page not found!
          </Typography>
        </m.div>

        <m.div variants={varBounce("in")}>
          <Typography sx={{ color: "text.secondary" }}>
            Sorry, we couldn’t find the page you’re looking for. Perhaps you’ve mistyped the URL? Be sure to check your
            spelling.
          </Typography>
        </m.div>

        <m.div variants={varBounce("in")}>
          <PageNotFoundIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </m.div>

        <Button component={RouterLink} href="/" size="large" variant="contained">
          Go to home
        </Button>
      </Container>
    </SimpleLayout>
  );
}
