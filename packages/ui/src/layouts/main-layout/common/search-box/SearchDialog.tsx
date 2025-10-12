import { Dialog, dialogClasses } from "@mui/material";
import SearchResult from "./SearchResult";

interface SearchDialogProps {
  anchorEl: HTMLDivElement | HTMLButtonElement | null;
  handleClose: () => void;
}

const SearchDialog = ({ anchorEl, handleClose }: SearchDialogProps) => {
  const open = Boolean(anchorEl);
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      sx={{
        [`& .${dialogClasses.paper}`]: {
          bgcolor: "background.menu",
          width: "100%",
          borderRadius: 2,
          outline: "none",
          overflow: "hidden",
        },
      }}
    >
      <SearchResult handleClose={handleClose} />
    </Dialog>
  );
};

export default SearchDialog;
