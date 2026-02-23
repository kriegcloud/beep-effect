import { rgbaFromChannel } from "@beep/ui-core/utils";
import { circularProgressClasses } from "@mui/material/CircularProgress";
import { iconButtonClasses } from "@mui/material/IconButton";
import { linearProgressClasses } from "@mui/material/LinearProgress";
import { listClasses } from "@mui/material/List";
import { listItemIconClasses } from "@mui/material/ListItemIcon";
import { paperClasses } from "@mui/material/Paper";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import SvgIcon, { svgIconClasses } from "@mui/material/SvgIcon";
import type { Components, CSSObject, Theme } from "@mui/material/styles";
import type { GridBaseIconProps } from "@mui/x-data-grid";
import { gridClasses } from "@mui/x-data-grid";

export type IconProps = Omit<SvgIconProps & GridBaseIconProps, "color">;

/* **********************************************************************
 * ♉️ Custom icons
 * **********************************************************************/
export const ArrowUpIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/solar/alt-arrow-up-bold-duotone/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      d="m8.303 11.596l3.327-3.431a.499.499 0 0 1 .74 0l6.43 6.63c.401.414.158 1.205-.37 1.205h-5.723z"
    />
    <path fill="currentColor" d="M11.293 16H5.57c-.528 0-.771-.791-.37-1.205l2.406-2.482z" opacity="0.5" />
  </SvgIcon>
);

export const ArrowDownIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/solar/alt-arrow-down-bold-duotone/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      d="m8.303 12.404l3.327 3.431c.213.22.527.22.74 0l6.43-6.63C19.201 8.79 18.958 8 18.43 8h-5.723z"
    />
    <path fill="currentColor" d="M11.293 8H5.57c-.528 0-.771.79-.37 1.205l2.406 2.481z" opacity="0.5" />
  </SvgIcon>
);

export const FilterIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/mingcute/filter-fill/
  <SvgIcon {...props}>
    <g fill="none" fillRule="evenodd">
      <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
      <path
        fill="currentColor"
        d="M3 4.5A1.5 1.5 0 0 1 4.5 3h15A1.5 1.5 0 0 1 21 4.5v2.086A2 2 0 0 1 20.414 8L15 13.414v7.424a1.1 1.1 0 0 1-1.592.984l-3.717-1.858A1.25 1.25 0 0 1 9 18.846v-5.432L3.586 8A2 2 0 0 1 3 6.586z"
      />
    </g>
  </SvgIcon>
);

export const ExportIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/solar/download-bold/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M12 1.25a.75.75 0 0 0-.75.75v10.973l-1.68-1.961a.75.75 0 1 0-1.14.976l3 3.5a.75.75 0 0 0 1.14 0l3-3.5a.75.75 0 1 0-1.14-.976l-1.68 1.96V2a.75.75 0 0 0-.75-.75"
      clipRule="evenodd"
    />
    <path
      fill="currentColor"
      d="M14.25 9v.378a2.249 2.249 0 0 1 2.458 3.586l-3 3.5a2.25 2.25 0 0 1-3.416 0l-3-3.5A2.25 2.25 0 0 1 9.75 9.378V9H8c-2.828 0-4.243 0-5.121.879C2 10.757 2 12.172 2 15v1c0 2.828 0 4.243.879 5.121C3.757 22 5.172 22 8 22h8c2.828 0 4.243 0 5.121-.879C22 20.243 22 18.828 22 16v-1c0-2.828 0-4.243-.879-5.121C20.243 9 18.828 9 16 9z"
    />
  </SvgIcon>
);

export const EyeIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/solar/eye-bold/
  <SvgIcon {...props}>
    <path fill="currentColor" d="M9.75 12a2.25 2.25 0 1 1 4.5 0a2.25 2.25 0 0 1-4.5 0" />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M2 12c0 1.64.425 2.191 1.275 3.296C4.972 17.5 7.818 20 12 20s7.028-2.5 8.725-4.704C21.575 14.192 22 13.639 22 12c0-1.64-.425-2.191-1.275-3.296C19.028 6.5 16.182 4 12 4S4.972 6.5 3.275 8.704C2.425 9.81 2 10.361 2 12m10-3.75a3.75 3.75 0 1 0 0 7.5a3.75 3.75 0 0 0 0-7.5"
      clipRule="evenodd"
    />
  </SvgIcon>
);

