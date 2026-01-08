import { _lastActivity } from "@beep/mock/_time";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { _mock } from "./_mock";

// ----------------------------------------------------------------------

export const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
] as const;

const ITEMS = A.makeBy(3, (index) => ({
  id: _mock.id(index),
  sku: `16H9UR${index}`,
  quantity: index + 1,
  name: _mock.productName(index),
  coverUrl: _mock.image.product(index),
  price: _mock.number.price(index),
}));

export const _orders = A.makeBy(20, (index) => {
  const shipping = 10;

  const discount = 10;

  const taxes = 10;

  const items = (index % 2 && ITEMS.slice(0, 1)) || (index % 3 && ITEMS.slice(1, 3)) || ITEMS;

  const totalQuantity = F.pipe(
    items,
    A.reduce(0, (acc, item) => acc + item.quantity)
  );

  const subtotal = F.pipe(
    items,
    A.reduce(0, (acc, item) => acc + item.price * item.quantity)
  );

  const totalAmount = subtotal - shipping - discount + taxes;

  const customer = {
    id: _mock.id(index),
    name: _mock.fullName(index),
    email: _mock.email(index),
    avatarUrl: _mock.image.avatar(index),
    ipAddress: "192.158.1.38",
  };

  const delivery = { shipBy: "DHL", speedy: "Standard", trackingNumber: "SPX037739199373" };

  const history = {
    orderTime: _lastActivity[1]!,
    paymentTime: _lastActivity[2]!,
    deliveryTime: _lastActivity[3]!,
    completionTime: _lastActivity[4]!,
    timeline: [
      { title: "Delivery successful", time: _lastActivity[1]! },
      { title: "Transporting to [2]", time: _lastActivity[2]! },
      { title: "Transporting to [1]", time: _lastActivity[3]! },
      { title: "The shipping unit has picked up the goods", time: _lastActivity[4]! },
      { title: "Order has been created", time: _lastActivity[5]! },
    ],
  };

  return {
    id: _mock.id(index),
    orderNumber: `#601${index}`,
    createdAt: _lastActivity[index]!,
    taxes,
    items,
    history,
    subtotal,
    shipping,
    discount,
    customer,
    delivery,
    totalAmount,
    totalQuantity,
    shippingAddress: {
      fullAddress: "19034 Verna Unions Apt. 164 - Honolulu, RI / 87535",
      phoneNumber: "365-374-4961",
    },
    payment: { cardType: "mastercard", cardNumber: "**** **** **** 5678" },
    status: (index % 2 && "completed") || (index % 3 && "pending") || (index % 4 && "cancelled") || "refunded",
  };
});
