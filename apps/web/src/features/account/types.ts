export type IDateValue = string | number | null;

export type IUserAccountBillingHistory = {
  readonly id: string;
  readonly price: number;
  readonly invoiceNumber: string;
  readonly createdAt: IDateValue;
};

export type IPaymentCard = {
  readonly id: string;
  readonly cardType: string;
  readonly primary?: boolean | undefined;
  readonly cardNumber: string;
};

export type IAddressItem = {
  readonly id?: string;
  readonly name: string;
  readonly company?: string | undefined;
  readonly primary?: boolean | undefined;
  readonly fullAddress: string;
  readonly phoneNumber?: string | undefined;
  readonly addressType?: string | undefined;
};

export type ISocialLink = {
  readonly x: string;
  readonly facebook: string;
  readonly linkedin: string;
  readonly instagram: string;
};
