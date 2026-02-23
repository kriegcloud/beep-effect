import { css } from "@mui/material";

export const videoNodeStyles = css`
  .lexical-video {
    position: relative;
    width: 100%;
    margin: 8px 0;
    user-select: none;
  }

  .lexical-video__inner {
    position: relative;
    width: 100%;
    padding-top: 56.25%; /* 16:9 */
    background: #000000;
    border-radius: 8px;
    overflow: hidden;
  }

  .lexical-video__iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }

  .lexical-video__caption {
    font:
      13px/1.4 system-ui,
      -apple-system,
      Segoe UI,
      Roboto,
      Helvetica,
      Arial,
      sans-serif;
    color: #6b7280;
    margin-top: 4px;
    text-align: center;
  }
`;
