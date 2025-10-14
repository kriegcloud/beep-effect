import { Link, type SvgIconProps, typographyClasses } from "@mui/material";

export interface LogoProps extends SvgIconProps {
  showName?: boolean;
}

export const Logo = ({ sx, viewBox = "0 0 1200 1200", showName = true, ...rest }: LogoProps) => {
  return (
    <Link
      href={"/"}
      underline="none"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 72,
        height: 72,
        flexShrink: 0,

        marginLeft: "auto",
        marginRight: "auto",
        "&:hover": {
          [`& .${typographyClasses.root}`]: {
            backgroundPosition: ({ direction }) => (direction === "rtl" ? "right" : "left"),
          },
        },
      }}
    >
      <svg
        role={"img"}
        xmlns="http://www.w3.org/2000/svg"
        className="looka-1j8o68f"
        viewBox={viewBox}
        width="100%"
        height="100%"
        strokeLinecap="round"
        strokeLinejoin="round"
        data-color-mode="dark"
        style={{ display: "block" }}
      >
        <defs />
        <g transform="translate(961.3955 -1194.1925)">
          <g transform="matrix(1, 0, 0, 1, -961.3955, 1194.1925)" opacity="1">
            <image
              href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSIxMjAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiPjxnIHRyYW5zZm9ybT0ic2NhbGUoMTEuMjg0NjczMDU3Mzc2ODg1KSB0cmFuc2xhdGUoMy4xODAxMDA2NTI5MDY2MzMsIDMuMTY4OTI0MDY2NzU1NTA3NCkiPiAgICAgICAgICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iU3ZnanNMaW5lYXJHcmFkaWVudDEwMTEiPjxzdG9wIGlkPSJTdmdqc1N0b3AxMDEyIiBzdG9wLWNvbG9yPSIjMDA2ODM4IiBvZmZzZXQ9IjAiLz48c3RvcCBpZD0iU3ZnanNTdG9wMTAxMyIgc3RvcC1jb2xvcj0iIzk2Y2YyNCIgb2Zmc2V0PSIxIi8+PC9saW5lYXJHcmFkaWVudD4gICAgICAgICAgICA8ZyBmaWxsPSJ1cmwoI1N2Z2pzTGluZWFyR3JhZGllbnQxMDExKSI+PGxpbmVhckdyYWRpZW50IGlkPSJTdmdqc0xpbmVhckdyYWRpZW50MTAxMSI+PHN0b3AgaWQ9IlN2Z2pzU3RvcDEwMTIiIHN0b3AtY29sb3I9IiMwMDY4MzgiIG9mZnNldD0iMCIvPjxzdG9wIGlkPSJTdmdqc1N0b3AxMDEzIiBzdG9wLWNvbG9yPSIjOTZjZjI0IiBvZmZzZXQ9IjEiLz48L2xpbmVhckdyYWRpZW50PiA8cGF0aCB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGQ9Im04My4yODEgNzMuMDQ3Yy00LjA3ODEtMi4xNjAyLTkuMTM2Ny0wLjYwMTU2LTExLjI5NyAzLjQ3NjYtMC42NjAxNiAxLjMwMDgtMS40NDUzIDIuNTM5MS0yLjM0MzggMy42OTUzLTAuNTYyNS0wLjc2NTYyLTEuMDU0Ny0xLjU3ODEtMS40NzY2LTIuNDI5Ny0xLjI1NzgtNS42NjQxLTguMTc5Ny0zNS43OTctMTguNTIzLTU5LjQ0NS0yLjE5MTQtNS4wMDc4LTQuNTU0Ny04LjcyNjYtNy4yMTg4LTExLjM2Ny00LjA4OTgtNC4wNDY5LTguMjQyMi00Ljg2MzMtMTEuMDIzLTQuODI4MS0zLjc2NTYgMC4wMzkwNjItOS4zNTE2IDEuNjc1OC0xNC41NyA5LjIyMjctMS41NDMgMi4yNDYxLTIuODU1NSA0LjY0MDYtMy45Mjk3IDcuMTQ4NC0wLjg1OTM4IDIuMDU0Ny0wLjg2NzE5IDQuMzY3Mi0wLjAxOTUzMiA2LjQyNTggMC44NTE1NiAyLjA1ODYgMi40ODgzIDMuNjk1MyA0LjU1MDggNC41MzkxIDIuMDU4NiAwLjg0NzY2IDQuMzcxMSAwLjgzNTk0IDYuNDI1OC0wLjAzMTI1IDIuMDUwOC0wLjg2NzE5IDMuNjcxOS0yLjUxNTYgNC41LTQuNTg1OWgwLjAwMzkwNmMwLjc5Mjk3LTEuODMyIDEuODI0Mi0zLjU1NDcgMy4wNjI1LTUuMTIxMSAwLjcwMzEyIDAuOTMzNTkgMS43MTA5IDIuNTU0NyAyLjkwNjIgNS4yOTY5IDAuNzM4MjggMS42ODc1IDEuNDYwOSAzLjQxOCAyLjE2NDEgNS4xNzk3di0wLjAwMzkwNmMyLjg1OTQgNy4xNjAyIDIuMTA5NCAxNS4yNTgtMi4wMTU2IDIxLjc3bC0yMC44OTggMzMuMDM1Yy0yLjQ2ODggMy45MDIzLTEuMzA4NiA5LjA2MjUgMi41OTM4IDExLjUzMSAzLjg5ODQgMi40Njg4IDkuMDU4NiAxLjMwODYgMTEuNTI3LTIuNTkzOGwxOS41NTEtMzAuODk4YzMuMDAzOSAxMC45NjEgNC43MzQ0IDE4Ljk2OSA0Ljc2OTUgMTkuMTI1IDAuMTA1NDcgMC40ODgyOCAwLjI1MzkxIDAuOTY4NzUgMC40NDUzMSAxLjQyOTcgMC45NDE0MSAyLjI4OTEgNi4xNjAyIDEzLjcxOSAxNi40NzcgMTQuMjE5IDAuMjM0MzggMC4wMTE3MTggMC40Njg3NSAwLjAxNTYyNCAwLjcwMzEyIDAuMDE1NjI0IDYuNjA5NCAwIDEyLjM1OS00LjUzOTEgMTcuMTA5LTEzLjUwOCAxLjAzOTEtMS45NTcgMS4yNTc4LTQuMjUgMC42MDU0Ny02LjM2NzItMC42NTIzNC0yLjEyMTEtMi4xMTcyLTMuODk0NS00LjA3ODEtNC45Mjk3eiIvPjwvZz4gICAgICAgIDwvZz48L3N2Zz4="
              width="1200"
              height="1200"
            />
          </g>
          <g transform="matrix(1, 0, 0, 1, -912.148, 1272.8914)" opacity="1">
            <image
              href="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSIxMjAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiPjxnIHRyYW5zZm9ybT0ic2NhbGUoMTMuNSkgdHJhbnNsYXRlKC01LjU1NTU1NTU1NTU1NTU1NSwgLTUuNjA1NTU0NzkyNjE2MTA0KSI+ICAgICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJTdmdqc0xpbmVhckdyYWRpZW50MTAxMSI+PHN0b3AgaWQ9IlN2Z2pzU3RvcDEwMTIiIHN0b3AtY29sb3I9IiM5MDVlMjYiIG9mZnNldD0iMCIvPjxzdG9wIGlkPSJTdmdqc1N0b3AxMDEzIiBzdG9wLWNvbG9yPSIjZjVlYzliIiBvZmZzZXQ9IjAuNSIvPjxzdG9wIGlkPSJTdmdqc1N0b3AxMDE0IiBzdG9wLWNvbG9yPSIjOTA1ZTI2IiBvZmZzZXQ9IjEiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iU3ZnanNMaW5lYXJHcmFkaWVudDEwMTUiPjxzdG9wIGlkPSJTdmdqc1N0b3AxMDE2IiBzdG9wLWNvbG9yPSIjOTA1ZTI2IiBvZmZzZXQ9IjAiLz48c3RvcCBpZD0iU3ZnanNTdG9wMTAxNyIgc3RvcC1jb2xvcj0iI2Y1ZWM5YiIgb2Zmc2V0PSIwLjUiLz48c3RvcCBpZD0iU3ZnanNTdG9wMTAxOCIgc3RvcC1jb2xvcj0iIzkwNWUyNiIgb2Zmc2V0PSIxIi8+PC9saW5lYXJHcmFkaWVudD4gICAgICAgICAgICA8ZyBmaWxsPSJ1cmwoI1N2Z2pzTGluZWFyR3JhZGllbnQxMDExKSI+PGxpbmVhckdyYWRpZW50IGlkPSJTdmdqc0xpbmVhckdyYWRpZW50MTAxMSI+PHN0b3AgaWQ9IlN2Z2pzU3RvcDEwMTIiIHN0b3AtY29sb3I9IiM5MDVlMjYiIG9mZnNldD0iMCIvPjxzdG9wIGlkPSJTdmdqc1N0b3AxMDEzIiBzdG9wLWNvbG9yPSIjZjVlYzliIiBvZmZzZXQ9IjAuNSIvPjxzdG9wIGlkPSJTdmdqc1N0b3AxMDE0IiBzdG9wLWNvbG9yPSIjOTA1ZTI2IiBvZmZzZXQ9IjEiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iU3ZnanNMaW5lYXJHcmFkaWVudDEwMTUiPjxzdG9wIGlkPSJTdmdqc1N0b3AxMDE2IiBzdG9wLWNvbG9yPSIjOTA1ZTI2IiBvZmZzZXQ9IjAiLz48c3RvcCBpZD0iU3ZnanNTdG9wMTAxNyIgc3RvcC1jb2xvcj0iI2Y1ZWM5YiIgb2Zmc2V0PSIwLjUiLz48c3RvcCBpZD0iU3ZnanNTdG9wMTAxOCIgc3RvcC1jb2xvcj0iIzkwNWUyNiIgb2Zmc2V0PSIxIi8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjEwIiB5PSI0Ni4zIiB3aWR0aD0iNSIgaGVpZ2h0PSIyLjUiLz48cGF0aCB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGQ9Ik0xNSw0My44djIuNWgxNXYyLjVoMi41djIuNUgzNXYyLjVoMi41djIuNUg1NXYtMi41aDIuNXYtMi41SDYwdi0yLjVoNXYyLjVoMi41djIuNUg4NXYtMi41aDIuNXYtMi41SDkwdi01SDE1eiBNNDcuNSw1My44ICBINDV2LTIuNWgtMi41djIuNUg0MHYtMi41aC0yLjV2LTIuNUgzNXYtMi41aDIuNXYyLjVINDB2LTIuNWgyLjV2Mi41SDQ1djIuNWgyLjVWNTMuOHogTTc3LjUsNTEuM0g3NXYtMi41aC0yLjV2Mi41SDcwdi0yLjVoLTIuNSAgdi0yLjVINzB2Mi41aDIuNXYtMi41SDc1djIuNWgyLjVWNTEuM3oiLz48cmVjdCB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjQwIiB5PSI0OC44IiB3aWR0aD0iMi41IiBoZWlnaHQ9IjIuNSIvPjwvZz4gICAgICAgIDwvZz48L3N2Zz4="
              width="896.029014127285"
              height="896.029014127285"
            />
          </g>
        </g>
      </svg>
    </Link>
  );
};
