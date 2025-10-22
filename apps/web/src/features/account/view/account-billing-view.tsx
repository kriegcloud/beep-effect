"use client";
import { fSub } from "@beep/ui-core/utils";
import { AccountBilling } from "../account-billing";
export const _id = Array.from({ length: 40 }, (_, index) => `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b${index + 1}`);
export const _prices = [
  83.74, 97.14, 68.71, 85.21, 52.17, 25.18, 43.84, 60.98, 98.42, 53.37, 72.75, 56.61, 64.55, 77.32, 60.62, 79.81, 93.68,
  47.44, 76.24, 92.87, 72.91, 20.54, 94.25, 37.51,
];
export const _fullNames = [
  `Jayvion Simon`,
  `Lucian Obrien`,
  `Deja Brady`,
  `Harrison Stein`,
  `Reece Chung`,
  `Lainey Davidson`,
  `Cristopher Cardenas`,
  `Melanie Noble`,
  `Chase Day`,
  `Shawn Manning`,
  `Soren Durham`,
  `Cortez Herring`,
  `Brycen Jimenez`,
  `Giana Brandt`,
  `Aspen Schmitt`,
  `Colten Aguilar`,
  `Angelique Morse`,
  `Selina Boyer`,
  `Lawson Bass`,
  `Ariana Lang`,
  `Amiah Pruitt`,
  `Harold Mcgrath`,
  `Esperanza Mcintyre`,
  `Mireya Conner`,
];
export const _phoneNumbers = [
  "+1 202-555-0143",
  "+1 416-555-0198",
  "+44 20 7946 0958",
  "+61 2 9876 5432",
  "+91 22 1234 5678",
  "+49 30 123456",
  "+33 1 23456789",
  "+81 3 1234 5678",
  "+86 10 1234 5678",
  "+55 11 2345-6789",
  "+27 11 123 4567",
  "+7 495 123-4567",
  "+52 55 1234 5678",
  "+39 06 123 4567",
  "+34 91 123 4567",
  "+31 20 123 4567",
  "+46 8 123 456",
  "+41 22 123 45 67",
  "+82 2 123 4567",
  "+54 11 1234-5678",
  "+64 9 123 4567",
  "+65 1234 5678",
  "+60 3-1234 5678",
  "+66 2 123 4567",
  "+62 21 123 4567",
  "+63 2 123 4567",
  "+90 212 123 45 67",
  "+966 11 123 4567",
  "+971 2 123 4567",
  "+20 2 12345678",
  "+234 1 123 4567",
  "+254 20 123 4567",
  "+972 3-123-4567",
  "+30 21 1234 5678",
  "+353 1 123 4567",
  "+351 21 123 4567",
  "+47 21 23 45 67",
  "+45 32 12 34 56",
  "+358 9 123 4567",
  "+48 22 123 45 67",
];
export const _fullAddress = [
  `19034 Verna Unions Apt. 164 - Honolulu, RI / 87535`,
  `1147 Rohan Drive Suite 819 - Burlington, VT / 82021`,
  `18605 Thompson Circle Apt. 086 - Idaho Falls, WV / 50337`,
  `110 Lamar Station Apt. 730 - Hagerstown, OK / 49808`,
  `36901 Elmer Spurs Apt. 762 - Miramar, DE / 92836`,
  `2089 Runolfsson Harbors Suite 886 - Chapel Hill, TX / 32827`,
  `279 Karolann Ports Apt. 774 - Prescott Valley, WV / 53905`,
  `96607 Claire Square Suite 591 - St. Louis Park, HI / 40802`,
  `9388 Auer Station Suite 573 - Honolulu, AK / 98024`,
  `47665 Adaline Squares Suite 510 - Blacksburg, NE / 53515`,
  `989 Vernice Flats Apt. 183 - Billings, NV / 04147`,
  `91020 Wehner Locks Apt. 673 - Albany, WY / 68763`,
  `585 Candelario Pass Suite 090 - Columbus, LA / 25376`,
  `80988 Renner Crest Apt. 000 - Fargo, VA / 24266`,
  `28307 Shayne Pike Suite 523 - North Las Vegas, AZ / 28550`,
  `205 Farrell Highway Suite 333 - Rock Hill, OK / 63421`,
  `253 Kara Motorway Suite 821 - Manchester, SD / 09331`,
  `13663 Kiara Oval Suite 606 - Missoula, AR / 44478`,
  `8110 Claire Port Apt. 703 - Anchorage, TN / 01753`,
  `4642 Demetris Lane Suite 407 - Edmond, AZ / 60888`,
  `74794 Asha Flat Suite 890 - Lancaster, OR / 13466`,
  `8135 Keeling Pines Apt. 326 - Alexandria, MA / 89442`,
  `441 Gibson Shores Suite 247 - Pasco, NM / 60678`,
  `4373 Emelia Valley Suite 596 - Columbia, NM / 42586`,
];
export const _mock = {
  id: (index: number) => _id[index]!,
  time: (index: number) => fSub({ days: index, hours: index }),
  fullName: (index: number) => _fullNames[index]!,
  phoneNumber: (index: number) => _phoneNumbers[index]!,
  fullAddress: (index: number) => _fullAddress[index]!,
  number: {
    price: (index: number) => _prices[index]!,
  },
};

export const _userAddressBook = Array.from({ length: 4 }, (_, index) => ({
  id: _mock.id(index),
  primary: index === 0,
  name: _mock.fullName(index),
  phoneNumber: _mock.phoneNumber(index),
  fullAddress: _mock.fullAddress(index),
  addressType: (index === 0 && "Home") || "Office",
}));

export const _userInvoices = Array.from({ length: 10 }, (_, index) => ({
  id: _mock.id(index),
  invoiceNumber: `INV-199${index}`,
  createdAt: _mock.time(index),
  price: _mock.number.price(index),
}));
export const _userPayment = Array.from({ length: 3 }, (_, index) => ({
  id: _mock.id(index),
  cardNumber: ["**** **** **** 1234", "**** **** **** 5678", "**** **** **** 7878"][index]!,
  cardType: ["mastercard", "visa", "visa"][index]!,
  primary: index === 1,
}));
export const _userPlans = [
  { subscription: "basic", price: 0, primary: false },
  { subscription: "starter", price: 4.99, primary: true },
  { subscription: "premium", price: 9.99, primary: false },
];
// ----------------------------------------------------------------------

export function AccountBillingView() {
  return (
    <AccountBilling plans={_userPlans} cards={_userPayment} invoices={_userInvoices} addressBook={_userAddressBook} />
  );
}
