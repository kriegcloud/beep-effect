import type { Mails } from "@beep/comms-domain";
import { assetPaths } from "@beep/constants";
import { Iconify } from "@beep/ui/atoms";
import { EmptyContent, Scrollbar } from "@beep/ui/molecules";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import * as O from "effect/Option";
import { MailItem } from "./mail-item";
import { MailItemSkeleton } from "./mail-skeleton";

// ----------------------------------------------------------------------

type Props = {
  isEmpty: boolean;
  loading: boolean;
  openMail: boolean;
  mails: Mails;
  selectedMailId: string;
  selectedLabelId: string;
  onCloseMail: () => void;
  onClickMail: (id: string) => void;
};

export function MailList({
  isEmpty,
  loading,
  mails,
  openMail,
  onCloseMail,
  onClickMail,
  selectedMailId,
  selectedLabelId,
}: Props) {
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

  const renderLoading = () => (
    <Stack sx={{ px: 2, flex: "1 1 auto" }}>
      <MailItemSkeleton />
    </Stack>
  );

  const renderEmpty = () => (
    <Stack sx={{ px: 2, flex: "1 1 auto" }}>
      <EmptyContent
        title={`Nothing in ${selectedLabelId}`}
        description="This folder is empty"
        imgUrl={assetPaths.assets.icons.empty.icFolderEmpty}
      />
    </Stack>
  );

  const renderList = () =>
    isEmpty ? (
      renderEmpty()
    ) : (
      <Scrollbar sx={{ flex: "1 1 0" }}>
        <nav>
          <Box
            component="ul"
            sx={{
              px: 2,
              pb: 1,
              gap: 0.5,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {mails.allIds.map((mailId) => (
              <MailItem
                key={mailId}
                {...O.fromNullable(mails.byId[mailId]).pipe(
                  O.map((mail) => ({ mail })),
                  O.getOrThrow
                )}
                selected={selectedMailId === mailId}
                onClick={() => onClickMail(mailId)}
              />
            ))}
          </Box>
        </nav>
      </Scrollbar>
    );

  const renderContent = () => (
    <>
      <Stack sx={{ p: 2 }}>
        {mdUp ? (
          <TextField
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
            sx={[isEmpty && { display: "none" }]}
          />
        ) : (
          <Typography variant="h6" sx={{ textTransform: "capitalize" }}>
            {selectedLabelId}
          </Typography>
        )}
      </Stack>

      {loading ? renderLoading() : renderList()}
    </>
  );

  return (
    <>
      {renderContent()}

      <Drawer
        open={openMail}
        onClose={onCloseMail}
        slotProps={{
          backdrop: { invisible: true },
          paper: { sx: { width: 320 } },
        }}
      >
        {renderContent()}
      </Drawer>
    </>
  );
}
