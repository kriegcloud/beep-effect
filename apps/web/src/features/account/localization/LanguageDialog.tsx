// import { languages } from 'data/account/language-region';
// import { Language } from 'types/accounts';
import { Iconify } from "@beep/ui/atoms";
import { SimpleBar } from "@beep/ui/molecules/SimpleBar";
import type { DialogProps } from "@mui/material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  dialogClasses,
  IconButton,
  InputAdornment,
  List,
  Stack,
  TextField,
} from "@mui/material";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { languages } from "@/features/account/localization/data";
// import { LanguageRegionFormValues } from './LanguageRegionTabPanel';
import type { Language } from "@/features/account/localization/types";
// import SimpleBar from 'components/base/SimpleBar';
import LanguageListItem from "./LanguageListItem";

export const regions = [
  "United States",
  "United Kingdom",
  "East Europe",
  "West Europe",
  "Africa",
  "Latin America",
  "Middle East",
  "South Asia",
  "Oceania",
] as const;
interface LanguageDialogProps extends DialogProps {
  handleDialogClose: () => void;
}

const LanguageDialog = (props: LanguageDialogProps) => {
  const { open, handleDialogClose, sx } = props;
  // const { setValue, control } = useFormContext<LanguageRegionFormValues>();
  // const checkedLanguages = useWatch({ control, name: 'languages' });
  const [visibleLanguages, setVisibleLanguages] = useState<Language[]>(languages);
  const [updatedLanguages, setUpdatedLanguages] = useState<Language[]>([]);

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setVisibleLanguages(() =>
      languages.filter(
        (language) =>
          language.name.toLowerCase().includes(event.target.value.toLowerCase()) ||
          language.label.toLowerCase().includes(event.target.value.toLowerCase()) ||
          `${language.name} - ${language.label}`.toLowerCase().includes(event.target.value.toLowerCase())
      )
    );
  };

  const toggleLanguage = (language: Language, isChecked: boolean) => {
    setUpdatedLanguages((prev) =>
      isChecked ? [...prev, language].sort((a, b) => a.id - b.id) : prev.filter((l) => l.id !== language.id)
    );
  };

  const handleConfirm = () => {
    // setValue('languages', updatedLanguages);
    handleDialogClose();
  };

  const handleDiscard = () => {
    // setUpdatedLanguages(checkedLanguages);
    handleDialogClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleDiscard}
      sx={{
        [`& .${dialogClasses.paper}`]: {
          borderRadius: 6,
          overflow: "visible",
          maxWidth: 463,
          ...sx,
        },
      }}
    >
      <DialogTitle
        component="h6"
        sx={{
          pt: 3,
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Language
        <IconButton onClick={handleDiscard}>
          <Iconify icon="material-symbols:close" width={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 0 }}>
        <DialogContentText variant="body2" sx={{ color: "text.secondary", mb: 2, textWrap: "pretty" }}>
          Choose your preferred language for display text, handwriting, speech, and search filters.
        </DialogContentText>
        <Stack direction="column" spacing={1}>
          <TextField
            label="Search"
            size="small"
            autoComplete="off"
            onChange={handleSearch}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="material-symbols:search-rounded" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <SimpleBar sx={{ maxHeight: 334 }}>
            <List
              disablePadding
              sx={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {visibleLanguages.map((language) => (
                <LanguageListItem
                  key={language.id}
                  language={language}
                  updatedLanguages={updatedLanguages}
                  toggleLanguage={toggleLanguage}
                />
              ))}
            </List>
          </SimpleBar>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          p: 3,
        }}
      >
        <Button variant="soft" color="neutral" onClick={handleDiscard}>
          Discard
        </Button>
        <Button variant="contained" color="primary" onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LanguageDialog;
