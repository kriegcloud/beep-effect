import { Iconify } from "@beep/ui/atoms";
import { useBoolean } from "@beep/ui/hooks";
import { fCurrency, fDate } from "@beep/ui-core/utils";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { CardProps } from "@mui/material/Card";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import type { IUserAccountBillingHistory } from "./types";

// ----------------------------------------------------------------------

type Props = CardProps & {
  invoices: IUserAccountBillingHistory[];
};

export function AccountBillingHistory({ invoices, sx, ...other }: Props) {
  const showMore = useBoolean();

  return (
    <Card sx={sx} {...other}>
      <CardHeader title="Invoice history" />

      <Box
        sx={{
          px: 3,
          pt: 3,
          gap: 1.5,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {(showMore.value ? invoices : invoices.slice(0, 8)).map((invoice) => (
          <Box key={invoice.id} sx={{ display: "flex", alignItems: "center" }}>
            <ListItemText
              primary={invoice.invoiceNumber}
              secondary={fDate(invoice.createdAt)}
              slotProps={{
                primary: { sx: { typography: "body2" } },
                secondary: {
                  sx: { mt: 0.5, typography: "caption", color: "text.disabled" },
                },
              }}
            />

            <Typography variant="body2" sx={{ mr: 5 }}>
              {fCurrency(invoice.price)}
            </Typography>

            <Link color="inherit" underline="always" variant="body2" href="#">
              PDF
            </Link>
          </Box>
        ))}

        <Divider sx={{ borderStyle: "dashed" }} />
      </Box>

      <Box sx={{ p: 2 }}>
        <Button
          size="small"
          color="inherit"
          startIcon={
            <Iconify
              width={16}
              icon={showMore.value ? "eva:arrow-ios-upward-fill" : "eva:arrow-ios-downward-fill"}
              sx={{ mr: -0.5 }}
            />
          }
          onClick={showMore.onToggle}
        >
          Show {showMore.value ? `less` : `more`}
        </Button>
      </Box>
    </Card>
  );
}