export const EyeCloseIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/solar/eye-closed-bold/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M1.606 6.08a1 1 0 0 1 1.313.526L2 7l.92-.394v-.001l.003.009l.021.045l.094.194c.086.172.219.424.4.729a13.4 13.4 0 0 0 1.67 2.237a12 12 0 0 0 .59.592C7.18 11.8 9.251 13 12 13a8.7 8.7 0 0 0 3.22-.602c1.227-.483 2.254-1.21 3.096-1.998a13 13 0 0 0 2.733-3.725l.027-.058l.005-.011a1 1 0 0 1 1.838.788L22 7l.92.394l-.003.005l-.004.008l-.011.026l-.04.087a14 14 0 0 1-.741 1.348a15.4 15.4 0 0 1-1.711 2.256l.797.797a1 1 0 0 1-1.414 1.415l-.84-.84a12 12 0 0 1-1.897 1.256l.782 1.202a1 1 0 1 1-1.676 1.091l-.986-1.514c-.679.208-1.404.355-2.176.424V16.5a1 1 0 0 1-2 0v-1.544c-.775-.07-1.5-.217-2.177-.425l-.985 1.514a1 1 0 0 1-1.676-1.09l.782-1.203c-.7-.37-1.332-.8-1.897-1.257l-.84.84a1 1 0 0 1-1.414-1.414l.797-.797a15.4 15.4 0 0 1-1.87-2.519a14 14 0 0 1-.591-1.107l-.033-.072l-.01-.021l-.002-.007l-.001-.002v-.001C1.08 7.395 1.08 7.394 2 7l-.919.395a1 1 0 0 1 .525-1.314"
      clipRule="evenodd"
    />
  </SvgIcon>
);

export const SearchIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/eva/search-fill/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      d="m20.71 19.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8a7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42M5 11a6 6 0 1 1 6 6a6 6 0 0 1-6-6"
    />
  </SvgIcon>
);

export const CloseIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/eva/close-fill/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      d="m13.41 12l4.3-4.29a1 1 0 1 0-1.42-1.42L12 10.59l-4.29-4.3a1 1 0 0 0-1.42 1.42l4.3 4.29l-4.3 4.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l4.29-4.3l4.29 4.3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42Z"
    />
  </SvgIcon>
);

export const MoreIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/eva/more-horizontal-fill/
  <SvgIcon {...props}>
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="19" cy="12" r="2" fill="currentColor" />
    <circle cx="5" cy="12" r="2" fill="currentColor" />
  </SvgIcon>
);

export const DensityCompactIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/material-symbols/table-rows-narrow-rounded/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      d="M4 15.5q-.425 0-.712-.288T3 14.5V14q0-.425.288-.712T4 13h16q.425 0 .713.288T21 14v.5q0 .425-.288.713T20 15.5zM4 11q-.425 0-.712-.288T3 10v-.5q0-.425.288-.712T4 8.5h16q.425 0 .713.288T21 9.5v.5q0 .425-.288.713T20 11zm0-4.5q-.425 0-.712-.288T3 5.5V5q0-.425.288-.712T4 4h16q.425 0 .713.288T21 5v.5q0 .425-.288.713T20 6.5zM4 20q-.425 0-.712-.288T3 19v-.5q0-.425.288-.712T4 17.5h16q.425 0 .713.288T21 18.5v.5q0 .425-.288.713T20 20z"
    />
  </SvgIcon>
);

export const DensityComfortableIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/mingcute/rows-2-fill/
  <SvgIcon {...props}>
    <g fill="none" fillRule="evenodd">
      <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
      <path
        fill="currentColor"
        d="M5 3a2 2 0 0 0-2 2v6h18V5a2 2 0 0 0-2-2zm16 10H3v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"
      />
    </g>
  </SvgIcon>
);

