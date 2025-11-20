import type { MailLabel } from "@beep/comms-domain";
import { assetPaths } from "@beep/constants";
import { Iconify } from "@beep/ui/atoms";
import { EmptyContent, Scrollbar } from "@beep/ui/molecules";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import { MailNavItem } from "./mail-nav-item";
import { MailNavItemSkeleton } from "./mail-skeleton";

// ----------------------------------------------------------------------

type Props = {
  isEmpty: boolean;
  openNav: boolean;
  loading: boolean;
  labels: MailLabel[];
  selectedLabelId: string;
  onCloseNav: () => void;
  onToggleCompose: () => void;
  onClickLabel: (labelId: string) => void;
};

export function MailNav({
  isEmpty,
  loading,
  labels,
  openNav,
  onCloseNav,
  onClickLabel,
  selectedLabelId,
  onToggleCompose,
}: Props) {
  const renderLoading = () => (
    <Stack sx={{ flex: "1 1 auto", px: { xs: 2.5, md: 1.5 } }}>
      <MailNavItemSkeleton />
    </Stack>
  );

  const renderEmpty = () => (
    <Stack sx={{ flex: "1 1 auto", px: { xs: 2.5, md: 1.5 } }}>
      <EmptyContent title="No labels" imgUrl={assetPaths.assets.icons.empty.icFolderEmpty} />
    </Stack>
  );

  const renderList = () =>
    isEmpty ? (
      renderEmpty()
    ) : (
      <Scrollbar sx={{ flex: "1 1 0" }}>
        <nav>
          <Box component="ul" sx={{ pb: 1.5, px: { xs: 1.5, md: 0.5 } }}>
            {labels.map((label) => (
              <MailNavItem
                key={label.id}
                label={label}
                selected={selectedLabelId === label.id}
                onClickNavItem={() => onClickLabel(label.id)}
              />
            ))}
          </Box>
        </nav>
      </Scrollbar>
    );

  const renderContent = () => (
    <>
      <Box sx={(theme) => ({ p: { xs: 2.5, md: theme.spacing(2, 1.5) } })}>
        <Button
          fullWidth
          color="inherit"
          variant="contained"
          startIcon={<Iconify icon="solar:pen-bold" />}
          onClick={onToggleCompose}
        >
          Compose
        </Button>
      </Box>

      {loading ? renderLoading() : renderList()}
    </>
  );

  return (
    <>
      {renderContent()}

      <Drawer
        open={openNav}
        onClose={onCloseNav}
        slotProps={{
          backdrop: { invisible: true },
          paper: { sx: { width: 280 } },
        }}
      >
        {renderContent()}
      </Drawer>
    </>
  );
}
