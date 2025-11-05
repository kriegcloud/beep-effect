import Collapse from "@mui/material/Collapse";
import { styled } from "@mui/material/styles";

import { navSectionClasses } from "../styles";

export const NavCollapse = styled(Collapse, {
  shouldForwardProp: (prop: string) => !["depth", "sx"].includes(prop),
})<{ depth?: number | undefined }>(({ depth }) => {
  return {
    ...(depth && {
      ...(depth + 1 !== 1 && {
        paddingLeft: "calc(var(--nav-item-pl) + var(--nav-icon-size) / 2)",
        [`& .${navSectionClasses.ul}`]: {
          position: "relative",
          paddingLeft: "var(--nav-bullet-size)",
        },
      }),
    }),
  };
});
