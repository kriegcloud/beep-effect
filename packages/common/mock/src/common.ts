import type { Dayjs } from "dayjs";

// ----------------------------------------------------------------------

export type IPaymentCard = {
  readonly id: string;
  readonly cardType: string;
  readonly primary?: undefined | boolean;
  readonly cardNumber: string;
};

export type IAddressItem = {
  readonly id?: undefined | string;
  readonly name: string;
  readonly company?: undefined | string;
  readonly primary?: undefined | boolean;
  readonly fullAddress: string;
  readonly phoneNumber?: undefined | string;
  readonly addressType?: undefined | string;
};

export type IDateValue = string | number | null;

export type IDatePickerControl = Dayjs | null;

export type ISocialLink = {
  readonly twitter: string;
  readonly facebook: string;
  readonly linkedin: string;
  readonly instagram: string;
};
