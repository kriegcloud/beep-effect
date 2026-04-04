import { Order } from "effect";

export const descendingNumber = <A>(f: (value: A) => number): Order.Order<A> =>
  Order.mapInput(Order.Number, (value: A) => -f(value));

export const ascendingNumber = <A>(f: (value: A) => number): Order.Order<A> => Order.mapInput(Order.Number, f);

export const ascendingString = <A>(f: (value: A) => string): Order.Order<A> => Order.mapInput(Order.String, f);
