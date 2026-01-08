"use client";

import { fAdd, fSub } from "@beep/utils/format-time";
import * as A from "effect/Array";
import * as F from "effect/Function";

import { _mock } from "./_mock";
import { _addressBooks } from "./_others";
import { _tags } from "./assets";

// ----------------------------------------------------------------------

export const INVOICE_STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "draft", label: "Draft" },
] as const;

export const INVOICE_SERVICE_OPTIONS = A.makeBy(8, (index) => ({
  id: _mock.id(index),
  name: _tags[index]!,
  price: _mock.number.price(index),
}));

const ITEMS = A.makeBy(3, (index) => {
  const total = INVOICE_SERVICE_OPTIONS[index]!.price * _mock.number.nativeS(index);

  return {
    id: _mock.id(index),
    total,
    title: _mock.productName(index),
    description: _mock.sentence(index),
    price: INVOICE_SERVICE_OPTIONS[index]!.price,
    service: INVOICE_SERVICE_OPTIONS[index]!.name,
    quantity: _mock.number.nativeS(index),
  };
});

export const _invoices = A.makeBy(20, (index) => {
  const taxes = _mock.number.price(index + 1);

  const discount = _mock.number.price(index + 2);

  const shipping = _mock.number.price(index + 3);

  const subtotal = F.pipe(
    ITEMS,
    A.reduce(0, (acc, item) => acc + item.price * item.quantity)
  );

  const totalAmount = subtotal - shipping - discount + taxes;

  const status = (index % 2 && "paid") || (index % 3 && "pending") || (index % 4 && "overdue") || "draft";

  return {
    id: _mock.id(index),
    taxes,
    status,
    discount,
    shipping,
    subtotal,
    totalAmount,
    items: ITEMS,
    invoiceNumber: `INV-199${index}`,
    invoiceFrom: _addressBooks[index]!,
    invoiceTo: _addressBooks[index + 1],
    sent: _mock.number.nativeS(index),
    createDate: fSub({ days: index }),
    dueDate: fAdd({ days: index + 15, hours: index }),
  };
});
