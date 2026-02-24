import { Divider, Stack } from "@mui/material";
import type { Language } from "@/features/account/localization/types";

import { AccountTabPanelSection } from "../common/AccountTabPanelSection";
import type {
  dateFormats,
  // languages,
  listSortOrders,
  numberFormats,
  regions,
  weekDays,
} from "./data";
import PreferredLanguage from "./PreferredLanguage";
import Region from "./Region";

export interface LanguageRegionFormValues {
  languages: Language[];
  spellCheck: "basic" | "advanced";
  checkerLanguages: {
    english: boolean;
    bangla: boolean;
    french: boolean;
  };
  region: (typeof regions)[number];
  temperature: "celcius" | "fahrenheit";
  measurementSystem: "metric" | "us" | "uk";
  firstDayOfWeek: (typeof weekDays)[number];
  dateFormat: (typeof dateFormats)[number];
  numberFormat: (typeof numberFormats)[number];
  listSortOrder: (typeof listSortOrders)[number];
}

export const LocalizationTabPanel = () => {
  // const methods = useForm<LanguageRegionFormValues>({
  //   defaultValues: {
  //     languages: [languages[0], languages[6], languages[8]],
  //     spellCheck: 'basic',
  //     checkerLanguages: {
  //       english: true,
  //       bangla: false,
  //       french: false,
  //     },
  //     region: regions[0],
  //     temperature: 'celcius',
  //     measurementSystem: 'metric',
  //     firstDayOfWeek: weekDays[0],
  //     dateFormat: dateFormats[0],
  //     numberFormat: numberFormats[0],
  //     listSortOrder: listSortOrders[0],
  //   },
  // });
  // const { enqueueSnackbar } = useSnackbar();

  // const { handleSubmit, reset } = methods;

  // const onSubmit: SubmitHandler<LanguageRegionFormValues> = (data) => {
  //   console.log(data);
  //   enqueueSnackbar('Updated successfully!', { variant: 'success', autoHideDuration: 3000 });
  // };
  return (
    <>
      <Stack component="form" direction="column" divider={<Divider />} spacing={5} onSubmit={() => {}}>
        <AccountTabPanelSection
          title="Preferred Language"
          subtitle="Choose your preferred languages for content and communication. You can set a primary language and add multiple secondary languages as needed."
          icon="material-symbols:translate"
        >
          <PreferredLanguage />
        </AccountTabPanelSection>

        <AccountTabPanelSection
          title="Region"
          subtitle="Set your region settings. Adjust temperature units, measurement systems, and other settings to match your local standards."
          icon="material-symbols:public"
        >
          <Region />
        </AccountTabPanelSection>
      </Stack>
    </>
  );
};
