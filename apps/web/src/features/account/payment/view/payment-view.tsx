"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { PaymentBillingAddress } from "../payment-billing-address";
import { PaymentMethods } from "../payment-methods";
import { PaymentSummary } from "../payment-summary";

// ----------------------------------------------------------------------

export function PaymentView() {
  return (
    <Container sx={{ pt: { xs: 3, md: 5 }, pb: 10 }}>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
        {`Let's finish powering you up!`}
      </Typography>

      <Typography align="center" sx={{ color: "text.secondary", mb: 5 }}>
        Professional plan is right for you.
      </Typography>

      <Grid container rowSpacing={{ xs: 5, md: 0 }} columnSpacing={{ xs: 0, md: 5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={[
              (theme) => ({
                gap: 5,
                p: { md: 5 },
                display: "grid",
                borderRadius: 2,
                gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(2, 1fr)" },
                border: { md: `dashed 1px ${theme.vars.palette.divider}` },
              }),
            ]}
          >
            <PaymentBillingAddress />

            <PaymentMethods />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <PaymentSummary />
        </Grid>
      </Grid>
    </Container>
  );
}
