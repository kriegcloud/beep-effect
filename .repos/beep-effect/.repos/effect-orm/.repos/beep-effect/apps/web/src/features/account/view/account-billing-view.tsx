"use client";
import { _userAddressBook, _userInvoices, _userPayment, _userPlans } from "@beep/mock/_user";
import { AccountBilling } from "../account-billing";

// ----------------------------------------------------------------------

export function AccountBillingView() {
  return (
    <AccountBilling plans={_userPlans} cards={_userPayment} invoices={_userInvoices} addressBook={_userAddressBook} />
  );
}
