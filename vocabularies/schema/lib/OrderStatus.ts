import { schema } from './namespace.js';

const values = {
  OrderCancelled: schema.OrderCancelled,
  OrderDelivered: schema.OrderDelivered,
  OrderInTransit: schema.OrderInTransit,
  OrderPaymentDue: schema.OrderPaymentDue,
  OrderPickupAvailable: schema.OrderPickupAvailable,
  OrderProblem: schema.OrderProblem,
  OrderProcessing: schema.OrderProcessing,
  OrderReturned: schema.OrderReturned,
};

export type OrderStatus = typeof values[keyof typeof values];

export default values;
