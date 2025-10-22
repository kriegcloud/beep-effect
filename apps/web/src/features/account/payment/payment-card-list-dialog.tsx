import { Iconify } from "@beep/ui/atoms";
import { Scrollbar } from "@beep/ui/molecules";
import { SearchNotFound } from "@beep/ui/sections";

import Box from "@mui/material/Box";
import type { DialogProps } from "@mui/material/Dialog";
import Dialog from "@mui/material/Dialog";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";
import type { IPaymentCard } from "../types";

import { PaymentCardItem } from "./payment-card-item";

// ----------------------------------------------------------------------

type Props = Omit<DialogProps, "onSelect"> & {
  title?: string;
  list: IPaymentCard[];
  action?: React.ReactNode;
  onClose: () => void;
  selected: (selectedId: string) => boolean;
  onSelect: (card: IPaymentCard | null) => void;
};

export function PaymentCardListDialog({
  sx,
  open,
  list,
  action,
  onClose,
  selected,
  onSelect,
  title = "Cards",
  ...other
}: Props) {
  const [searchCard, setSearchCard] = useState("");

  const dataFiltered = applyFilter({
    inputData: list,
    query: searchCard,
  });

  const notFound = !dataFiltered.length && !!searchCard;

  const handleSearchAddress = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCard(event.target.value);
  }, []);

  const handleSelectCard = useCallback(
    (card: IPaymentCard | null) => {
      onSelect(card);
      setSearchCard("");
      onClose();
    },
    [onClose, onSelect]
  );

  const renderList = () => (
    <Scrollbar sx={{ p: 3, maxHeight: 480 }}>
      <Box sx={{ gap: 3, display: "flex", flexDirection: "column" }}>
        {dataFiltered.map((card) => (
          <PaymentCardItem
            key={card.id}
            card={card}
            onClick={() => handleSelectCard(card)}
            sx={[
              (theme) => ({
                cursor: "pointer",
                ...(selected(card.id) && {
                  boxShadow: `0 0 0 2px ${theme.vars.palette.text.primary}`,
                }),
              }),
            ]}
          />
        ))}
      </Box>
    </Scrollbar>
  );

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} sx={sx} {...other}>
      <Box
        sx={{
          py: 3,
          pl: 3,
          pr: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">{title}</Typography>
        {action && action}
      </Box>

      <Box sx={{ px: 3 }}>
        <TextField
          fullWidth
          value={searchCard}
          onChange={handleSearchAddress}
          placeholder="Search..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {notFound ? <SearchNotFound query={searchCard} sx={{ px: 3, pt: 5, pb: 10 }} /> : renderList()}
    </Dialog>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  query: string;
  inputData: IPaymentCard[];
};

function applyFilter({ inputData, query }: ApplyFilterProps) {
  if (!query) return inputData;

  return inputData.filter(({ cardNumber }) =>
    [cardNumber].some((field) => field?.toLowerCase().includes(query.toLowerCase()))
  );
}
