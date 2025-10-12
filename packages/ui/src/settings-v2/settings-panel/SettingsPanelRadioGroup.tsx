import { formControlLabelClasses, RadioGroup, type RadioGroupProps, radioClasses } from "@mui/material";

const SettingsPanelRadioGroup = ({ children, ...rest }: RadioGroupProps) => {
  return (
    <RadioGroup
      sx={{
        flexDirection: "row",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 2,
        [`& .${formControlLabelClasses.root}`]: {
          margin: 0,
        },
        [`& .${radioClasses.root}`]: {
          display: "none",
        },
      }}
      {...rest}
    >
      {children}
    </RadioGroup>
  );
};

export default SettingsPanelRadioGroup;
