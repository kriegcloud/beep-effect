"use client";

import { assetPaths } from "@beep/constants";
import { styled } from "@mui/material/styles";

const StyledAvatar = styled("div")`
background: linear-gradient(135deg, rgb(40, 164, 40) 0%, rgb(71, 195, 122) 100%); --space-avatar-bg: transparent;
`;

const Page = () => {
  return (
    <div className={"flex h-dvh w-dvw flex-col"}>
      <div className={"relative"}>
        <div className={"header-panel-orb-backdrop"}>
          <div className={"header-panel-orb-primary"} />
          <div className={"header-panel-orb-secondary"} />
        </div>
        <div
          className={
            "header-with-orb-glow group/logo border-shade-gray-300 mt-safe-top grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-x-2 px-4"
          }
        >
          <nav aria-label={"Breadcrumb"} className={"flex items-center gap-x-1"}>
            <div className={"flex items-center"}>
              <div className={"flex h-8 w-8 items-center justify-center"} data-global-panel-toggle={"true"}>
                <a
                  className={
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ease-in-out hover:bg-shade-gray-200 hover:scale-105 dark:hover:bg-shade-gray-500"
                  }
                  href={"/"}
                  data-discover={"true"}
                >
                  <img
                    src={"/logo.avif"}
                    alt={"Beep"}
                    className={
                      "h-7 w-7 rounded-full border border-black/10 transition-transform ease-in-out dark:border-white/10"
                    }
                  />
                </a>
              </div>
            </div>
            <div aria-hidden={"true"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-slash text-shade-gray-500 h-3 w-3 shrink-0 -rotate-[30deg]"
                aria-hidden="true"
              >
                <path d="M22 2 2 22" />
              </svg>
            </div>
            <div className="flex items-center">
              <a
                className="text-shade-gray-1000 hover:bg-shade-gray-200 hover:text-shade-gray-1200 group flex h-7 shrink-0 items-center gap-x-1.5 rounded-lg px-2 text-xs transition-colors max-w-[80px] truncate text-xs font-medium md:max-w-none"
                href="/settings"
                data-discover="true"
              >
                <svg
                  role={"img"}
                  className="h-4 w-4 shrink-0"
                  fill="currentColor"
                  height="20"
                  strokeWidth="0"
                  width="20"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.667 1.85729C10.3076 1.49791 9.69241 1.49791 9.33304 1.85729C9.1973 1.99303 9.15138 2.13582 9.11013 2.46021C9.10618 2.49129 9.1023 2.52556 9.09811 2.56261C9.06339 2.86956 9.00708 3.36734 8.70791 3.81908C8.2256 4.54737 7.30719 4.87676 6.50377 4.73109C6.03952 4.64691 5.71651 4.40191 5.50436 4.23172C5.46874 4.20314 5.43645 4.17704 5.40689 4.15315C5.2356 4.01469 5.15576 3.95016 5.0487 3.90578C4.30066 3.59569 3.50477 4.39157 3.81486 5.13961C3.85925 5.24667 3.92378 5.32651 4.06223 5.4978C4.08613 5.52736 4.11223 5.55965 4.14081 5.59528C4.31099 5.80742 4.556 6.13044 4.64017 6.59469C4.78831 7.41169 4.43916 8.27326 3.76361 8.75643C3.3221 9.07221 2.82756 9.14207 2.52219 9.1852C2.48919 9.18986 2.45841 9.19421 2.43013 9.19852C2.10157 9.24865 1.96092 9.29607 1.83304 9.42395C1.47367 9.78333 1.47367 10.3985 1.83304 10.7579C1.96878 10.8936 2.11158 10.9395 2.43596 10.9808C2.46704 10.9847 2.50131 10.9886 2.53836 10.9928C2.84531 11.0275 3.34309 11.0838 3.79484 11.383C4.48851 11.8424 4.85532 12.7016 4.70684 13.5205C4.62266 13.9847 4.37766 14.3077 4.20747 14.5199C4.17889 14.5555 4.15279 14.5878 4.1289 14.6174C3.99045 14.7886 3.92591 14.8685 3.88153 14.9755C3.83406 15.0901 3.80963 15.2128 3.80963 15.3367C3.80963 15.9895 4.51291 16.4591 5.11536 16.2094C5.22243 16.165 5.30226 16.1005 5.47355 15.962C5.50312 15.9381 5.53541 15.912 5.57103 15.8834C5.78318 15.7132 6.10619 15.4682 6.57044 15.3841C7.38744 15.2359 8.24901 15.5851 8.73218 16.2606C9.04797 16.7021 9.11782 17.1967 9.16095 17.5021C9.16562 17.5351 9.16996 17.5658 9.17428 17.5941C9.2244 17.9227 9.27183 18.0633 9.39971 18.1912C9.5766 18.3681 9.81651 18.4675 10.0667 18.4675C10.3168 18.4675 10.5567 18.3681 10.7336 18.1912C10.8694 18.0555 10.9153 17.9127 10.9565 17.5883C10.9605 17.5572 10.9644 17.5229 10.9686 17.4859C11.0033 17.1789 11.0596 16.6812 11.3588 16.2294C11.8181 15.5357 12.6774 15.1689 13.4962 15.3174C13.9605 15.4016 14.2835 15.6466 14.4956 15.8168C14.5313 15.8453 14.5635 15.8714 14.5931 15.8953C14.7644 16.0338 14.8442 16.0983 14.9513 16.1427C15.6993 16.4528 16.4952 15.6569 16.1851 14.9089C16.1408 14.8018 16.0762 14.722 15.9378 14.5507C15.9139 14.5211 15.8878 14.4888 15.8592 14.4532C15.689 14.2411 15.444 13.9181 15.3598 13.4538C15.2113 12.6349 15.5782 11.7757 16.2718 11.3163C16.7084 11.0272 17.1889 10.965 17.4854 10.9266C17.5217 10.9219 17.5553 10.9175 17.5857 10.9132C17.8984 10.8682 18.0364 10.8217 18.167 10.6912C18.5263 10.3318 18.5263 9.71666 18.167 9.35729C18.0312 9.22154 17.8884 9.17562 17.564 9.13438C17.533 9.13042 17.4987 9.12655 17.4616 9.12236C17.1547 9.08763 16.6569 9.03132 16.2052 8.73216C15.4769 8.24985 15.1475 7.33144 15.2932 6.52802C15.3773 6.06377 15.6223 5.74076 15.7925 5.52861C15.8211 5.49298 15.8472 5.46069 15.8711 5.43113C16.0096 5.25984 16.0741 5.18001 16.1185 5.07294C16.4286 4.32491 15.6327 3.52902 14.8846 3.83911C14.7776 3.88349 14.6977 3.94803 14.5264 4.08648C14.4969 4.11037 14.4646 4.13647 14.429 4.16505C14.2168 4.33524 13.8938 4.58024 13.4296 4.66442C12.6107 4.8129 11.7515 4.44609 11.2921 3.75242C11.003 3.31587 10.9407 2.83533 10.9023 2.53887C10.8976 2.50252 10.8933 2.46892 10.8889 2.43852C10.844 2.12583 10.7975 1.98783 10.667 1.85729ZM8.30994 0.834183C9.23435 -0.0902355 10.7656 -0.0902354 11.6901 0.834183C12.1689 1.31305 12.2669 1.85571 12.3211 2.23281C12.3257 2.26465 12.33 2.29495 12.3341 2.32383C12.3831 2.66807 12.4032 2.80976 12.4984 2.95352C12.6386 3.16511 12.9219 3.28598 13.1714 3.24075C13.2591 3.22486 13.3433 3.18107 13.5236 3.03645C13.5431 3.02079 13.5649 3.00278 13.589 2.98295C13.7504 2.84988 14.0111 2.63494 14.3306 2.50252C16.2697 1.69865 18.2589 3.68784 17.4551 5.62701C17.3226 5.94646 17.1077 6.20717 16.9746 6.36858C16.9548 6.39264 16.9368 6.41449 16.9211 6.434C16.7765 6.61428 16.7327 6.69852 16.7168 6.78616C16.6644 7.07528 16.8029 7.39259 17.0041 7.52582C17.1526 7.62419 17.2995 7.6427 17.6596 7.68806C17.6873 7.69155 17.7162 7.69519 17.7466 7.69905C18.1352 7.74846 18.6962 7.84031 19.1901 8.33418C20.1145 9.2586 20.1145 10.7899 19.1901 11.7143C18.7112 12.1932 18.1685 12.2912 17.7914 12.3453C17.7596 12.3499 17.7293 12.3542 17.7004 12.3583C17.3562 12.4073 17.2145 12.4275 17.0707 12.5227C16.8591 12.6628 16.7383 12.9462 16.7835 13.1957C16.7994 13.2833 16.8432 13.3675 16.9878 13.5478C17.0035 13.5673 17.0215 13.5892 17.0413 13.6132C17.1744 13.7746 17.3893 14.0354 17.5217 14.3548C18.3256 16.294 16.3364 18.2832 14.3972 17.4793C14.0778 17.3469 13.8171 17.1319 13.6557 16.9989C13.6316 16.979 13.6098 16.961 13.5902 16.9454C13.41 16.8008 13.3257 16.757 13.2381 16.7411C12.9886 16.6958 12.7052 16.8167 12.5651 17.0283C12.4667 17.1768 12.4482 17.3237 12.4029 17.6839C12.3994 17.7115 12.3957 17.7405 12.3919 17.7708C12.3424 18.1594 12.2506 18.7204 11.7567 19.2143C11.3085 19.6625 10.7006 19.9144 10.0667 19.9144C9.43277 19.9144 8.82484 19.6625 8.3766 19.2143C7.89785 18.7356 7.8006 18.1837 7.74394 17.8123L7.73877 17.7784C7.68015 17.3938 7.65752 17.2452 7.55533 17.1024C7.39784 16.8822 7.09519 16.7594 6.82858 16.8077C6.74094 16.8236 6.6567 16.8674 6.47642 17.012C6.45691 17.0277 6.43506 17.0457 6.41101 17.0655C6.2496 17.1986 5.98889 17.4135 5.66944 17.546C4.11362 18.1909 2.36274 17.0201 2.36274 15.3367C2.36274 15.0226 2.42465 14.7116 2.54494 14.4215C2.67736 14.102 2.8923 13.8413 3.02537 13.6799C3.0452 13.6559 3.06322 13.634 3.07887 13.6145C3.2235 13.4342 3.26728 13.35 3.28317 13.2623C3.3284 13.0128 3.20753 12.7295 2.99594 12.5893C2.8474 12.491 2.70051 12.4725 2.34039 12.4271C2.3127 12.4236 2.28375 12.42 2.25344 12.4161C1.86485 12.3667 1.30381 12.2748 0.809937 11.781C-0.114482 10.8566 -0.114482 9.32527 0.809937 8.40085C1.28869 7.9221 1.84056 7.82484 2.21192 7.76819C2.22343 7.76643 2.23474 7.76471 2.24586 7.76301C2.63048 7.7044 2.77901 7.68176 2.92189 7.57958C3.14209 7.42208 3.26484 7.11943 3.2165 6.85282C3.20061 6.76519 3.15683 6.68095 3.0122 6.50066C2.99655 6.48115 2.97853 6.45931 2.9587 6.43525C2.82563 6.27384 2.61069 6.01313 2.47827 5.69368C1.67441 3.75451 3.6636 1.76532 5.60277 2.56918C5.92222 2.70161 6.18293 2.91654 6.34434 3.04962C6.36839 3.06945 6.39024 3.08746 6.40975 3.10311C6.59004 3.24774 6.67428 3.29152 6.76191 3.30741C7.05103 3.35984 7.36835 3.22136 7.50157 3.02018C7.59995 2.87164 7.61845 2.72475 7.66381 2.36464C7.6673 2.33695 7.67095 2.308 7.6748 2.27769C7.72422 1.88909 7.81606 1.32806 8.30994 0.834183ZM10 8.22338C9.01883 8.22338 8.22344 9.01877 8.22344 9.99994C8.22344 10.9811 9.01883 11.7765 10 11.7765C10.9812 11.7765 11.7766 10.9811 11.7766 9.99994C11.7766 9.01877 10.9812 8.22338 10 8.22338ZM6.77656 9.99994C6.77656 8.21968 8.21974 6.7765 10 6.7765C11.7803 6.7765 13.2234 8.21968 13.2234 9.99994C13.2234 11.7802 11.7803 13.2234 10 13.2234C8.21974 13.2234 6.77656 11.7802 6.77656 9.99994Z"
                    fillRule="evenodd"
                  />
                </svg>
                <span className="shrink-0 flex items-center">Settings</span>
              </a>
            </div>
          </nav>
          <div className="flex min-w-0 items-center justify-center" />
          <div className="flex items-center justify-end gap-1">
            <div className="hidden md:flex">
              <button
                type="button"
                aria-haspopup="menu"
                tabIndex={0}
                className="border-shade-gray-400 text-textcolor-900 hover:bg-appcolor-200 relative flex size-7 cursor-pointer items-center justify-center rounded-full border p-0 shadow-none transition-colors duration-200 ease-in-out"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-bell h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                  <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                </svg>
              </button>
            </div>
            {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: <explanation> */}
            <div
              id="radix-:rm:"
              aria-haspopup="menu"
              aria-expanded="false"
              data-state="closed"
              // style="--primary: 345.42857142857144deg 100% 58.82352941176471%;"
            >
              <button
                type={"button"}
                className="cursor-pointer border border-solid items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 border-transparent text-shade-accent-900 hover:bg-shade-accent-200 h-7 text-xs [&amp;&gt;svg]:size-3.5 px-3 flex w-fit shrink-0 rounded-full bg-transparent !p-0 transition-all duration-200 ease-in-out"
                data-shade-accent="primary"
              >
                <div
                  className="flex shrink-0 items-center justify-center rounded-full text-white/90 ring-1 ring-black/10 dark:ring-white/10 transition-all duration-200 ease-in-out h-7 w-7 bg-[#15803d] dark:bg-[#22c55e] hover:ring-primary/50 hover:scale-105 hover:ring-2"
                  title="benjamintoppold"
                  role="img"
                  aria-label="Avatar for benjamintoppold"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    aria-hidden="true"
                    role="img"
                    className="iconify iconify--lucide h-3.5 w-3.5 shrink-0"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                      <path d="M12 20v-9m2-4a4 4 0 0 1 4 4v3a6 6 0 0 1-12 0v-3a4 4 0 0 1 4-4zm.12-3.12L16 2" />
                      <path d="M21 21a4 4 0 0 0-3.81-4M21 5a4 4 0 0 1-3.55 3.97M22 13h-4M3 21a4 4 0 0 1 3.81-4M3 5a4 4 0 0 0 3.55 3.97M6 13H2M8 2l1.88 1.88M9 7.13V6a3 3 0 1 1 6 0v1.13" />
                    </g>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className={
          "relative flex h-full w-full md:overflow-hidden md:max-h-none max-md:max-h-[calc(100dvh-3rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))]"
        }
      >
        <div className="pointer-events-none absolute left-0 top-0 z-[60] h-full w-auto pb-2.5 pl-[calc(0.5rem_+_1px)] pt-0.5">
          <div
            className="bg-shade-gray-50/50 border-shade-gray-300 relative inset-0 h-full w-full origin-left transform overflow-hidden rounded-bl-lg rounded-tl-lg border-r border-solid backdrop-blur-lg"
            style={{ opacity: 0, width: 0 }}
          />
        </div>
        <div className={"left-0 top-0 z-[99] h-full w-auto pb-2.5 pl-1.5 pt-0.5 relative"}>
          <div
            className={"z-[99] h-full "}
            style={{
              width: "50px",
              height: "100%",
              opacity: 1,
            }}
          >
            <div
              className="flex h-full w-full flex-col items-center overflow-hidden rounded-bl-lg rounded-tl-lg"
              style={{ width: "50px" }}
            >
              <div className="no-scrollbar relative flex h-full flex-col items-center overflow-hidden rounded-bl-lg rounded-tl-lg px-2">
                <div className="relative flex flex-shrink-0 flex-col items-center gap-1.5 overflow-hidden pt-3">
                  <div className="flex flex-shrink-0 flex-col gap-1.5">
                    <a className="flex items-center justify-center" href="/search" data-discover="true">
                      <span
                        className="relative flex cursor-pointer items-center justify-center size-8 p-1 rounded-xl border-0 shadow-none text-textcolor-900 duration-20 transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                        data-state="closed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-search size-5"
                          aria-hidden="true"
                        >
                          <path d="m21 21-4.34-4.34" />
                          <circle cx="11" cy="11" r="8" />
                        </svg>
                      </span>
                    </a>
                    <a className="flex items-center justify-center" href="/recent" data-discover="true">
                      <span
                        className="relative flex cursor-pointer items-center justify-center size-8 p-1 rounded-xl border-0 shadow-none text-textcolor-900 duration-20 transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                        data-state="closed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-clock size-5"
                          aria-hidden="true"
                        >
                          <path d="M12 6v6l4 2" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </span>
                    </a>
                    <a className="flex items-center justify-center" href="/shared" data-discover="true">
                      <span
                        className="relative flex cursor-pointer items-center justify-center size-8 p-1 rounded-xl border-0 shadow-none text-textcolor-900 duration-20 transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                        data-state="closed"
                      >
                        <svg
                          role={"img"}
                          className="size-5"
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
                      </span>
                    </a>
                    <div className="my-2.5 h-px w-full" />
                  </div>
                </div>
                <div
                  className="no-scrollbar w-full flex-1 overflow-auto"
                  style={{
                    flexShrink: 0,
                    minHeight: "120px",
                    scrollBehavior: "smooth",
                    opacity: 1,
                  }}
                >
                  <div className=" mb-3 h-px w-full" />
                  <div>
                    <div className="flex flex-col items-center pb-8">
                      <div data-rbd-droppable-id="spaces" data-rbd-droppable-context-id="0">
                        <div
                          className="mb-3 last:mb-2"
                          data-rbd-draggable-context-id="0"
                          data-rbd-draggable-id="spaces.6320446@Yufy1godJk9Yddwv"
                          tabIndex={0}
                          role="button"
                          aria-describedby="rbd-hidden-text-0-hidden-text-0"
                          data-rbd-drag-handle-draggable-id="spaces.6320446@Yufy1godJk9Yddwv"
                          data-rbd-drag-handle-context-id="0"
                          draggable="false"
                        >
                          <div data-state="closed">
                            <a
                              className="relative flex items-center justify-center [&amp;&gt;*]:transition-[filter,box-shadow] [&amp;&gt;*]:duration-300 [&amp;&gt;*]:ease-out hover:[&amp;&gt;*]:brightness-[1.15]"
                              href="/spaces/Yufy1godJk9Yddwv"
                              data-discover="true"
                            >
                              <StyledAvatar className="flex items-center justify-center rounded-[40%] shadow-sm !size-7 [&amp;&gt;*&gt;*]:!size-7">
                                <div className="flex h-full w-full items-center justify-center [&amp;&gt;*&gt;*]:!bg-transparent [&amp;&gt;*&gt;*]:text-center [&amp;&gt;*]:flex [&amp;&gt;*]:items-center [&amp;&gt;*]:justify-center [&amp;&gt;*]:!bg-transparent !rounded-[40%]">
                                  <div className="sc-dPKAra iuIVrI relative !bg-transparent">
                                    <img src={assetPaths.logo} alt="Workspace" className="sc-fuExOL chHJJg" />
                                  </div>
                                </div>
                              </StyledAvatar>
                            </a>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-x-4 text-sm">
                        <button
                          type={"button"}
                          className="text-textcolor-900 hover:bg-appcolor-300 relative flex cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent p-0 shadow-none transition-colors duration-200 ease-in-out"
                          data-state="closed"
                          style={{
                            width: "32px",
                            height: "32px",
                          }}
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
                              d="M10 4C10.3621 4 10.6557 4.29356 10.6557 4.65568V9.34432H15.3444C15.7064 9.34432 16 9.63788 16 10C16 10.3621 15.7064 10.6557 15.3444 10.6557H10.6557V15.3444C10.6557 15.7064 10.3621 16 10 16C9.6379 16 9.34434 15.7064 9.34434 15.3444V10.6557H4.65568C4.29356 10.6557 4 10.3621 4 10C4 9.63788 4.29356 9.34432 4.65568 9.34432H9.34434V4.65568C9.34434 4.29356 9.6379 4 10 4Z"
                              fillRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className="flex w-full flex-col items-center justify-end border-t border-solid py-3 border-transparent"
                  style={{
                    flexShrink: 99999,
                    minHeight: "0px",
                    flexBasis: "auto",
                    opacity: 1,
                  }}
                >
                  <div className="mt-2 h-px w-full bg-transparent" />
                  <div
                    className="flex flex-col gap-1.5"
                    style={{
                      opacity: 1,
                      height: "auto",
                      transform: "none",
                    }}
                  >
                    <a className="flex items-center justify-center" href="/my-tasks" data-discover="true">
                      <span
                        className="relative flex cursor-pointer items-center justify-center size-8 p-1 rounded-xl border-0 shadow-none text-textcolor-900 duration-20 transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                        data-state="closed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-square-check-big size-5"
                          aria-hidden="true"
                        >
                          <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344" />
                          <path d="m9 11 3 3L22 4" />
                        </svg>
                      </span>
                    </a>
                    <a className="flex items-center justify-center" href="/calendar" data-discover="true">
                      <span
                        className="relative flex cursor-pointer items-center justify-center size-8 p-1 rounded-xl border-0 shadow-none text-textcolor-900 duration-20 transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                        data-state="closed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-calendar size-5"
                          aria-hidden="true"
                        >
                          <path d="M8 2v4" />
                          <path d="M16 2v4" />
                          <rect width="18" height="18" x="3" y="4" rx="2" />
                          <path d="M3 10h18" />
                        </svg>
                      </span>
                    </a>
                    <a className="flex items-center justify-center" href="/lists/starred" data-discover="true">
                      <span
                        className="relative flex cursor-pointer items-center justify-center size-8 p-1 rounded-xl border-0 shadow-none text-textcolor-900 duration-20 transition ease-in-out hover:bg-appcolor-300 bg-transparent"
                        data-state="closed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-star size-5"
                          aria-hidden="true"
                        >
                          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                        </svg>
                      </span>
                    </a>
                    <button
                      type={"button"}
                      className="text-textcolor-900 hover:bg-appcolor-200 relative flex cursor-pointer items-center justify-center rounded-xl border-0 p-0 shadow-none transition-colors duration-200 ease-in-out"
                      data-state="closed"
                      style={{
                        width: "32px",
                        height: "32px",
                      }}
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
                          d="M0 8.45089C0 3.7836 3.7836 0 8.45089 0C13.1182 0 16.9018 3.7836 16.9018 8.45089C16.9018 8.86511 16.566 9.20089 16.1518 9.20089C15.7376 9.20089 15.4018 8.86511 15.4018 8.45089C15.4018 4.61202 12.2898 1.5 8.45089 1.5C4.61202 1.5 1.5 4.61202 1.5 8.45089C1.5 12.2898 4.61202 15.4018 8.45089 15.4018C8.86511 15.4018 9.20089 15.7376 9.20089 16.1518C9.20089 16.566 8.86511 16.9018 8.45089 16.9018C3.7836 16.9018 0 13.1182 0 8.45089Z"
                          fillRule="evenodd"
                        />
                        <path
                          d="M12.3764 5.19951C12.6998 5.45827 12.7522 5.93024 12.4935 6.25369L7.75447 12.1774C7.50141 12.4938 7.04289 12.552 6.71882 12.3089L4.34931 10.5318C4.01794 10.2833 3.95079 9.81316 4.19931 9.48179C4.44784 9.15042 4.91794 9.08326 5.24931 9.33179L7.03728 10.6728L11.3222 5.31664C11.5809 4.9932 12.0529 4.94076 12.3764 5.19951Z"
                          fillRule="evenodd"
                        />
                        <path
                          d="M14.7827 10.2679C15.197 10.2679 15.5327 10.6036 15.5327 11.0179V18.5476C15.5327 18.9618 15.197 19.2976 14.7827 19.2976C14.3685 19.2976 14.0327 18.9618 14.0327 18.5476V11.0179C14.0327 10.6036 14.3685 10.2679 14.7827 10.2679Z"
                          fillRule="evenodd"
                        />
                        <path
                          d="M10.2677 14.7831C10.2677 14.3689 10.6035 14.0331 11.0177 14.0331H18.5475C18.9617 14.0331 19.2975 14.3689 19.2975 14.7831C19.2975 15.1973 18.9617 15.5331 18.5475 15.5331H11.0177C10.6035 15.5331 10.2677 15.1973 10.2677 14.7831Z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </button>
                    <div className="border-appcolor-200/30 mt-1 border-t pt-1">
                      <button
                        type={"button"}
                        className="relative flex size-8 cursor-pointer items-center justify-center rounded-xl border-0 p-0 shadow-none text-textcolor-400 transition-all duration-150 ease-out hover:bg-appcolor-200 hover:text-textcolor-600 hover:scale-105"
                        aria-label="Hide quick views"
                        data-state="closed"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-up size-4"
                          aria-hidden="true"
                        >
                          <path d="m18 15-6-6-6 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 h-px w-full bg-transparent" />
                  <div className="flex flex-col gap-1.5">
                    <button
                      className="text-textcolor-900 hover:bg-appcolor-200 relative flex size-8 cursor-pointer items-center justify-center rounded-xl border-0 p-0 shadow-none transition-colors duration-200 ease-in-out"
                      type="button"
                      aria-expanded="false"
                      aria-haspopup="dialog"
                      tabIndex={0}
                      aria-label="What's new"
                      data-state="closed"
                    >
                      <svg
                        role={"img"}
                        className="size-5"
                        fill="currentColor"
                        height="20"
                        strokeWidth="0"
                        width="20"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.3498 1.86777C14.2767 1.86416 14.159 1.89958 13.9253 2.04428L13.9253 2.0443L2.91728 8.85923C1.10077 9.98381 1.8213 12.6728 3.95672 12.7385L4.83454 12.7655C4.88396 12.761 4.93438 12.7624 4.98483 12.7701L11.9313 12.9837C11.969 12.9815 12.0063 12.9827 12.0429 12.9871L16.8974 13.1364C17.1721 13.1448 17.2918 13.1167 17.3534 13.077C17.5279 12.9644 17.6999 12.7492 17.8361 12.3799C17.972 12.0115 18.0561 11.5312 18.0807 10.9587C18.1298 9.81411 17.9371 8.40153 17.5651 7.01322C17.1931 5.62492 16.6537 4.30522 16.0389 3.3386C15.7313 2.85507 15.4183 2.48116 15.1164 2.23008C14.8138 1.97832 14.5572 1.87801 14.3498 1.86777ZM12.673 14.2571L16.859 14.3858L16.859 14.3858C17.148 14.3947 17.6185 14.3934 18.0308 14.1275L18.0309 14.1274C18.5059 13.821 18.8141 13.3404 19.0088 12.8125C19.2039 12.2836 19.3015 11.665 19.3295 11.0123C19.3856 9.70625 19.1672 8.1625 18.7725 6.6897C18.3779 5.21691 17.7952 3.77074 17.0936 2.66773C16.743 2.11644 16.3492 1.62958 15.9158 1.26907C15.4832 0.909249 14.976 0.647156 14.4114 0.619289C13.9212 0.595098 13.5131 0.829318 13.2673 0.981508L2.2593 7.79642C-0.610354 9.573 0.544809 13.8842 3.9183 13.9879L4.11185 13.9938C4.04834 14.4962 4.07871 15.017 4.21706 15.5333C4.81611 17.769 7.17785 19.0292 9.44908 18.4206C11.3971 17.8987 12.7145 16.1543 12.673 14.2571ZM11.4203 14.2186L5.36947 14.0325C5.30424 14.4157 5.31861 14.8147 5.42447 15.2098C5.83115 16.7276 7.46892 17.6571 9.12556 17.2132C10.5677 16.8268 11.478 15.5447 11.4203 14.2186Z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      className="text-textcolor-900 hover:bg-appcolor-200 z-51 relative flex size-8 cursor-pointer items-center justify-center rounded-xl border-0 p-0 shadow-none transition-colors duration-200 ease-in-out"
                      type="button"
                      id="radix-:rf:"
                      aria-haspopup="menu"
                      aria-expanded="false"
                      data-state="closed"
                    >
                      <svg
                        role={"img"}
                        className="size-5"
                        fill="currentColor"
                        height="20"
                        strokeWidth="0"
                        width="20"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 2.39C5.79719 2.39 2.39012 5.79706 2.39012 9.99989C2.39012 14.2027 5.79719 17.6098 10 17.6098C14.2028 17.6098 17.6099 14.2027 17.6099 9.99989C17.6099 5.79706 14.2028 2.39 10 2.39ZM0.943237 9.99989C0.943237 4.99797 4.99809 0.943115 10 0.943115C15.0019 0.943115 19.0568 4.99797 19.0568 9.99989C19.0568 15.0018 15.0019 19.0567 10 19.0567C4.99809 19.0567 0.943237 15.0018 0.943237 9.99989ZM10.2337 6.57851C9.82018 6.50759 9.39491 6.58529 9.0332 6.79787C8.67149 7.01045 8.39669 7.34418 8.25746 7.73996C8.12488 8.11687 7.71185 8.31493 7.33494 8.18234C6.95804 8.04975 6.75998 7.63673 6.89256 7.25982C7.14518 6.54171 7.64379 5.93618 8.30009 5.55047C8.95638 5.16475 9.72801 5.02376 10.4783 5.15245C11.2286 5.28115 11.9091 5.67123 12.3994 6.2536C12.8895 6.8358 13.1578 7.57263 13.1568 8.33364C13.1566 9.55079 12.2533 10.3644 11.5846 10.8102C11.2283 11.0477 10.8771 11.2228 10.6178 11.3381C10.4871 11.3961 10.3772 11.4401 10.2983 11.4702C10.2588 11.4853 10.2269 11.4969 10.2038 11.5051L10.1759 11.5149L10.1672 11.5178L10.1642 11.5188L10.163 11.5192L10.1626 11.5194C10.1623 11.5195 10.1621 11.5195 9.93335 10.8332L10.1621 11.5195C9.78308 11.6459 9.37338 11.441 9.24703 11.062C9.12084 10.6834 9.32502 10.2743 9.70316 10.1474C9.70325 10.1473 9.70333 10.1473 9.70341 10.1473C9.70348 10.1473 9.70354 10.1473 9.70361 10.1472C9.7037 10.1472 9.70379 10.1472 9.70388 10.1471C9.70395 10.1471 9.70401 10.1471 9.70408 10.1471C9.70412 10.1471 9.70416 10.147 9.7042 10.147C9.70432 10.147 9.70445 10.1469 9.70457 10.1469L9.70514 10.1467L9.71906 10.1418C9.7326 10.137 9.75439 10.1291 9.78323 10.1181C9.84102 10.0961 9.92644 10.062 10.0302 10.0159C10.2396 9.92278 10.5134 9.78537 10.7821 9.60628C11.3634 9.21875 11.7099 8.78251 11.7099 8.33322L11.7099 8.33215C11.7105 7.9126 11.5627 7.50636 11.2925 7.1854C11.0223 6.86443 10.6472 6.64944 10.2337 6.57851ZM13.1568 8.33364C13.1568 8.33386 13.1568 8.33408 13.1568 8.3343L12.4333 8.33322H13.1568C13.1568 8.33336 13.1568 8.3335 13.1568 8.33364ZM9.27657 14.1666C9.27657 13.767 9.60047 13.4431 10 13.4431H10.0083C10.4079 13.4431 10.7318 13.767 10.7318 14.1666C10.7318 14.5661 10.4079 14.89 10.0083 14.89H10C9.60047 14.89 9.27657 14.5661 9.27657 14.1666Z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      type={"button"}
                      className="text-textcolor-900 hover:bg-appcolor-200 relative flex size-8 cursor-pointer items-center justify-center rounded-xl border-0 p-0 shadow-none transition-colors duration-200 ease-in-out"
                      data-state="closed"
                    >
                      <svg
                        role={"img"}
                        className="size-5"
                        fill="currentColor"
                        height="20"
                        strokeWidth="0"
                        width="20"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10.667 1.85729C10.3076 1.49791 9.69241 1.49791 9.33304 1.85729C9.1973 1.99303 9.15138 2.13582 9.11013 2.46021C9.10618 2.49129 9.1023 2.52556 9.09811 2.56261C9.06339 2.86956 9.00708 3.36734 8.70791 3.81908C8.2256 4.54737 7.30719 4.87676 6.50377 4.73109C6.03952 4.64691 5.71651 4.40191 5.50436 4.23172C5.46874 4.20314 5.43645 4.17704 5.40689 4.15315C5.2356 4.01469 5.15576 3.95016 5.0487 3.90578C4.30066 3.59569 3.50477 4.39157 3.81486 5.13961C3.85925 5.24667 3.92378 5.32651 4.06223 5.4978C4.08613 5.52736 4.11223 5.55965 4.14081 5.59528C4.31099 5.80742 4.556 6.13044 4.64017 6.59469C4.78831 7.41169 4.43916 8.27326 3.76361 8.75643C3.3221 9.07221 2.82756 9.14207 2.52219 9.1852C2.48919 9.18986 2.45841 9.19421 2.43013 9.19852C2.10157 9.24865 1.96092 9.29607 1.83304 9.42395C1.47367 9.78333 1.47367 10.3985 1.83304 10.7579C1.96878 10.8936 2.11158 10.9395 2.43596 10.9808C2.46704 10.9847 2.50131 10.9886 2.53836 10.9928C2.84531 11.0275 3.34309 11.0838 3.79484 11.383C4.48851 11.8424 4.85532 12.7016 4.70684 13.5205C4.62266 13.9847 4.37766 14.3077 4.20747 14.5199C4.17889 14.5555 4.15279 14.5878 4.1289 14.6174C3.99045 14.7886 3.92591 14.8685 3.88153 14.9755C3.83406 15.0901 3.80963 15.2128 3.80963 15.3367C3.80963 15.9895 4.51291 16.4591 5.11536 16.2094C5.22243 16.165 5.30226 16.1005 5.47355 15.962C5.50312 15.9381 5.53541 15.912 5.57103 15.8834C5.78318 15.7132 6.10619 15.4682 6.57044 15.3841C7.38744 15.2359 8.24901 15.5851 8.73218 16.2606C9.04797 16.7021 9.11782 17.1967 9.16095 17.5021C9.16562 17.5351 9.16996 17.5658 9.17428 17.5941C9.2244 17.9227 9.27183 18.0633 9.39971 18.1912C9.5766 18.3681 9.81651 18.4675 10.0667 18.4675C10.3168 18.4675 10.5567 18.3681 10.7336 18.1912C10.8694 18.0555 10.9153 17.9127 10.9565 17.5883C10.9605 17.5572 10.9644 17.5229 10.9686 17.4859C11.0033 17.1789 11.0596 16.6812 11.3588 16.2294C11.8181 15.5357 12.6774 15.1689 13.4962 15.3174C13.9605 15.4016 14.2835 15.6466 14.4956 15.8168C14.5313 15.8453 14.5635 15.8714 14.5931 15.8953C14.7644 16.0338 14.8442 16.0983 14.9513 16.1427C15.6993 16.4528 16.4952 15.6569 16.1851 14.9089C16.1408 14.8018 16.0762 14.722 15.9378 14.5507C15.9139 14.5211 15.8878 14.4888 15.8592 14.4532C15.689 14.2411 15.444 13.9181 15.3598 13.4538C15.2113 12.6349 15.5782 11.7757 16.2718 11.3163C16.7084 11.0272 17.1889 10.965 17.4854 10.9266C17.5217 10.9219 17.5553 10.9175 17.5857 10.9132C17.8984 10.8682 18.0364 10.8217 18.167 10.6912C18.5263 10.3318 18.5263 9.71666 18.167 9.35729C18.0312 9.22154 17.8884 9.17562 17.564 9.13438C17.533 9.13042 17.4987 9.12655 17.4616 9.12236C17.1547 9.08763 16.6569 9.03132 16.2052 8.73216C15.4769 8.24985 15.1475 7.33144 15.2932 6.52802C15.3773 6.06377 15.6223 5.74076 15.7925 5.52861C15.8211 5.49298 15.8472 5.46069 15.8711 5.43113C16.0096 5.25984 16.0741 5.18001 16.1185 5.07294C16.4286 4.32491 15.6327 3.52902 14.8846 3.83911C14.7776 3.88349 14.6977 3.94803 14.5264 4.08648C14.4969 4.11037 14.4646 4.13647 14.429 4.16505C14.2168 4.33524 13.8938 4.58024 13.4296 4.66442C12.6107 4.8129 11.7515 4.44609 11.2921 3.75242C11.003 3.31587 10.9407 2.83533 10.9023 2.53887C10.8976 2.50252 10.8933 2.46892 10.8889 2.43852C10.844 2.12583 10.7975 1.98783 10.667 1.85729ZM8.30994 0.834183C9.23435 -0.0902355 10.7656 -0.0902354 11.6901 0.834183C12.1689 1.31305 12.2669 1.85571 12.3211 2.23281C12.3257 2.26465 12.33 2.29495 12.3341 2.32383C12.3831 2.66807 12.4032 2.80976 12.4984 2.95352C12.6386 3.16511 12.9219 3.28598 13.1714 3.24075C13.2591 3.22486 13.3433 3.18107 13.5236 3.03645C13.5431 3.02079 13.5649 3.00278 13.589 2.98295C13.7504 2.84988 14.0111 2.63494 14.3306 2.50252C16.2697 1.69865 18.2589 3.68784 17.4551 5.62701C17.3226 5.94646 17.1077 6.20717 16.9746 6.36858C16.9548 6.39264 16.9368 6.41449 16.9211 6.434C16.7765 6.61428 16.7327 6.69852 16.7168 6.78616C16.6644 7.07528 16.8029 7.39259 17.0041 7.52582C17.1526 7.62419 17.2995 7.6427 17.6596 7.68806C17.6873 7.69155 17.7162 7.69519 17.7466 7.69905C18.1352 7.74846 18.6962 7.84031 19.1901 8.33418C20.1145 9.2586 20.1145 10.7899 19.1901 11.7143C18.7112 12.1932 18.1685 12.2912 17.7914 12.3453C17.7596 12.3499 17.7293 12.3542 17.7004 12.3583C17.3562 12.4073 17.2145 12.4275 17.0707 12.5227C16.8591 12.6628 16.7383 12.9462 16.7835 13.1957C16.7994 13.2833 16.8432 13.3675 16.9878 13.5478C17.0035 13.5673 17.0215 13.5892 17.0413 13.6132C17.1744 13.7746 17.3893 14.0354 17.5217 14.3548C18.3256 16.294 16.3364 18.2832 14.3972 17.4793C14.0778 17.3469 13.8171 17.1319 13.6557 16.9989C13.6316 16.979 13.6098 16.961 13.5902 16.9454C13.41 16.8008 13.3257 16.757 13.2381 16.7411C12.9886 16.6958 12.7052 16.8167 12.5651 17.0283C12.4667 17.1768 12.4482 17.3237 12.4029 17.6839C12.3994 17.7115 12.3957 17.7405 12.3919 17.7708C12.3424 18.1594 12.2506 18.7204 11.7567 19.2143C11.3085 19.6625 10.7006 19.9144 10.0667 19.9144C9.43277 19.9144 8.82484 19.6625 8.3766 19.2143C7.89785 18.7356 7.8006 18.1837 7.74394 17.8123L7.73877 17.7784C7.68015 17.3938 7.65752 17.2452 7.55533 17.1024C7.39784 16.8822 7.09519 16.7594 6.82858 16.8077C6.74094 16.8236 6.6567 16.8674 6.47642 17.012C6.45691 17.0277 6.43506 17.0457 6.41101 17.0655C6.2496 17.1986 5.98889 17.4135 5.66944 17.546C4.11362 18.1909 2.36274 17.0201 2.36274 15.3367C2.36274 15.0226 2.42465 14.7116 2.54494 14.4215C2.67736 14.102 2.8923 13.8413 3.02537 13.6799C3.0452 13.6559 3.06322 13.634 3.07887 13.6145C3.2235 13.4342 3.26728 13.35 3.28317 13.2623C3.3284 13.0128 3.20753 12.7295 2.99594 12.5893C2.8474 12.491 2.70051 12.4725 2.34039 12.4271C2.3127 12.4236 2.28375 12.42 2.25344 12.4161C1.86485 12.3667 1.30381 12.2748 0.809937 11.781C-0.114482 10.8566 -0.114482 9.32527 0.809937 8.40085C1.28869 7.9221 1.84056 7.82484 2.21192 7.76819C2.22343 7.76643 2.23474 7.76471 2.24586 7.76301C2.63048 7.7044 2.77901 7.68176 2.92189 7.57958C3.14209 7.42208 3.26484 7.11943 3.2165 6.85282C3.20061 6.76519 3.15683 6.68095 3.0122 6.50066C2.99655 6.48115 2.97853 6.45931 2.9587 6.43525C2.82563 6.27384 2.61069 6.01313 2.47827 5.69368C1.67441 3.75451 3.6636 1.76532 5.60277 2.56918C5.92222 2.70161 6.18293 2.91654 6.34434 3.04962C6.36839 3.06945 6.39024 3.08746 6.40975 3.10311C6.59004 3.24774 6.67428 3.29152 6.76191 3.30741C7.05103 3.35984 7.36835 3.22136 7.50157 3.02018C7.59995 2.87164 7.61845 2.72475 7.66381 2.36464C7.6673 2.33695 7.67095 2.308 7.6748 2.27769C7.72422 1.88909 7.81606 1.32806 8.30994 0.834183ZM10 8.22338C9.01883 8.22338 8.22344 9.01877 8.22344 9.99994C8.22344 10.9811 9.01883 11.7765 10 11.7765C10.9812 11.7765 11.7766 10.9811 11.7766 9.99994C11.7766 9.01877 10.9812 8.22338 10 8.22338ZM6.77656 9.99994C6.77656 8.21968 8.21974 6.7765 10 6.7765C11.7803 6.7765 13.2234 8.21968 13.2234 9.99994C13.2234 11.7802 11.7803 13.2234 10 13.2234C8.21974 13.2234 6.77656 11.7802 6.77656 9.99994Z"
                          fillRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={"relative flex h-full w-full flex-1 overflow-hidden px-2 pb-2"}>
          <div id={"secondary-panel-desktop-portal-root"} className={"contents"} />
          <div id="app-header-portal-root" className="relative" />
          <div className={"z-1 border-shade-gray-300 relative flex flex-1 flex-col overflow-clip rounded-xl border"}>
            <div className="header-panel-orb-backdrop">
              <div className="header-panel-orb-primary" />
              <div className="header-panel-orb-secondary" />
            </div>
            <div className={"relative flex min-h-0 w-full flex-1 overflow-hidden"}>
              <div className={"overflow-hidden relative h-full"} style={{ width: "auto" }}>
                <div className={"space-step2 relative flex h-full border-appcolor-300"} style={{ opacity: 1 }}>
                  <div className="relative h-full overflow-hidden border-r" style={{ width: "200px", opacity: 1 }}>
                    <div className="orb-backdrop !z-0">
                      <div className="orb-primary" />
                      <div className="orb-secondary" />
                    </div>
                    <div
                      className={"absolute left-0 top-0 flex h-full w-full flex-col overflow-auto"}
                      style={{
                        width: "280px",
                        opacity: 1,
                        transform: "none",
                      }}
                    >
                      <div className={"px-2 py-3"}>
                        <div className={"flex flex-col"}>
                          <div className="block sm:hidden">
                            <button
                              type={"button"}
                              className="liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out group w-full justify-between liquid-nav-item-dark selected text-textcolor-1000 font-medium"
                            >
                              <div className="flex items-center gap-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-user h-5 w-5"
                                  aria-hidden="true"
                                >
                                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                                General
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down h-4 w-4 transition-transform duration-200 ease-in-out group-hover:scale-105"
                                aria-hidden="true"
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                            <div className="overflow-hidden transition-all duration-300 ease-in-out max-h-96 opacity-100">
                              <div className="bg-appcolor-50/40 dark:bg-appcolor-100/40 ml-1 space-y-0.5 rounded-lg border-0 p-1.5 shadow-sm backdrop-blur-md">
                                <a
                                  aria-current="page"
                                  className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4 liquid-nav-item-dark selected text-textcolor-900 font-medium"
                                  href="/settings"
                                  data-discover="true"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-user h-4 w-4"
                                    aria-hidden="true"
                                  >
                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                  </svg>
                                  Account
                                </a>
                                <a
                                  className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4"
                                  href="/settings/password"
                                  data-discover="true"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-key h-4 w-4"
                                    aria-hidden="true"
                                  >
                                    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4" />
                                    <path d="m21 2-9.6 9.6" />
                                    <circle cx="7.5" cy="15.5" r="5.5" />
                                  </svg>
                                  Password
                                </a>
                                <a
                                  className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4"
                                  href="/settings/sso"
                                  data-discover="true"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-link h-4 w-4"
                                    aria-hidden="true"
                                  >
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                  </svg>
                                  Connected Accounts
                                </a>
                                <a
                                  className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4"
                                  href="/settings/sessions"
                                  data-discover="true"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="lucide lucide-shield h-4 w-4"
                                    aria-hidden="true"
                                  >
                                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                                  </svg>
                                  Sessions
                                </a>
                              </div>
                            </div>
                          </div>
                          <a
                            aria-current="page"
                            className="liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out hidden sm:flex liquid-nav-item-dark selected text-textcolor-1000 font-medium active"
                            href="/settings"
                            data-discover="true"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-user h-5 w-5"
                              aria-hidden="true"
                            >
                              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            General
                          </a>
                          <a
                            className="liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out"
                            href="/settings/plans"
                            data-discover="true"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-rocket h-5 w-5"
                              aria-hidden="true"
                            >
                              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                            </svg>
                            Plans
                          </a>
                          <a
                            className="liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out"
                            href="/settings/usage"
                            data-discover="true"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-chart-no-axes-combined h-5 w-5"
                              aria-hidden="true"
                            >
                              <path d="M12 16v5" />
                              <path d="M16 14v7" />
                              <path d="M20 10v11" />
                              <path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15" />
                              <path d="M4 18v3" />
                              <path d="M8 14v7" />
                            </svg>
                            Usage &amp; Billing
                          </a>
                          <a
                            className="liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out"
                            href="/settings/credits"
                            data-discover="true"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-gift h-5 w-5"
                              aria-hidden="true"
                            >
                              <rect x="3" y="8" width="18" height="4" rx="1" />
                              <path d="M12 8v13" />
                              <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                              <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                            </svg>
                            Credits &amp; Rewards
                          </a>
                          <div>
                            <button
                              type="button"
                              className="liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out group w-full justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-plug h-5 w-5"
                                  aria-hidden="true"
                                >
                                  <path d="M12 22v-5" />
                                  <path d="M9 8V2" />
                                  <path d="M15 8V2" />
                                  <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
                                </svg>
                                Integrations
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down h-4 w-4 transition-transform duration-200 ease-in-out group-hover:scale-105"
                                aria-hidden="true"
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                            {/*<div className="overflow-hidden transition-all duration-300 ease-in-out max-h-96 opacity-100">*/}
                            {/*  <div className="bg-appcolor-50/40 dark:bg-appcolor-100/40 ml-1 space-y-0.5 rounded-lg border-0 p-1.5 shadow-sm backdrop-blur-md">*/}
                            {/*    <a*/}
                            {/*      className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4"*/}
                            {/*      href="/settings/integrations/calendar-feed"*/}
                            {/*      data-discover="true"*/}
                            {/*    >*/}
                            {/*      <svg*/}
                            {/*        xmlns="http://www.w3.org/2000/svg"*/}
                            {/*        width="24"*/}
                            {/*        height="24"*/}
                            {/*        viewBox="0 0 24 24"*/}
                            {/*        fill="none"*/}
                            {/*        stroke="currentColor"*/}
                            {/*        strokeWidth="2"*/}
                            {/*        strokeLinecap="round"*/}
                            {/*        strokeLinejoin="round"*/}
                            {/*        className="lucide lucide-calendar h-4 w-4"*/}
                            {/*        aria-hidden="true"*/}
                            {/*      >*/}
                            {/*        <path d="M8 2v4"/>*/}
                            {/*        <path d="M16 2v4"/>*/}
                            {/*        <rect*/}
                            {/*          width="18"*/}
                            {/*          height="18"*/}
                            {/*          x="3"*/}
                            {/*          y="4"*/}
                            {/*          rx="2"*/}
                            {/*        />*/}
                            {/*        <path d="M3 10h18"/>*/}
                            {/*      </svg>*/}
                            {/*      Calendar Feed</a>*/}
                            {/*    <a*/}
                            {/*      className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4"*/}
                            {/*      href="/settings/integrations/google-calendar"*/}
                            {/*      data-discover="true"*/}
                            {/*    >*/}
                            {/*      <svg*/}
                            {/*        xmlns="http://www.w3.org/2000/svg"*/}
                            {/*        width="24"*/}
                            {/*        height="24"*/}
                            {/*        viewBox="0 0 24 24"*/}
                            {/*        fill="none"*/}
                            {/*        stroke="currentColor"*/}
                            {/*        strokeWidth="2"*/}
                            {/*        strokeLinecap="round"*/}
                            {/*        strokeLinejoin="round"*/}
                            {/*        className="lucide lucide-calendar h-4 w-4"*/}
                            {/*        aria-hidden="true"*/}
                            {/*      >*/}
                            {/*        <path d="M8 2v4"/>*/}
                            {/*        <path d="M16 2v4"/>*/}
                            {/*        <rect*/}
                            {/*          width="18"*/}
                            {/*          height="18"*/}
                            {/*          x="3"*/}
                            {/*          y="4"*/}
                            {/*          rx="2"*/}
                            {/*        />*/}
                            {/*        <path d="M3 10h18"/>*/}
                            {/*      </svg>*/}
                            {/*      Google Calendar</a>*/}
                            {/*    <a*/}
                            {/*      className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4"*/}
                            {/*      href="/settings/integrations/zapier"*/}
                            {/*      data-discover="true"*/}
                            {/*    >*/}
                            {/*      <svg*/}
                            {/*        xmlns="http://www.w3.org/2000/svg"*/}
                            {/*        width="24"*/}
                            {/*        height="24"*/}
                            {/*        viewBox="0 0 24 24"*/}
                            {/*        fill="none"*/}
                            {/*        stroke="currentColor"*/}
                            {/*        strokeWidth="2"*/}
                            {/*        strokeLinecap="round"*/}
                            {/*        strokeLinejoin="round"*/}
                            {/*        className="lucide lucide-zap h-4 w-4"*/}
                            {/*        aria-hidden="true"*/}
                            {/*      >*/}
                            {/*        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>*/}
                            {/*      </svg>*/}
                            {/*      Zapier</a>*/}
                            {/*    <a*/}
                            {/*      className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4 text-textcolor-500 hover:text-textcolor-700 opacity-80"*/}
                            {/*      href="https://help.taskade.com/en/articles/8958467-getting-started-with-automation"*/}
                            {/*      target="_blank"*/}
                            {/*      rel="noreferrer nofollower"*/}
                            {/*    >*/}
                            {/*      <svg*/}
                            {/*        xmlns="http://www.w3.org/2000/svg"*/}
                            {/*        width="24"*/}
                            {/*        height="24"*/}
                            {/*        viewBox="0 0 24 24"*/}
                            {/*        fill="none"*/}
                            {/*        stroke="currentColor"*/}
                            {/*        strokeWidth="2"*/}
                            {/*        strokeLinecap="round"*/}
                            {/*        strokeLinejoin="round"*/}
                            {/*        className="lucide lucide-workflow h-4 w-4"*/}
                            {/*        aria-hidden="true"*/}
                            {/*      >*/}
                            {/*        <rect*/}
                            {/*          width="8"*/}
                            {/*          height="8"*/}
                            {/*          x="3"*/}
                            {/*          y="3"*/}
                            {/*          rx="2"*/}
                            {/*        />*/}
                            {/*        <path d="M7 11v4a2 2 0 0 0 2 2h4"/>*/}
                            {/*        <rect*/}
                            {/*          width="8"*/}
                            {/*          height="8"*/}
                            {/*          x="13"*/}
                            {/*          y="13"*/}
                            {/*          rx="2"*/}
                            {/*        />*/}
                            {/*      </svg>*/}
                            {/*      Automation</a><a*/}
                            {/*    className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4 text-textcolor-500 hover:text-textcolor-700 opacity-80"*/}
                            {/*    href="https://help.taskade.com/en/articles/8958457-custom-ai-agents"*/}
                            {/*    target="_blank"*/}
                            {/*    rel="noreferrer nofollower"*/}
                            {/*  >*/}
                            {/*    <svg*/}
                            {/*      xmlns="http://www.w3.org/2000/svg"*/}
                            {/*      width="24"*/}
                            {/*      height="24"*/}
                            {/*      viewBox="0 0 24 24"*/}
                            {/*      fill="none"*/}
                            {/*      stroke="currentColor"*/}
                            {/*      strokeWidth="2"*/}
                            {/*      strokeLinecap="round"*/}
                            {/*      strokeLinejoin="round"*/}
                            {/*      className="lucide lucide-bot h-4 w-4"*/}
                            {/*      aria-hidden="true"*/}
                            {/*    >*/}
                            {/*      <path d="M12 8V4H8"/>*/}
                            {/*      <rect*/}
                            {/*        width="16"*/}
                            {/*        height="12"*/}
                            {/*        x="4"*/}
                            {/*        y="8"*/}
                            {/*        rx="2"*/}
                            {/*      />*/}
                            {/*      <path d="M2 14h2"/>*/}
                            {/*      <path d="M20 14h2"/>*/}
                            {/*      <path d="M15 13v2"/>*/}
                            {/*      <path d="M9 13v2"/>*/}
                            {/*    </svg>*/}
                            {/*    AI Agents</a><a*/}
                            {/*    className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4 text-textcolor-500 hover:text-textcolor-700 opacity-80"*/}
                            {/*    href="/integrations"*/}
                            {/*    target="_blank"*/}
                            {/*    rel="noreferrer nofollower"*/}
                            {/*  >*/}
                            {/*    <svg*/}
                            {/*      xmlns="http://www.w3.org/2000/svg"*/}
                            {/*      width="24"*/}
                            {/*      height="24"*/}
                            {/*      viewBox="0 0 24 24"*/}
                            {/*      fill="none"*/}
                            {/*      stroke="currentColor"*/}
                            {/*      strokeWidth="2"*/}
                            {/*      strokeLinecap="round"*/}
                            {/*      strokeLinejoin="round"*/}
                            {/*      className="lucide lucide-external-link h-4 w-4"*/}
                            {/*      aria-hidden="true"*/}
                            {/*    >*/}
                            {/*      <path d="M15 3h6v6"/>*/}
                            {/*      <path d="M10 14 21 3"/>*/}
                            {/*      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>*/}
                            {/*    </svg>*/}
                            {/*    View All</a></div>*/}
                            {/*</div>*/}
                          </div>
                          <a
                            className="liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out"
                            href="/settings/notifications"
                            data-discover="true"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-bell h-5 w-5"
                              aria-hidden="true"
                            >
                              <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                              <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                            </svg>
                            Notifications
                          </a>
                          <a
                            className="liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out"
                            href="/settings/archives"
                            data-discover="true"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-archive h-5 w-5"
                              aria-hidden="true"
                            >
                              <rect width="20" height="5" x="2" y="3" rx="1" />
                              <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                              <path d="M10 12h4" />
                            </svg>
                            Archives
                          </a>
                          <div>
                            <button
                              type={"button"}
                              className="liquid-nav-item-dark flex min-h-8 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-textcolor-700 hover:text-textcolor-900 transition-all duration-200 ease-in-out group w-full justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-settings h-5 w-5"
                                  aria-hidden="true"
                                >
                                  <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                                Manage
                              </div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-chevron-down h-4 w-4 transition-transform duration-200 ease-in-out group-hover:scale-105"
                                aria-hidden="true"
                              >
                                <path d="m6 9 6 6 6-6" />
                              </svg>
                            </button>
                            {/*<div className="overflow-hidden transition-all duration-300 ease-in-out max-h-96 opacity-100">*/}
                            {/*  <div className="bg-appcolor-50/40 dark:bg-appcolor-100/40 ml-1 space-y-0.5 rounded-lg border-0 p-1.5 shadow-sm backdrop-blur-md">*/}
                            {/*    <a*/}
                            {/*      className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4"*/}
                            {/*      href="/settings/manage"*/}
                            {/*      data-discover="true"*/}
                            {/*    >*/}
                            {/*      <svg*/}
                            {/*        xmlns="http://www.w3.org/2000/svg"*/}
                            {/*        width="24"*/}
                            {/*        height="24"*/}
                            {/*        viewBox="0 0 24 24"*/}
                            {/*        fill="none"*/}
                            {/*        stroke="currentColor"*/}
                            {/*        strokeWidth="2"*/}
                            {/*        strokeLinecap="round"*/}
                            {/*        strokeLinejoin="round"*/}
                            {/*        className="lucide lucide-building h-4 w-4"*/}
                            {/*        aria-hidden="true"*/}
                            {/*      >*/}
                            {/*        <path d="M12 10h.01"/>*/}
                            {/*        <path d="M12 14h.01"/>*/}
                            {/*        <path d="M12 6h.01"/>*/}
                            {/*        <path d="M16 10h.01"/>*/}
                            {/*        <path d="M16 14h.01"/>*/}
                            {/*        <path d="M16 6h.01"/>*/}
                            {/*        <path d="M8 10h.01"/>*/}
                            {/*        <path d="M8 14h.01"/>*/}
                            {/*        <path d="M8 6h.01"/>*/}
                            {/*        <path d="M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>*/}
                            {/*        <rect*/}
                            {/*          x="4"*/}
                            {/*          y="2"*/}
                            {/*          width="16"*/}
                            {/*          height="20"*/}
                            {/*          rx="2"*/}
                            {/*        />*/}
                            {/*      </svg>*/}
                            {/*      Workspaces</a>*/}
                            {/*    <a*/}
                            {/*      className="liquid-nav-item-dark flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-textcolor-600 hover:text-textcolor-800 transition-all duration-200 ease-in-out ml-4"*/}
                            {/*      href="/settings/activate"*/}
                            {/*      data-discover="true"*/}
                            {/*    >*/}
                            {/*      <svg*/}
                            {/*        xmlns="http://www.w3.org/2000/svg"*/}
                            {/*        width="24"*/}
                            {/*        height="24"*/}
                            {/*        viewBox="0 0 24 24"*/}
                            {/*        fill="none"*/}
                            {/*        stroke="currentColor"*/}
                            {/*        strokeWidth="2"*/}
                            {/*        strokeLinecap="round"*/}
                            {/*        strokeLinejoin="round"*/}
                            {/*        className="lucide lucide-rocket h-4 w-4"*/}
                            {/*        aria-hidden="true"*/}
                            {/*      >*/}
                            {/*        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>*/}
                            {/*        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>*/}
                            {/*        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>*/}
                            {/*        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>*/}
                            {/*      </svg>*/}
                            {/*      Activate</a></div>*/}
                            {/*</div>*/}
                          </div>
                          <div className="flex flex-col">
                            <div className="styled__OverlineTitle-sc-1223950e-1 gWupuW">
                              <a className="" href="/settings/manage" data-discover="true">
                                Workspace Settings
                              </a>
                            </div>
                            <a
                              className="liquid-nav-item-dark text-appcolor-800 relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-1 text-sm transition-all duration-200 ease-in-out"
                              href="/settings/manage/Yufy1godJk9Yddwv"
                              data-discover="true"
                            >
                              <div
                                className="flex items-center justify-center rounded-[40%] h-6 w-6 flex-none"
                                style={{
                                  background: "linear-gradient(135deg, rgb(40, 164, 40) 0%, rgb(71, 195, 122) 100%)",
                                }}
                              >
                                <div className="flex h-full w-full items-center justify-center [&amp;&gt;*&gt;*]:!bg-transparent [&amp;&gt;*&gt;*]:text-center [&amp;&gt;*]:flex [&amp;&gt;*]:items-center [&amp;&gt;*]:justify-center [&amp;&gt;*]:!bg-transparent !rounded-[40%]">
                                  <div className="sc-dPKAra iuIVrI relative !bg-transparent">
                                    <img src={assetPaths.logo} alt="Workspace" className="sc-fuExOL chHJJg" />
                                  </div>
                                </div>
                              </div>
                              <span className="w-full truncate">Workspace</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={"grid w-full flex-1 overflow-x-hidden transition-all duration-300"}>
                <div className={"flex h-full flex-col overflow-hidden"}>
                  <div className={"flex h-full w-full flex-1 flex-col overflow-hidden"}>
                    <div className="border-shade-gray-300 header-with-orb-glow border-b h-10 px-2 flex shrink-0 items-center justify-between">
                      <button
                        type={"button"}
                        aria-label="Toggle settings panel"
                        className="text-shade-gray-1000 flex !h-7 !w-7 items-center justify-center gap-1 rounded-full px-2 text-xs font-medium transition-colors bg-shade-gray-300 hover:bg-shade-gray-400 border-shade-gray-400 hover:text-shade-gray-1200 hover:border-shade-gray-500 border"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          aria-hidden="true"
                          role="img"
                          className="iconify iconify--lucide !h-3.5 !w-3.5 shrink-0"
                          width="1em"
                          height="1em"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 5h16M4 12h16M4 19h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className={"flex-1 overflow-auto"}>
                      <div className={"flex h-full shrink-0 grow basis-0 flex-col overflow-y-auto"}>
                        <div className="px-4 py-6 sm:px-8">
                          <div className="flex flex-col gap-y-4">
                            <div className="space-y-0.5">
                              <h1 className="text-shade-gray-1200 text-2xl font-bold">General</h1>
                              <p className="text-shade-gray-800 text-sm leading-relaxed">
                                Update your profile, display name, timezone, and language preferences.{" "}
                                <a
                                  rel="noopener noreferrer"
                                  target="_blank"
                                  href="https://help.taskade.com/en/articles/8958487-account-settings"
                                  className="text-primary hover:text-primary/80"
                                >
                                  Learn more.
                                </a>
                              </p>
                            </div>
                            <div className="hidden sm:flex">
                              <a
                                aria-current="page"
                                className="AccountTabs__StyledNavLink-sc-a9bbfe19-0 hssqxQ active"
                                href="/settings"
                                data-discover="true"
                              >
                                Account
                              </a>
                              <a
                                className="AccountTabs__StyledNavLink-sc-a9bbfe19-0 hssqxQ"
                                href="/settings/password"
                                data-discover="true"
                              >
                                Password
                              </a>
                              <a
                                className="AccountTabs__StyledNavLink-sc-a9bbfe19-0 hssqxQ"
                                href="/settings/sso"
                                data-discover="true"
                              >
                                Connected Accounts
                              </a>
                              <a
                                className="AccountTabs__StyledNavLink-sc-a9bbfe19-0 hssqxQ"
                                href="/settings/sessions"
                                data-discover="true"
                              >
                                Sessions
                              </a>
                            </div>
                          </div>
                        </div>
                        <div className={"flex-1 px-4 sm:px-8"}>beep</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="secondary-panel-mobile-portal-root" className="contents" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
