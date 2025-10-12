import { Iconify } from "@beep/ui/atoms";
import { StyledTextField } from "@beep/ui/styled";
import type { TextFieldProps } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";

const SearchTextField = ({ slotProps, ...rest }: TextFieldProps) => {
  const { input: inputSlotProps } = slotProps || {};

  return (
    <StyledTextField
      id="search-box"
      placeholder="Search"
      sx={{
        minWidth: 348,
      }}
      slotProps={{
        ...slotProps,
        input: {
          className: "search-box-input",
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="material-symbols:search-rounded" />
            </InputAdornment>
          ),
          ...inputSlotProps,
        },
      }}
      {...rest}
    />
  );
};

export default SearchTextField;
