import { accordionClasses } from "@mui/material/Accordion";
import { accordionDetailsClasses } from "@mui/material/AccordionDetails";
import type { AccordionSummaryClassKey } from "@mui/material/AccordionSummary";
import { accordionSummaryClasses } from "@mui/material/AccordionSummary";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import SvgIcon from "@mui/material/SvgIcon";
import type { Components, ComponentsVariants, CSSObject, Theme } from "@mui/material/styles";

type AccordionVariants = ComponentsVariants<Theme>["MuiAccordion"];

/* **********************************************************************
 * ♉️ Custom icons
 * **********************************************************************/

const PlusIcon = (props: SvgIconProps) => (
  // https://icon-sets.iconify.design/mingcute/add-line/
  <SvgIcon {...props}>
    <g fill="none">
      <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
      <path fill="currentColor" d="M11 20a1 1 0 1 0 2 0v-7h7a1 1 0 1 0 0-2h-7V4a1 1 0 1 0-2 0v7H4a1 1 0 1 0 0 2h7z" />
    </g>
  </SvgIcon>
);

const MinusIcon = (props: SvgIconProps) => (
  // https://icon-sets.iconify.design/mingcute/minimize-line/
  <SvgIcon {...props}>
    <g fill="none" fillRule="evenodd">
      <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
      <path fill="currentColor" d="M3 12a1 1 0 0 1 1-1h16a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1" />
    </g>
  </SvgIcon>
);

const iconClasses = {
  container: "accordion__icon__container",
  plus: "accordion__icon__plus",
  minus: "accordion__icon__minus",
};

const getExpandIconStyles = (theme: Theme): Record<string, CSSObject> => {
  const resetTransform: Record<string, CSSObject> = {
    default: {
      transition: "inherit",
      transform: "rotate(0deg)",
    },
    expanded: {
      transform: "rotate(-180deg)",
    },
  };

  const iconContainerStyles: CSSObject = {
    width: 24,
    height: 24,
    display: "flex",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  };

  const iconStyles: CSSObject = {
    width: 18,
    height: 18,
    position: "absolute",
    transition: theme.transitions.create(["transform", "opacity"], {
      easing: theme.transitions.easing.easeIn,
      duration: theme.transitions.duration.shortest,
    }),
  };

  return {
    [`& .${iconClasses.container}`]: {
      ...resetTransform.default,
      ...iconContainerStyles,
    },
    [`& .${iconClasses.plus}`]: {
      ...iconStyles,
      transform: "scale(1)",
      opacity: 1,
    },
    [`& .${iconClasses.minus}`]: {
      ...iconStyles,
      transform: "scale(0.4)",
      opacity: 0,
    },
    [`&.${accordionSummaryClasses.expanded}`]: {
      [`& .${iconClasses.container}`]: resetTransform.expanded,
      [`& .${iconClasses.plus}`]: { transform: "scale(0.4)", opacity: 0 },
      [`& .${iconClasses.minus}`]: { transform: "scale(1)", opacity: 1 },
    },
  };
};

const ExpandIcon = (props: BoxProps) => (
  <Box component="span" className={iconClasses.container} {...props}>
    <PlusIcon className={iconClasses.plus} />
    <MinusIcon className={iconClasses.minus} />
  </Box>
);

/* **********************************************************************
 * 🗳️ Variants
 * **********************************************************************/
const expandedVariants = [
  {
    props: (props) => !props.disableGutters && !!props.expanded,
    style: ({ theme }) => ({
      boxShadow: theme.vars.customShadows.z8,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.vars.palette.background.paper,
    }),
  },
] satisfies AccordionVariants;

const disableGuttersVariants = [
  {
    props: (props) => !!props.disableGutters,
    style: ({ theme }) => ({
      borderBottom: `solid 1px ${theme.vars.palette.divider}`,
      "&:last-of-type": { borderBottom: "none" },
      "&::before": { display: "none" }, // Hide the border
      [`& .${accordionSummaryClasses.root}`]: {
        paddingLeft: 0,
        paddingRight: 0,
      },
      [`& .${accordionDetailsClasses.root}`]: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    }),
  },
] satisfies AccordionVariants;

const disableVariants = [
  {
    props: {},
    style: ({ theme }) => ({
      [`&.${accordionClasses.disabled}`]: {
        backgroundColor: "transparent",
        [`& .${accordionDetailsClasses.root}`]: {
          opacity: theme.vars.palette.action.disabledOpacity,
        },
      },
    }),
  },
] satisfies AccordionVariants;

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiAccordion: Components<Theme>["MuiAccordion"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    square: true,
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: {
      backgroundColor: "transparent",
      variants: [...expandedVariants, ...disableGuttersVariants, ...disableVariants],
    },
  },
};

const sizingReset: Partial<Record<AccordionSummaryClassKey, CSSObject>> = {
  root: {
    minHeight: "auto",
    [`&.${accordionSummaryClasses.expanded}`]: {
      minHeight: "inherit",
    },
  },
  content: {
    margin: 0,
    [`&.${accordionSummaryClasses.expanded}`]: {
      margin: "inherit",
    },
  },
};

const MuiAccordionSummary: Components<Theme>["MuiAccordionSummary"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    expandIcon: <ExpandIcon />,
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      ...sizingReset.root,
      padding: theme.spacing(2, 1, 2, 2),
    }),
    content: {
      ...sizingReset.content,
    },
    expandIconWrapper: ({ theme }) => ({
      ...getExpandIconStyles(theme),
      color: "inherit",
      alignSelf: "flex-start",
      marginLeft: theme.spacing(2),
    }),
  },
};

const MuiAccordionDetails: Components<Theme>["MuiAccordionDetails"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: {
      paddingTop: 0,
    },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const accordion: Components<Theme> = {
  MuiAccordion,
  MuiAccordionSummary,
  MuiAccordionDetails,
};
