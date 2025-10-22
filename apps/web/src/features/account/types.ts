export type IDateValue = string | number | null;

export type IUserAccountBillingHistory = {
  id: string;
  price: number;
  invoiceNumber: string;
  createdAt: IDateValue;
};

export type IPaymentCard = {
  id: string;
  cardType: string;
  primary?: boolean;
  cardNumber: string;
};

export type IAddressItem = {
  id?: string;
  name: string;
  company?: string;
  primary?: boolean;
  fullAddress: string;
  phoneNumber?: string;
  addressType?: string;
};

export type ISocialLink = {
  x: string;
  facebook: string;
  linkedin: string;
  instagram: string;
};
