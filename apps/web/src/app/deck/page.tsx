"use client";
import Box, { type BoxProps } from "@mui/material/Box";
import type React from "react";
import { GlowEffectPaper } from "./GlowEffectPaper";

const AppLayer: React.FC<React.PropsWithChildren<BoxProps>> = ({ children, sx, ...boxProps }) => (
  <Box
    sx={{
      ...sx,
      position: "relative",
      zIndex: 0,
      display: "flex",
    }}
    {...boxProps}
  >
    {children}
  </Box>
);

const AppMain: React.FC<React.PropsWithChildren<BoxProps>> = ({ children, sx, ...boxProps }) => (
  <Box
    sx={{
      ...sx,
      marginTop: "3rem",
      width: "100dvw",
      height: "calc(100dvh - 3rem)",
      display: "flex",
    }}
    {...boxProps}
  >
    {children}
  </Box>
);

const HeaderPanelOrbBackdrop: React.FC<React.PropsWithChildren<BoxProps>> = ({ children, sx, ...boxProps }) => {
  return (
    <GlowEffectPaper
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "3rem",
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          background: "transparent",
          pl: "1rem",
          pr: "1rem",
          gridTemplateColumns: "1fr auto 1fr",
          display: "grid",
        }}
      >
        <Box className={"flex items-center gap-x-1"}>left</Box>
        <Box className={"flex min-w-0 items-center justify-center"}>center</Box>
        <Box className={"flex items-center justify-end gap-1"}>right</Box>
      </Box>
    </GlowEffectPaper>
  );
};

const MainContainer: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        maxHeight: "none",
      }}
      className={"relative flex h-full w-full md:gap-x-3 md:overflow-hidden p-2 pt-0 sm:p-3 sm:pt-0"}
    >
      <Box
        sx={(theme) => ({
          border: theme.vars.palette.grey["300"],
          position: "relative",
        })}
        className={"z-1 relative grid flex-1 grid-rows-[auto_1fr] overflow-clip rounded-xl border"}
      >
        <GlowEffectPaper
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            overflow: "hidden",
            zIndex: 0,
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }} className={"flex min-h-0 w-full overflow-clip"}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

