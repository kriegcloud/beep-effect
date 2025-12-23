import { css } from "@mui/material";

export const tableCellResizerPluginStyles = css`
  .TableCellResizer__resizer {
    position: absolute;
    touch-action: none;
  }

  @media (pointer: coarse) {
    .TableCellResizer__resizer {
      background-color: #adf;
      mix-blend-mode: color;
    }
  }
`;
