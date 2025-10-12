"use client";

// import searchResult from "data/search-result";
import { Iconify } from "@beep/ui/atoms";
import {
  //  Avatar,
  Box,
  // Breadcrumbs,
  // Chip,
  Divider,
  IconButton,
  InputAdornment,
  inputBaseClasses,
  Link,
  List,
  // ListItem,
  // ListItemButton,
  // ListItemIcon,
  // listItemSecondaryActionClasses,
  // ListItemText,
  Stack,
  // Tooltip,
  Typography,
} from "@mui/material";
import { type PropsWithChildren, useEffect, useRef } from "react";
import SimpleBar from "simplebar-react";
import SearchTextField from "./SearchTextField";

const SearchResult = ({ handleClose }: { handleClose: () => void }) => {
  // const {breadcrumbs, contacts, files, tags} = searchResult;

  return (
    <>
      <SearchField handleClose={handleClose} />
      <SimpleBar style={{ maxHeight: 600, minHeight: 0, width: "100%" }}>
        <Box sx={{ px: 3, py: 1.25 }}>
          <Link
            component="button"
            variant="caption"
            underline="none"
            sx={{
              fontWeight: "medium",
            }}
          >
            Advanced search
          </Link>
        </Box>
        <Divider />
        <Box>
          <Stack
            sx={{
              justifyContent: "space-between",
              py: 2,
              px: 3,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: "medium",
                color: "text.disabled",
              }}
            >
              Recent
            </Typography>

            <Link
              component="button"
              variant="caption"
              underline="none"
              sx={{
                fontWeight: "medium",
              }}
            >
              Clear history
            </Link>
          </Stack>

          <List
            dense
            sx={{
              pt: 0,
              pb: 2,
              listStyleType: "disc",
              listStylePosition: "inside",
              color: "grey.300",
            }}
          >
            {/*{breadcrumbs.map((breadcrumb) => (*/}
            {/*  <ListItem*/}
            {/*    key={breadcrumb[0].label}*/}
            {/*    sx={{*/}
            {/*      px: 3,*/}
            {/*      display: 'list-item',*/}
            {/*      '&:hover': {*/}
            {/*        backgroundColor: 'background.menuElevation1',*/}
            {/*      },*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    <Breadcrumbs*/}
            {/*      aria-label="breadcrumb"*/}
            {/*      maxItems={2}*/}
            {/*      sx={{*/}
            {/*        py: 0.5,*/}
            {/*        typography: 'caption',*/}
            {/*        color: 'text.secondary',*/}
            {/*        marginLeft: -0.5,*/}
            {/*        display: 'inline-block',*/}
            {/*        fontWeight: 'medium',*/}
            {/*        '@supports (-moz-appearance:none)': {*/}
            {/*          marginLeft: 0.5,*/}
            {/*        },*/}
            {/*      }}*/}
            {/*    >*/}
            {/*      {breadcrumb.map((breadcrumbItem) => (*/}
            {/*        <div key={breadcrumbItem.label}>*/}
            {/*          <Link*/}
            {/*            underline="none"*/}
            {/*            href={breadcrumbItem.active ? '#!' : breadcrumbItem.href}*/}
            {/*            sx={[*/}
            {/*              {*/}
            {/*                color: 'inherit',*/}
            {/*              },*/}
            {/*              !!breadcrumbItem.active && {*/}
            {/*                color: 'text.primary',*/}
            {/*              },*/}
            {/*            ]}*/}
            {/*          >*/}
            {/*            {breadcrumbItem.label}*/}
            {/*          </Link>*/}

            {/*          {breadcrumbItem.active && (*/}
            {/*            <Link*/}
            {/*              underline="none"*/}
            {/*              href={breadcrumbItem.href}*/}
            {/*              sx={{*/}
            {/*                marginLeft: 0.5,*/}
            {/*              }}*/}
            {/*            >*/}
            {/*              <Iconify*/}
            {/*                icon="material-symbols:open-in-new-rounded"*/}
            {/*                fontSize={16}*/}
            {/*                sx={{ verticalAlign: 'bottom' }}*/}
            {/*              />*/}
            {/*            </Link>*/}
            {/*          )}*/}
            {/*        </div>*/}
            {/*      ))}*/}
            {/*    </Breadcrumbs>*/}
            {/*  </ListItem>*/}
            {/*))}*/}
          </List>
        </Box>
        <Divider />
        <ResultItemSection title="Files">
          <List sx={{ pt: 0, pb: 2 }}>
            {/*{files.map((file) => (*/}
            {/*  <ListItem*/}
            {/*    disablePadding*/}
            {/*    key={file.name}*/}
            {/*    sx={{*/}
            {/*      [`& .${listItemSecondaryActionClasses.root}`]: {*/}
            {/*        display: 'none',*/}
            {/*      },*/}
            {/*      '&:hover': {*/}
            {/*        [`& .${listItemSecondaryActionClasses.root}`]: {*/}
            {/*          display: 'block',*/}
            {/*        },*/}
            {/*      },*/}
            {/*    }}*/}
            {/*    secondaryAction={*/}
            {/*      <IconButton edge="end" aria-label="download" sx={{ mr: 1 }}>*/}
            {/*        <Iconify*/}
            {/*          icon="material-symbols-light:download-rounded"*/}
            {/*          color="primary.main"*/}
            {/*        />*/}
            {/*      </IconButton>*/}
            {/*    }*/}
            {/*  >*/}
            {/*    <ListItemButton*/}
            {/*      sx={(theme) => ({*/}
            {/*        gap: 1,*/}
            {/*        py: 1,*/}
            {/*        pl: 3,*/}
            {/*        pr: `${theme.spacing(8)} !important`,*/}
            {/*        borderRadius: 0,*/}
            {/*        '&:hover': { bgcolor: 'background.menuElevation1' },*/}
            {/*      })}*/}
            {/*    >*/}
            {/*      <ListItemIcon>*/}
            {/*        {file.icon && (*/}
            {/*          <Iconify icon={file.icon} fontSize={32} color="primary.main" />*/}
            {/*        )}*/}
            {/*        {file.image && (*/}
            {/*          <img src={file.image.src} alt={file.name} height={30} width={30} />*/}
            {/*        )}*/}
            {/*      </ListItemIcon>*/}
            {/*      <Tooltip title={file.name} placement="top-start">*/}
            {/*        <ListItemText*/}
            {/*          sx={{*/}
            {/*            my: 0,*/}
            {/*          }}*/}
            {/*          secondary={file.path}*/}
            {/*          slotProps={{*/}
            {/*            primary: {*/}
            {/*              variant: 'subtitle2',*/}
            {/*              color: 'text.secondary',*/}
            {/*              mb: 0.25,*/}
            {/*              sx: {*/}
            {/*                display: 'flex',*/}
            {/*                lineClamp: 1,*/}
            {/*                wordBreak: 'break-all',*/}
            {/*              },*/}
            {/*            },*/}
            {/*            secondary: {*/}
            {/*              variant: 'caption',*/}
            {/*              color: 'text.disabled',*/}
            {/*              fontWeight: 'medium',*/}
            {/*              component: 'p',*/}
            {/*            },*/}
            {/*          }}*/}
            {/*        >*/}
            {/*          {file.name}*/}
            {/*        </ListItemText>*/}
            {/*      </Tooltip>*/}
            {/*    </ListItemButton>*/}
            {/*  </ListItem>*/}
            {/*))}*/}
          </List>
        </ResultItemSection>

        <ResultItemSection title="Contacts">
          <Box sx={{ px: 3, mb: 2 }}>
            <Stack
              sx={{
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {/*{contacts.map((contact) => (*/}
              {/*  <Chip*/}
              {/*    key={contact.name}*/}
              {/*    avatar={<Avatar alt={contact.name} src={contact.avatar.src} />}*/}
              {/*    label={contact.name}*/}
              {/*    variant="soft"*/}
              {/*    color="neutral"*/}
              {/*    component={Link}*/}
              {/*    underline="none"*/}
              {/*    href="#!"*/}
              {/*    sx={{ cursor: 'pointer' }}*/}
              {/*    onClick={() => {*/}
              {/*      console.log(`Clicked on contact: ${contact.name}`);*/}
              {/*    }}*/}
              {/*  />*/}
              {/*))}*/}
              <Link
                href="#!"
                variant="caption"
                underline="none"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                See All Contacts <Iconify icon="material-symbols:chevron-right-rounded" sx={{ fontSize: 16 }} />
              </Link>
            </Stack>
          </Box>
        </ResultItemSection>

        <ResultItemSection title="Popular tags">
          <Box sx={{ px: 3, mb: 2 }}>
            <Stack
              sx={{
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {/*{tags.map((tag) => (*/}
              {/*  <Chip*/}
              {/*    key={tag}*/}
              {/*    label={tag}*/}
              {/*    variant="soft"*/}
              {/*    color="neutral"*/}
              {/*    component={Link}*/}
              {/*    underline="none"*/}
              {/*    href="#!"*/}
              {/*    sx={{ cursor: 'pointer' }}*/}
              {/*    onClick={() => {*/}
              {/*      console.log(`Clicked on contact: ${tag}`);*/}
              {/*    }}*/}
              {/*  />*/}
              {/*))}*/}
            </Stack>
          </Box>
        </ResultItemSection>
        <Box sx={{ px: 3, py: 2 }}>
          <Typography
            component="p"
            variant="caption"
            sx={{
              fontWeight: "medium",
              color: "text.disabled",
            }}
          >
            Not the results you expected? <Link href="#!">Give feedback</Link> or <Link href="#!">learn more</Link>
          </Typography>
        </Box>
      </SimpleBar>
    </>
  );
};

export const SearchField = ({ handleClose }: { handleClose: () => void }) => {
  const initialFocusRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    initialFocusRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <SearchTextField
      fullWidth
      sx={{
        [`& .${inputBaseClasses.root}`]: {
          borderRadius: "4px 4px 0 0",
          border: 1,
          borderColor: "transparent",
          [`&.${inputBaseClasses.focused}`]: {
            outline: "none",
            border: 1,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderColor: "primary.main",
            boxShadow: "none",
          },
        },
      }}
      slotProps={{
        input: {
          inputProps: {
            ref: initialFocusRef,
          },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" edge="end" onClick={handleClose}>
                <Iconify icon="material-symbols:close-rounded" color="grey.500" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

const ResultItemSection = ({
  title,
  children,
  bottomDivider = true,
}: PropsWithChildren<{ title: string; bottomDivider?: boolean }>) => {
  return (
    <Box>
      <Box sx={{ my: 2, px: 3 }}>
        <Typography
          variant="caption"
          component="h6"
          sx={{
            fontWeight: "medium",
            color: "text.disabled",
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
      {bottomDivider && <Divider />}
    </Box>
  );
};

export default SearchResult;
