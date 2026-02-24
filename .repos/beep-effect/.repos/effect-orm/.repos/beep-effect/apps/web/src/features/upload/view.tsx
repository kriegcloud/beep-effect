// "use client";
// import { usePathname, useSearchParams } from "@beep/ui/hooks";
// import { RouterLink } from "@beep/ui/routing";
// import Box from "@mui/material/Box";
// import Divider from "@mui/material/Divider";
// import FormControlLabel from "@mui/material/FormControlLabel";
// import Switch from "@mui/material/Switch";
// import ToggleButton from "@mui/material/ToggleButton";
// import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
// import Typography from "@mui/material/Typography";
// import React from "react";
//
// import { OtherDemo } from "@/features/upload/form";
//
// const CATEGORIES = [
//   { value: "", label: "Other" },
//   { value: "fields", label: "Fields" },
//   { value: "controls", label: "Controls" },
// ];
//
// const CATEGORY_PARAM = "category";
//
// export function View() {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const selectedCategory = searchParams.get(CATEGORY_PARAM) ?? "";
//   const [debug, setDebug] = React.useState(true);
//
//   const handleChangeDebug = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
//     setDebug(event.target.checked);
//   }, []);
//   const createRedirectPath = (currentPath: string, query: string) => {
//     const queryString = new URLSearchParams({ [CATEGORY_PARAM]: query }).toString();
//     return query ? `${currentPath}?${queryString}` : currentPath;
//   };
//   return (
//     <Box>
//       <Typography variant="h4" sx={{ mb: 3 }}>
//         @tanstack/react-form + effect/Schema
//       </Typography>
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <ToggleButtonGroup exclusive value={selectedCategory}>
//           {CATEGORIES.map((option) => (
//             <ToggleButton
//               key={option.label}
//               component={RouterLink}
//               href={createRedirectPath(pathname, option.value)}
//               value={option.value}
//               aria-label={option.label}
//             >
//               {option.label}
//             </ToggleButton>
//           ))}
//         </ToggleButtonGroup>
//         <FormControlLabel
//           label="Debug"
//           labelPlacement="start"
//           control={
//             <Switch checked={debug} onChange={handleChangeDebug} slotProps={{ input: { id: "debug-switch" } }} />
//           }
//           sx={[
//             (theme) => ({
//               display: "none",
//               [theme.breakpoints.up(1440)]: {
//                 display: "flex",
//               },
//             }),
//           ]}
//         />
//       </Box>
//       <Divider sx={{ my: 3 }} />
//       {selectedCategory === "" && <OtherDemo />}
//       {selectedCategory === "fields" && <Typography variant={"h1"}>beep1</Typography>}
//       {selectedCategory === "controls" && <Typography variant={"h1"}>beep2</Typography>}
//     </Box>
//   );
// }
