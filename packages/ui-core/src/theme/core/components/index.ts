import { typography } from "@beep/ui-core/theme/core/components/typography";
import type { Components, Theme } from "@mui/material/styles";
import { accordion } from "./accordion";
import { alert } from "./alert";
import { appBar } from "./appbar";
import { autocomplete } from "./autocomplete";
import { avatar } from "./avatar";
import { backdrop } from "./backdrop";
import { badge } from "./badge";
import { breadcrumbs } from "./breadcrumbs";
import { button } from "./button";
import { fab } from "./button-fab";
import { buttonGroup } from "./button-group";
import { iconButton } from "./button-icon";
import { toggleButton } from "./button-toggle";
import { card } from "./card";
import { checkbox } from "./checkbox";
import { chip } from "./chip";
import { dialog } from "./dialog";
import { drawer } from "./drawer";
import { form } from "./form";
import { link } from "./link";
import { list } from "./list";
import { menu } from "./menu";
import { dataGrid } from "./mui-x-data-grid";
import { datePicker } from "./mui-x-date-picker";
import { treeView } from "./mui-x-tree-view";
import { pagination } from "./pagination";
import { paper } from "./paper";
import { popover } from "./popover";
import { popper } from "./popper";
import { progress } from "./progress";
import { radio } from "./radio";
import { rating } from "./rating";
import { select } from "./select";
import { skeleton } from "./skeleton";
import { slider } from "./slider";
import { stack } from "./stack";
import { stepper } from "./stepper";
import { svgIcon } from "./svg-icon";
import { switches } from "./switch";
import { table } from "./table";
import { tabs } from "./tabs";
import { textField } from "./text-field";
import { timeline } from "./timeline";
import { toolbar } from "./toolbar";
import { tooltip } from "./tooltip";
export { toolbar };

export const components: Components<Theme> = {
  ...typography,
  ...toolbar,
  ...card,
  ...link,
  ...tabs,
  ...chip,
  ...menu,
  ...list,
  ...stack,
  ...paper,
  ...table,
  ...alert,
  ...badge,
  ...dialog,
  ...appBar,
  ...avatar,
  ...drawer,
  ...stepper,
  ...tooltip,
  ...popover,
  ...svgIcon,
  ...skeleton,
  ...timeline,
  ...backdrop,
  ...progress,
  ...accordion,
  ...pagination,
  ...breadcrumbs,
  // ➤➤ Forms ➤➤
  ...form,
  ...radio,
  ...select,
  ...slider,
  ...rating,
  ...switches,
  ...checkbox,
  ...textField,
  ...autocomplete,
  // ➤➤ Buttons ➤➤
  ...fab,
  ...button,
  ...iconButton,
  ...buttonGroup,
  ...toggleButton,
  // ➤➤ MUI X ➤➤
  ...treeView,
  ...dataGrid,
  ...datePicker,
  ...popper,
};