export const DensityStandardIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/mingcute/rows-4-fill/
  <SvgIcon {...props}>
    <g fill="none">
      <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093c.012.004.023 0 .029-.008l.004-.014l-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014l-.034.614c0 .012.007.02.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
      <path
        fill="currentColor"
        d="M21 16v3a2 2 0 0 1-1.85 1.995L19 21H5a2 2 0 0 1-1.995-1.85L3 19v-3zm0-6v4H3v-4zm-2-7a2 2 0 0 1 2 2v3H3V5a2 2 0 0 1 2-2z"
      />
    </g>
  </SvgIcon>
);

export const ViewColumnsIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/flowbite/column-solid/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M15 4H9v16h6zm2 16h3a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3zM4 4h3v16H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2"
      clipRule="evenodd"
    />
  </SvgIcon>
);

export const RemoveAllIcon = (props: IconProps) => (
  // https://icon-sets.iconify.design/solar/trash-bin-trash-bold/
  <SvgIcon {...props}>
    <path
      fill="currentColor"
      d="M3 6.386c0-.484.345-.877.771-.877h2.665c.529-.016.996-.399 1.176-.965l.03-.1l.115-.391c.07-.24.131-.45.217-.637c.338-.739.964-1.252 1.687-1.383c.184-.033.378-.033.6-.033h3.478c.223 0 .417 0 .6.033c.723.131 1.35.644 1.687 1.383c.086.187.147.396.218.637l.114.391l.03.1c.18.566.74.95 1.27.965h2.57c.427 0 .772.393.772.877s-.345.877-.771.877H3.77c-.425 0-.77-.393-.77-.877"
    />
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.339 1.181-5.245l.267-4.188c.1-1.577.15-2.366-.303-2.865c-.454-.5-1.22-.5-2.753-.5H8.124c-1.533 0-2.3 0-2.753.5s-.404 1.288-.303 2.865l.267 4.188c.185 2.906.277 4.36 1.182 5.245c.905.886 2.296.886 5.079.886m-1.35-9.811c-.04-.434-.408-.75-.82-.707c-.413.043-.713.43-.672.864l.5 5.263c.04.434.408.75.82.707c.413-.043.713-.43.672-.864zm4.329-.707c.412.043.713.43.671.864l-.5 5.263c-.04.434-.409.75-.82.707c-.413-.043-.713-.43-.672-.864l.5-5.263c.04-.434.409-.75.82-.707"
      clipRule="evenodd"
    />
  </SvgIcon>
);

