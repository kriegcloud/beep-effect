import { Box, styled } from "@mui/material";

export const StyledEditorWrapper = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  return {
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    // Custom scrollbar
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: isDark ? theme.palette.grey[800] : theme.palette.grey[100],
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: isDark ? theme.palette.grey[600] : theme.palette.grey[400],
      borderRadius: "4px",
      "&:hover": {
        background: isDark ? theme.palette.grey[500] : theme.palette.grey[500],
      },
    },
    // Firefox
    scrollbarWidth: "thin" as const,
    scrollbarColor: `${isDark ? theme.palette.grey[600] : theme.palette.grey[400]} ${isDark ? theme.palette.grey[800] : theme.palette.grey[100]}`,
    // Editor input styles - override default styles with theme support
    "& .editor-input": {
      color: theme.palette.text.primary,
      caretColor: theme.palette.primary.main,
    },
    // Headings
    "& .editor-heading-h1, & .editor-heading-h2, & .editor-heading-h3, & .editor-heading-h4, & .editor-heading-h5, & .editor-heading-h6":
      {
        color: theme.palette.text.primary,
      },
    // Quotes
    "& .editor-quote": {
      borderLeftColor: theme.palette.primary.main,
      color: theme.palette.text.secondary,
    },
    // Code blocks
    "& .editor-code": {
      backgroundColor: isDark ? theme.palette.grey[900] : theme.palette.grey[50],
      borderColor: theme.palette.divider,
      color: theme.palette.text.primary,
    },
    // Inline code
    "& .editor-text-code": {
      backgroundColor: isDark ? theme.palette.grey[800] : theme.palette.grey[100],
      color: theme.palette.text.primary,
    },
    // Links
    "& .editor-link": {
      color: theme.palette.primary.main,
      borderBottomColor: theme.palette.primary.main,
      "&:hover": {
        color: theme.palette.primary.dark,
        borderBottomColor: theme.palette.primary.dark,
        backgroundColor: isDark ? `rgba(${theme.palette.primary.main}, 0.12)` : `rgba(25, 118, 210, 0.08)`,
      },
    },
  };
});
