import { Iconify, Label } from "@beep/ui/atoms";
import { useBoolean } from "@beep/ui/hooks";
import { PlanFreeIcon, PlanPremiumIcon, PlanStarterIcon } from "@beep/ui/icons";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import { useCallback, useState } from "react";
import { AddressListDialog } from "./address";
import { PaymentCardListDialog } from "./payment/payment-card-list-dialog";
import type { IAddressItem, IPaymentCard } from "./types";

// ----------------------------------------------------------------------

type Props = {
  cardList: IPaymentCard[];
  addressBook: IAddressItem[];
  plans: {
    price: number;
    primary: boolean;
    subscription: string;
  }[];
};

export function AccountBillingPlan({ cardList, addressBook, plans }: Props) {
  const openAddress = useBoolean();

  const openCards = useBoolean();

  const primaryCard = cardList.find((card) => card.primary) || null;
  const primaryAddress = addressBook.find((address) => address.primary) || null;

  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedCard, setSelectedCard] = useState<IPaymentCard | null>(primaryCard);
  const [selectedAddress, setSelectedAddress] = useState<IAddressItem | null>(primaryAddress);

  const handleSelectPlan = useCallback(
    (newValue: string) => {
      const currentPlan = plans.find((plan) => plan.primary);
      if (currentPlan?.subscription !== newValue) {
        setSelectedPlan(newValue);
      }
    },
    [plans]
  );

  const handleSelectAddress = useCallback((newValue: IAddressItem | null) => {
    setSelectedAddress(newValue);
  }, []);

  const handleSelectCard = useCallback((newValue: IPaymentCard | null) => {
    setSelectedCard(newValue);
  }, []);

  const renderPlans = () =>
    plans.map((plan) => (
      <Grid key={plan.subscription} size={{ xs: 12, md: 4 }}>
        <Paper
          variant="outlined"
          onClick={() => handleSelectPlan(plan.subscription)}
          sx={[
            (theme) => ({
              p: 2.5,
              borderRadius: 1.5,
              cursor: "pointer",
              position: "relative",
              ...(plan.primary && { opacity: 0.48, cursor: "default" }),
              ...(plan.subscription === selectedPlan && {
                boxShadow: `0 0 0 2px ${theme.vars.palette.text.primary}`,
              }),
            }),
          ]}
        >
          {plan.primary && (
            <Label
              color="info"
              startIcon={<Iconify icon="eva:star-fill" />}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              Current
            </Label>
          )}

          {plan.subscription === "basic" && <PlanFreeIcon />}
          {plan.subscription === "starter" && <PlanStarterIcon />}
          {plan.subscription === "premium" && <PlanPremiumIcon />}

          <Box
            sx={{
              typography: "subtitle2",
              mt: 2,
              mb: 0.5,
              textTransform: "capitalize",
            }}
          >
            {plan.subscription}
          </Box>

          <Box sx={{ display: "flex", typography: "h4", alignItems: "center" }}>
            {plan.price || "Free"}

            {!!plan.price && (
              <Box component="span" sx={{ typography: "body2", color: "text.disabled", ml: 0.5 }}>
                /mo
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    ));

  const renderDetails = () => (
    <Box
      sx={{
        px: 3,
        pb: 3,
        gap: 2,
        display: "flex",
        typography: "body2",
        flexDirection: "column",
      }}
    >
      {[
        {
          name: "Plan",
          content: (
            <Box component="span" sx={{ textTransform: "capitalize" }}>
              {selectedPlan}
            </Box>
          ),
        },
        {
          name: "Billing name",
          content: (
            <ButtonBase disableRipple onClick={openAddress.onTrue} sx={{ gap: 1, typography: "subtitle2" }}>
              {selectedAddress?.name}
              <Iconify width={16} icon="eva:arrow-ios-downward-fill" />
            </ButtonBase>
          ),
        },
        { name: "Billing address", content: selectedAddress?.fullAddress },
        { name: "Billing phone number", content: selectedAddress?.phoneNumber },
        {
          name: "Payment method",
          content: (
            <ButtonBase disableRipple onClick={openAddress.onTrue} sx={{ gap: 1, typography: "subtitle2" }}>
              {selectedCard?.cardNumber}
              <Iconify width={16} icon="eva:arrow-ios-downward-fill" />
            </ButtonBase>
          ),
        },
      ].map((item) => (
        <Grid key={item.name} container spacing={{ xs: 0.5, md: 2 }}>
          <Grid sx={{ color: "text.secondary" }} size={{ xs: 12, md: 4 }}>
            {item.name}
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>{item.content || "-"}</Grid>
        </Grid>
      ))}
    </Box>
  );

  const renderFooter = () => (
    <Box
      sx={(theme) => ({
        p: 3,
        gap: 1.5,
        display: "flex",
        justifyContent: "flex-end",
        borderTop: `dashed 1px ${theme.vars.palette.divider}`,
      })}
    >
      <Button variant="outlined">Cancel plan</Button>
      <Button variant="contained">Upgrade plan</Button>
    </Box>
  );

  const renderCardListDialog = () => (
    <PaymentCardListDialog
      list={cardList}
      open={openCards.value}
      onClose={openCards.onFalse}
      selected={(selectedId: string) => selectedCard?.id === selectedId}
      onSelect={handleSelectCard}
      action={
        <Button size="small" startIcon={<Iconify icon="mingcute:add-line" />}>
          Add
        </Button>
      }
    />
  );

  const renderAddressListDialog = () => (
    <AddressListDialog
      list={addressBook}
      open={openAddress.value}
      onClose={openAddress.onFalse}
      selected={(selectedId: string) => selectedAddress?.id === selectedId}
      onSelect={handleSelectAddress}
      action={
        <Button size="small" startIcon={<Iconify icon="mingcute:add-line" />}>
          Add
        </Button>
      }
    />
  );

  return (
    <>
      <Card>
        <CardHeader title="Plan" />
        <Grid container spacing={2} sx={{ p: 3 }}>
          {renderPlans()}
        </Grid>
        {renderDetails()}
        {renderFooter()}
      </Card>

      {renderCardListDialog()}
      {renderAddressListDialog()}
    </>
  );
}
