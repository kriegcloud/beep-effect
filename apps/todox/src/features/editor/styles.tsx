import { rgbaFromChannel } from "@beep/ui-core/utils";

import { styled } from "@mui/material/styles";

import { editorClasses } from "./classes";

// ----------------------------------------------------------------------

const MARGIN = "0.75em";

export const EditorRoot = styled("div")(({ theme }) => ({
  // ...theme.mixins.scrollbarStyles(theme),
  minHeight: 240,
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.2)}`,
  /**
   * State: error, disabled, fullscreen
   */
  [`&.${editorClasses.state.error}`]: {
    borderColor: theme.vars.palette.error.main,
    [`& .${editorClasses.content.root}`]: {
      backgroundColor: rgbaFromChannel(theme.vars.palette.error.mainChannel, 0.08),
    },
  },
  [`&.${editorClasses.state.disabled}`]: {
    opacity: 0.48,
    pointerEvents: "none",
  },
  [`&.${editorClasses.state.fullscreen}`]: {
    top: 16,
    left: 16,
    position: "fixed",
    maxHeight: "unset",
    width: `calc(100% - ${32}px)`,
    height: `calc(100% - ${32}px)`,
    zIndex: theme.zIndex.modal,
    backgroundColor: theme.vars.palette.background.default,
  },
  /**
   * Placeholder
   */
  [`& .${editorClasses.content.placeholder}`]: {
    "&:first-of-type::before": {
      ...theme.typography.body2,
      height: 0,
      float: "left",
      pointerEvents: "none",
      content: "attr(data-placeholder)",
      color: theme.vars.palette.text.disabled,
    },
  },
  /**
   * Content
   */
  [`& .${editorClasses.content.root}`]: {
    display: "flex",
    flex: "1 1 auto",
    overflowY: "auto",
    flexDirection: "column",
    borderBottomLeftRadius: "inherit",
    borderBottomRightRadius: "inherit",
    backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
    "& .tiptap": {
      "> * + *": { marginTop: 0, marginBottom: MARGIN },
      "&.ProseMirror": { flex: "1 1 auto", outline: "none", padding: theme.spacing(0, 2) },
      /**
       * Heading & paragraph
       */
      h1: { ...theme.typography.h1, marginTop: 40, marginBottom: 8 },
      h2: { ...theme.typography.h2, marginTop: 40, marginBottom: 8 },
      h3: { ...theme.typography.h3, marginTop: 24, marginBottom: 8 },
      h4: { ...theme.typography.h4, marginTop: 24, marginBottom: 8 },
      h5: { ...theme.typography.h5, marginTop: 24, marginBottom: 8 },
      h6: { ...theme.typography.h6, marginTop: 24, marginBottom: 8 },
      p: { ...theme.typography.body1, marginBottom: "1.25rem" },
      [`& .${editorClasses.content.heading}`]: {},
      /**
       * Link
       */
      [`& .${editorClasses.content.link}`]: { color: theme.vars.palette.primary.main },
      /**
       * Hr divider
       */
      [`& .${editorClasses.content.hr}`]: {
        flexShrink: 0,
        borderWidth: 0,
        margin: "2em 0",
        msFlexNegative: 0,
        WebkitFlexShrink: 0,
        borderStyle: "solid",
        borderBottomWidth: "thin",
        borderColor: theme.vars.palette.divider,
      },
      /**
       * Image
       */
      [`& .${editorClasses.content.image}`]: {
        width: "100%",
        height: "auto",
        maxWidth: "100%",
        margin: "auto auto 1.25em",
        "&.ProseMirror-selectednode": {
          outline: `2px solid ${theme.vars.palette.primary.main}`,
        },
      },
      /**
       * Lists
       */
      [`& .${editorClasses.content.bulletList}`]: {
        paddingLeft: 16,
        listStyleType: "disc",
      },
      [`& .${editorClasses.content.orderedList}`]: {
        paddingLeft: 16,
      },
      [`& .${editorClasses.content.listItem}`]: {
        lineHeight: 2,
        "& > p": { margin: 0 },
      },
      /**
       * Blockquote
       */
      [`& .${editorClasses.content.blockquote}`]: {
        lineHeight: 1.5,
        fontSize: "1.5em",
        margin: "24px auto",
        position: "relative",
        fontFamily: "Georgia, serif",
        padding: theme.spacing(3, 3, 3, 8),
        color: theme.vars.palette.text.secondary,
        borderLeft: `solid 8px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08)}`,
        [theme.breakpoints.up("md")]: { width: "100%", maxWidth: 640 },
        "& p": {
          margin: 0,
          fontSize: "inherit",
          fontFamily: "inherit",
        },
        "&::before": {
          left: 16,
          top: -8,
          display: "block",
          fontSize: "3em",
          content: '"\\201C"',
          position: "absolute",
          color: theme.vars.palette.text.disabled,
        },
      },
      /**
       * Code inline
       */
      [`& .${editorClasses.content.codeInline}`]: {
        padding: theme.spacing(0.25, 0.5),
        color: theme.vars.palette.text.secondary,
        fontSize: theme.typography.body2.fontSize,
        borderRadius: Number(theme.shape.borderRadius) / 2,
        backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.2),
      },
      /**
       * Code block
       */
      [`& .${editorClasses.content.codeBlock}`]: {
        position: "relative",
        "& pre": {
          overflowX: "auto",
          color: theme.vars.palette.common.white,
          padding: theme.spacing(5, 3, 3, 3),
          borderRadius: theme.shape.borderRadius,
          backgroundColor: theme.vars.palette.grey[900],
          fontFamily: "'JetBrainsMono', monospace",
          "& code": { fontSize: theme.typography.body2.fontSize },
        },
        [`& .${editorClasses.content.langSelect}`]: {
          top: 8,
          right: 8,
          zIndex: 1,
          padding: 4,
          outline: "none",
          borderRadius: 4,
          position: "absolute",
          color: theme.vars.palette.common.white,
          fontWeight: theme.typography.fontWeightMedium,
          borderColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
          backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08),
        },
      },
    },
  },
}));
