import Grid from "@mui/material/Grid";
import { AccountBillingAddress } from "./account-billing-address";
import { AccountBillingHistory } from "./account-billing-history";
import { AccountBillingPayment } from "./account-billing-payment";
import { AccountBillingPlan } from "./account-billing-plan";
import type { IAddressItem, IPaymentCard, IUserAccountBillingHistory } from "./types";

// ----------------------------------------------------------------------

type Props = {
  readonly plans: ReadonlyArray<{
    readonly subscription: string;
    readonly price: number;
    readonly primary: boolean;
  }>;
  readonly cards: ReadonlyArray<IPaymentCard>;
  readonly addressBook: ReadonlyArray<IAddressItem>;
  readonly invoices: ReadonlyArray<IUserAccountBillingHistory>;
};

export function AccountBilling({ cards, plans, invoices, addressBook }: Props) {
  return (
    <Grid container spacing={5}>
      <Grid size={{ xs: 12, md: 12, lg: 8 }}>
        <AccountBillingPlan plans={plans} cardList={cards} addressBook={addressBook} />
        <AccountBillingPayment cards={cards} />
        <AccountBillingAddress addressBook={addressBook} />
      </Grid>

      <Grid size={{ xs: 12, md: 12, lg: 4 }}>
        <AccountBillingHistory invoices={invoices} />
      </Grid>
    </Grid>
  );
}