export const SeparatorIcon = (props: IconProps) => (
  <SvgIcon {...props}>
    <rect x="11.5" y="4" width="1" height="16" />
  </SvgIcon>
);

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiDataGrid: Components<Theme>["MuiDataGrid"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    showToolbar: true,
    slots: {
      /* Column */
      columnSortedAscendingIcon: ArrowUpIcon,
      columnSortedDescendingIcon: ArrowDownIcon,
      columnMenuSortAscendingIcon: ArrowUpIcon,
      columnMenuIcon: MoreIcon,
      columnMenuFilterIcon: FilterIcon,
      columnMenuHideIcon: EyeCloseIcon,
      columnMenuSortDescendingIcon: ArrowDownIcon,
      columnMenuManageColumnsIcon: ViewColumnsIcon,
      columnSelectorIcon: ViewColumnsIcon,
      columnResizeIcon: SeparatorIcon,
      /* Filter */
      filterPanelDeleteIcon: CloseIcon,
      openFilterButtonIcon: FilterIcon,
      columnFilteredIcon: FilterIcon,
      filterPanelRemoveAllIcon: RemoveAllIcon,
      /* Export */
      exportIcon: ExportIcon,
      /* Quick filter */
      quickFilterIcon: SearchIcon,
      quickFilterClearIcon: CloseIcon,
    },
    slotProps: {
      baseSelect: {
        native: true,
      },
      loadingOverlay: {
        variant: "skeleton",
      },
      columnsManagement: {
        searchInputProps: {
          size: "medium",
        },
      },
    },
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => {
      const baseStyles: CSSObject = {
        borderWidth: 0,
        backgroundColor: "transparent",
      };

      const scrollbarStyles: CSSObject = {
        scrollbarWidth: "thin",
        scrollbarColor: `${rgbaFromChannel(theme.vars.palette.text.disabledChannel, 0.4)} ${rgbaFromChannel(theme.vars.palette.text.disabledChannel, 0.08)}`,
      };

      return {
        "--unstable_DataGrid-radius": 0,
        "--unstable_DataGrid-headWeight": theme.typography.fontWeightSemiBold,
        ...baseStyles,
        ...scrollbarStyles,
      };
    },
    footerContainer: {
      minHeight: "auto",
      borderTopStyle: "dashed",
      [`& .${gridClasses.selectedRowCount}`]: {
        whiteSpace: "nowrap",
      },
    },
    /**
     * @overlay
     */
    overlay: ({ theme }) => ({
      [`& .${linearProgressClasses.root}`]: {
        height: 3,
        borderRadius: 0,
        backgroundColor: rgbaFromChannel(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar1}, .${linearProgressClasses.bar2}`]: {
          backgroundColor: theme.vars.palette.text.primary,
        },
      },
      [`& .${circularProgressClasses.root}`]: {
        color: theme.vars.palette.text.primary,
      },
    }),
    /**
     * @column
     */
    columnHeader: ({ theme }) => ({
      color: theme.vars.palette.text.secondary,
      backgroundColor: theme.vars.palette.background.neutral,
      [`&.${gridClasses["columnHeader--sorted"]}, &.${gridClasses["columnHeader--sorted"]} .${gridClasses.sortIcon}`]: {
        color: theme.vars.palette.text.primary,
      },
    }),
    /**
     * @cell
     */
    cell: ({ theme }) => ({
      borderTopStyle: "dashed",
      [`&.${gridClasses["cell--editing"]}`]: {
        boxShadow: "none",
        backgroundColor: rgbaFromChannel(theme.vars.palette.primary.mainChannel, 0.08),
      },
      "&:hover": {
        color: theme.vars.palette.primary.main,
      },
    }),
    /**
     * @toolbar
     */
    toolbar: ({ theme }) => ({
      minHeight: "auto",
      borderBottom: "none",
      padding: theme.spacing(2),
    }),
    toolbarDivider: {
      display: "none",
    },
    /**
     * @panel
     */
    panelContent: ({ theme }) => ({
      gap: theme.spacing(4),
      padding: theme.spacing(3, 2.5, 3, 2),
      [`&.${gridClasses.paper}`]: {
        ...theme.mixins.paperStyles(theme, { dropdown: true }),
        margin: 0,
        padding: 0,
      },
    }),
    panelFooter: ({ theme }) => ({
      padding: theme.spacing(1.5),
    }),
    menu: ({ theme }) => ({
      [`& .${paperClasses.root}`]: {
        ...theme.mixins.paperStyles(theme, { dropdown: true }),
      },
      [`& .${listClasses.root}`]: {
        padding: 0,
        [`& .${listItemIconClasses.root}`]: {
          minWidth: 0,
          marginRight: theme.spacing(2),
        },
      },
    }),
    /**
     * @panel column
     */
    columnsManagementHeader: ({ theme }) => ({
      paddingTop: theme.spacing(2.5),
    }),
    columnsManagement: ({ theme }) => ({
      gap: theme.spacing(0.5),
    }),
    columnsManagementFooter: ({ theme }) => ({
      borderTopStyle: "dashed",
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
    }),
    /**
     * @panel filter
     */
    filterFormDeleteIcon: ({ theme }) => ({
      [`& .${iconButtonClasses.root}`]: {
        padding: "5px",
        backgroundColor: rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.16),
        [`& .${svgIconClasses.root}`]: { width: 16, height: 16 },
      },
    }),
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const dataGrid: Components<Theme> = {
  MuiDataGrid,
};