const DeckSideNav: React.FC<React.PropsWithChildren> = () => {
  return (
    <Box sx={{ opacity: 1 }} className={"space-step2 relative flex h-full"}>
      <Box
        sx={{}}
        className={
          "bg-appcolor-100 no-scrollbar relative flex h-full flex-col items-center transition-all duration-200 ease-out"
        }
      >
        <div className="flex flex-shrink-0 flex-col items-center gap-1.5 pt-3">
          <div className="flex flex-shrink-0 flex-col gap-1.5">
            <a className="flex items-center justify-center" href="/search" data-discover="true">
              <Box
                component={"span"}
                className="duration-20 text-textcolor-900 relative flex cursor-pointer items-center justify-center rounded-xl border-0 p-1 shadow-none transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                data-state="closed"
                sx={{ width: "29px", height: "29px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-search"
                  aria-hidden="true"
                >
                  <path d="m21 21-4.34-4.34" />
                  <circle cx="11" cy="11" r="8" />
                </svg>
              </Box>
            </a>
            <a className="flex items-center justify-center" href="/recent" data-discover="true">
              <Box
                component={"span"}
                className="duration-20 text-textcolor-900 relative flex cursor-pointer items-center justify-center rounded-xl border-0 p-1 shadow-none transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                data-state="closed"
                sx={{ width: "29px", height: "29px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-clock"
                  aria-hidden="true"
                >
                  <path d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </Box>
            </a>
            <a className="flex items-center justify-center" href="/shared" data-discover="true">
              <Box
                component={"span"}
                className="duration-20 text-textcolor-900 relative flex cursor-pointer items-center justify-center rounded-xl border-0 p-1 shadow-none transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                data-state="closed"
                sx={{ width: "29px", height: "29px" }}
              >
                <svg
                  role={"img"}
                  fill="currentColor"
                  height="20"
                  strokeWidth="0"
                  width="20"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.88552 6.12014C3.8862 3.79073 5.77501 1.90234 8.10457 1.90234C10.4345 1.90234 12.3236 3.79142 12.3236 6.1214C12.3236 8.45138 10.4345 10.3405 8.10457 10.3405H8.0794H8.07715C5.75485 10.3327 3.8775 8.44321 3.88552 6.12014ZM8.10457 3.25234C6.52018 3.25234 5.23552 4.537 5.23552 6.1214V6.12393C5.22961 7.7013 6.50401 8.98462 8.08055 8.99046H8.10457C9.68897 8.99046 10.9736 7.7058 10.9736 6.1214C10.9736 4.537 9.68897 3.25234 8.10457 3.25234ZM13.1733 3.36138C13.2482 2.99618 13.6049 2.7608 13.9701 2.83564C15.4943 3.14801 16.6416 4.49613 16.6406 6.11314C16.6404 7.66264 15.5876 8.96274 14.1608 9.34408C13.8006 9.44035 13.4306 9.22643 13.3343 8.86627C13.2381 8.50613 13.452 8.13613 13.8121 8.03987C14.6641 7.81218 15.2906 7.03509 15.2906 6.11272C15.2912 5.15045 14.608 4.34443 13.6991 4.15816C13.3339 4.08331 13.0985 3.72658 13.1733 3.36138ZM13.8471 11.5951C13.8471 11.2222 14.1494 10.9201 14.5221 10.9201C15.4773 10.9201 16.3633 11.2421 17.0202 11.7178C17.6524 12.1757 18.1905 12.8709 18.1905 13.6667C18.1905 14.6057 17.4486 15.4312 16.472 15.6606C16.1091 15.7458 15.7458 15.5207 15.6605 15.1578C15.5754 14.7948 15.8005 14.4316 16.1634 14.3464C16.6324 14.2362 16.8405 13.8794 16.8405 13.6667C16.8405 13.4856 16.6892 13.145 16.2284 12.8112C15.7922 12.4953 15.1814 12.2701 14.5221 12.2701C14.1494 12.2701 13.8471 11.9679 13.8471 11.5951ZM4.57429 13.8524C3.66345 14.4242 3.2499 15.1015 3.2499 15.6749C3.2499 15.9482 3.33893 16.1481 3.50565 16.3211C3.68838 16.5108 3.98893 16.6907 4.43599 16.8405C5.33696 17.1426 6.62783 17.2567 8.10457 17.2567C9.58826 17.2567 10.8781 17.1384 11.7761 16.8331C12.2215 16.6816 12.5207 16.5003 12.7029 16.3095C12.8694 16.1349 12.9585 15.9332 12.9585 15.6586C12.9585 15.0883 12.5442 14.415 11.6304 13.8459C10.7377 13.29 9.48139 12.9163 8.10457 12.9163C6.72039 12.9163 5.46465 13.2934 4.57429 13.8524ZM3.85645 12.7091C4.98135 12.0028 6.49044 11.5663 8.10457 11.5663C9.70983 11.5663 11.2179 11.9985 12.3441 12.6999C13.4492 13.3882 14.3085 14.4236 14.3085 15.6586C14.3085 16.2867 14.0812 16.8205 13.6796 17.2414C13.2935 17.646 12.7727 17.9201 12.2107 18.1112C11.0938 18.4911 9.61921 18.6067 8.10457 18.6067C6.59924 18.6067 5.12528 18.4955 4.00693 18.1206C3.44433 17.932 2.9216 17.6606 2.53348 17.2578C2.12932 16.8383 1.8999 16.3046 1.8999 15.6749C1.8999 14.442 2.75203 13.4025 3.85645 12.7091Z"
                    fillRule="evenodd"
                  />
                </svg>
              </Box>
            </a>
            <div className="bg-appcolor-200 my-2.5 h-px w-full" />
            <div className="flex flex-shrink-0 flex-col gap-1.5">
              <a className="flex items-center justify-center" href="/search" data-discover="true">
                <Box
                  component={"span"}
                  className="duration-20 text-textcolor-900 relative flex cursor-pointer items-center justify-center rounded-xl border-0 p-1 shadow-none transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                  data-state="closed"
                  sx={{ width: "29px", height: "29px" }}
                >
                  <svg
                    role={"img"}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-search"
                    aria-hidden="true"
                  >
                    <path d="m21 21-4.34-4.34" />
                    <circle cx="11" cy="11" r="8" />
                  </svg>
                </Box>
              </a>
              <a className="flex items-center justify-center" href="/recent" data-discover="true">
                <Box
                  component={"span"}
                  className="duration-20 text-textcolor-900 relative flex cursor-pointer items-center justify-center rounded-xl border-0 p-1 shadow-none transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                  data-state="closed"
                  sx={{ width: "29px", height: "29px" }}
                >
                  <svg
                    role={"img"}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-clock"
                    aria-hidden="true"
                  >
                    <path d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </Box>
              </a>
              <a className="flex items-center justify-center" href="/shared" data-discover="true">
                <Box
                  component={"span"}
                  className="duration-20 text-textcolor-900 relative flex cursor-pointer items-center justify-center rounded-xl border-0 p-1 shadow-none transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                  data-state="closed"
                  sx={{ width: "29px", height: "29px" }}
                >
                  <svg
                    role={"img"}
                    fill="currentColor"
                    height="20"
                    strokeWidth="0"
                    width="20"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.88552 6.12014C3.8862 3.79073 5.77501 1.90234 8.10457 1.90234C10.4345 1.90234 12.3236 3.79142 12.3236 6.1214C12.3236 8.45138 10.4345 10.3405 8.10457 10.3405H8.0794H8.07715C5.75485 10.3327 3.8775 8.44321 3.88552 6.12014ZM8.10457 3.25234C6.52018 3.25234 5.23552 4.537 5.23552 6.1214V6.12393C5.22961 7.7013 6.50401 8.98462 8.08055 8.99046H8.10457C9.68897 8.99046 10.9736 7.7058 10.9736 6.1214C10.9736 4.537 9.68897 3.25234 8.10457 3.25234ZM13.1733 3.36138C13.2482 2.99618 13.6049 2.7608 13.9701 2.83564C15.4943 3.14801 16.6416 4.49613 16.6406 6.11314C16.6404 7.66264 15.5876 8.96274 14.1608 9.34408C13.8006 9.44035 13.4306 9.22643 13.3343 8.86627C13.2381 8.50613 13.452 8.13613 13.8121 8.03987C14.6641 7.81218 15.2906 7.03509 15.2906 6.11272C15.2912 5.15045 14.608 4.34443 13.6991 4.15816C13.3339 4.08331 13.0985 3.72658 13.1733 3.36138ZM13.8471 11.5951C13.8471 11.2222 14.1494 10.9201 14.5221 10.9201C15.4773 10.9201 16.3633 11.2421 17.0202 11.7178C17.6524 12.1757 18.1905 12.8709 18.1905 13.6667C18.1905 14.6057 17.4486 15.4312 16.472 15.6606C16.1091 15.7458 15.7458 15.5207 15.6605 15.1578C15.5754 14.7948 15.8005 14.4316 16.1634 14.3464C16.6324 14.2362 16.8405 13.8794 16.8405 13.6667C16.8405 13.4856 16.6892 13.145 16.2284 12.8112C15.7922 12.4953 15.1814 12.2701 14.5221 12.2701C14.1494 12.2701 13.8471 11.9679 13.8471 11.5951ZM4.57429 13.8524C3.66345 14.4242 3.2499 15.1015 3.2499 15.6749C3.2499 15.9482 3.33893 16.1481 3.50565 16.3211C3.68838 16.5108 3.98893 16.6907 4.43599 16.8405C5.33696 17.1426 6.62783 17.2567 8.10457 17.2567C9.58826 17.2567 10.8781 17.1384 11.7761 16.8331C12.2215 16.6816 12.5207 16.5003 12.7029 16.3095C12.8694 16.1349 12.9585 15.9332 12.9585 15.6586C12.9585 15.0883 12.5442 14.415 11.6304 13.8459C10.7377 13.29 9.48139 12.9163 8.10457 12.9163C6.72039 12.9163 5.46465 13.2934 4.57429 13.8524ZM3.85645 12.7091C4.98135 12.0028 6.49044 11.5663 8.10457 11.5663C9.70983 11.5663 11.2179 11.9985 12.3441 12.6999C13.4492 13.3882 14.3085 14.4236 14.3085 15.6586C14.3085 16.2867 14.0812 16.8205 13.6796 17.2414C13.2935 17.646 12.7727 17.9201 12.2107 18.1112C11.0938 18.4911 9.61921 18.6067 8.10457 18.6067C6.59924 18.6067 5.12528 18.4955 4.00693 18.1206C3.44433 17.932 2.9216 17.6606 2.53348 17.2578C2.12932 16.8383 1.8999 16.3046 1.8999 15.6749C1.8999 14.442 2.75203 13.4025 3.85645 12.7091Z"
                      fillRule="evenodd"
                    />
                  </svg>
                </Box>
              </a>
              <div className="bg-appcolor-200 my-2.5 h-px w-full" />
            </div>
          </div>
        </div>
      </Box>
      <Box
        className={"liquid-glass-panel relative h-full overflow-hidden border-r liquid-glass"}
        sx={{
          width: "280px",
          opacity: 1,
          background:
            "linear-gradient(235deg, hsl(342 40% 10% / .7), hsl(342 40% 10% / 0) 33%), linear-gradient(45deg, hsl(312 35% 10% / .6), hsl(312 35% 10% / 0) 33%), hsl(220deg 25% 6% / .66)",
        }}
      >
        <Box
          className={"absolute left-0 top-0 flex h-full w-full flex-col overflow-auto"}
          sx={{
            width: "280px",
            opacity: 1,
            transform: "none",
          }}
        >
          <Box className={"px-2 py-3"}>
            <Box className={"flex flex-col"}>
              <Box className={"flex flex-shrink-0 flex-col gap-1.5"}>
                <a className="flex items-center justify-center" href="/search" data-discover="true">
                  <Box
                    component={"span"}
                    className="duration-20 text-textcolor-900 relative flex cursor-pointer items-center justify-center rounded-xl border-0 p-1 shadow-none transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                    data-state="closed"
                    sx={{
                      width: "29px",
                      height: "29px",
                    }}
                  >
                    <svg
                      role={"img"}
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-search"
                      aria-hidden="true"
                    >
                      <path d="m21 21-4.34-4.34" />
                      <circle cx="11" cy="11" r="8" />
                    </svg>
                  </Box>
                  beep
                </a>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default function Page() {
  return (
    <AppLayer>
      <HeaderPanelOrbBackdrop />
      <AppMain>
        <MainContainer>
          <DeckSideNav />
        </MainContainer>
      </AppMain>
    </AppLayer>
  );
}
