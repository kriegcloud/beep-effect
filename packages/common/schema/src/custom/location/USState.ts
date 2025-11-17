import { stringLiteralKit } from "@beep/schema/kits";
import * as S from "effect/Schema";
import { Id } from "./_id";
export const USStateCodeKit = stringLiteralKit(
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
  "PR",
  "GU",
  "VI",
  "AS",
  "MP"
);

export class USStateCode extends USStateCodeKit.Schema.annotations(
  Id.annotations("USStateCode", {
    description: "A valid US state abbreviation",
  })
) {
  static readonly Options = USStateCodeKit.Options;
  static readonly Enum = USStateCodeKit.Enum;
}

export declare namespace USStateCode {
  export type Type = S.Schema.Type<typeof USStateCode>;
  export type Encoded = S.Schema.Encoded<typeof USStateCode>;
}

export const USStateNameKit = stringLiteralKit(
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "District of Columbia",
  "Puerto Rico",
  "Guam",
  "Virgin Islands",
  "American Samoa",
  "Northern Mariana Islands"
);

export class USStateName extends USStateNameKit.Schema.annotations(
  Id.annotations("USStateName", {
    description: "A valid US state name",
  })
) {
  static readonly Options = USStateNameKit.Options;
  static readonly Enum = USStateNameKit.Enum;
}

export declare namespace USStateName {
  export type Type = S.Schema.Type<typeof USStateName>;
  export type Encoded = S.Schema.Encoded<typeof USStateName>;
}

export class USStateNameFromCode extends S.transformLiterals(
  [USStateCode.Enum.AL, USStateName.Enum.Alabama],
  [USStateCode.Enum.AK, USStateName.Enum.Alaska],
  [USStateCode.Enum.AZ, USStateName.Enum.Arizona],
  [USStateCode.Enum.AR, USStateName.Enum.Arkansas],
  [USStateCode.Enum.CA, USStateName.Enum.California],
  [USStateCode.Enum.CO, USStateName.Enum.Colorado],
  [USStateCode.Enum.CT, USStateName.Enum.Connecticut],
  [USStateCode.Enum.DE, USStateName.Enum.Delaware],
  [USStateCode.Enum.FL, USStateName.Enum.Florida],
  [USStateCode.Enum.GA, USStateName.Enum.Georgia],
  [USStateCode.Enum.HI, USStateName.Enum.Hawaii],
  [USStateCode.Enum.ID, USStateName.Enum.Idaho],
  [USStateCode.Enum.IL, USStateName.Enum.Illinois],
  [USStateCode.Enum.IN, USStateName.Enum.Indiana],
  [USStateCode.Enum.IA, USStateName.Enum.Iowa],
  [USStateCode.Enum.KS, USStateName.Enum.Kansas],
  [USStateCode.Enum.KY, USStateName.Enum.Kentucky],
  [USStateCode.Enum.LA, USStateName.Enum.Louisiana],
  [USStateCode.Enum.ME, USStateName.Enum.Maine],
  [USStateCode.Enum.MD, USStateName.Enum.Maryland],
  [USStateCode.Enum.MA, USStateName.Enum.Massachusetts],
  [USStateCode.Enum.MI, USStateName.Enum.Michigan],
  [USStateCode.Enum.MN, USStateName.Enum.Minnesota],
  [USStateCode.Enum.MS, USStateName.Enum.Mississippi],
  [USStateCode.Enum.MO, USStateName.Enum.Missouri],
  [USStateCode.Enum.MT, USStateName.Enum.Montana],
  [USStateCode.Enum.NE, USStateName.Enum.Nebraska],
  [USStateCode.Enum.NV, USStateName.Enum.Nevada],
  [USStateCode.Enum.NH, USStateName.Enum["New Hampshire"]],
  [USStateCode.Enum.NJ, USStateName.Enum["New Jersey"]],
  [USStateCode.Enum.NM, USStateName.Enum["New Mexico"]],
  [USStateCode.Enum.NY, USStateName.Enum["New York"]],
  [USStateCode.Enum.NC, USStateName.Enum["North Carolina"]],
  [USStateCode.Enum.ND, USStateName.Enum["North Dakota"]],
  [USStateCode.Enum.OH, USStateName.Enum.Ohio],
  [USStateCode.Enum.OK, USStateName.Enum.Oklahoma],
  [USStateCode.Enum.OR, USStateName.Enum.Oregon],
  [USStateCode.Enum.PA, USStateName.Enum.Pennsylvania],
  [USStateCode.Enum.RI, USStateName.Enum["Rhode Island"]],
  [USStateCode.Enum.SC, USStateName.Enum["South Carolina"]],
  [USStateCode.Enum.SD, USStateName.Enum["South Dakota"]],
  [USStateCode.Enum.TN, USStateName.Enum.Tennessee],
  [USStateCode.Enum.TX, USStateName.Enum.Texas],
  [USStateCode.Enum.UT, USStateName.Enum.Utah],
  [USStateCode.Enum.VT, USStateName.Enum.Vermont],
  [USStateCode.Enum.VA, USStateName.Enum.Virginia],
  [USStateCode.Enum.WA, USStateName.Enum.Washington],
  [USStateCode.Enum.WV, USStateName.Enum["West Virginia"]],
  [USStateCode.Enum.WI, USStateName.Enum.Wisconsin],
  [USStateCode.Enum.WY, USStateName.Enum.Wyoming],
  [USStateCode.Enum.DC, USStateName.Enum["District of Columbia"]],
  [USStateCode.Enum.PR, USStateName.Enum["Puerto Rico"]],
  [USStateCode.Enum.GU, USStateName.Enum.Guam],
  [USStateCode.Enum.VI, USStateName.Enum["Virgin Islands"]],
  [USStateCode.Enum.AS, USStateName.Enum["American Samoa"]],
  [USStateCode.Enum.MP, USStateName.Enum["Northern Mariana Islands"]]
).annotations(
  Id.annotations("USStateNameFromCode", {
    description: "Represents a US state name from its code",
  })
) {}

export declare namespace USStateNameFromCode {
  export type Type = S.Schema.Type<typeof USStateNameFromCode>;
  export type Encoded = S.Schema.Encoded<typeof USStateNameFromCode>;
}
