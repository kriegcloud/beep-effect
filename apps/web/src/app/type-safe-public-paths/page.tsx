import { assetPaths } from "@beep/constants/paths";
import { logoClasses } from "@beep/ui/branding/logo/classes";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";

export default function TypeSafePublicPaths() {
  const singleLogo = (
    <Box
      component={"img"}
      alt="Single logo"
      src={assetPaths.assets.illustrations.illustrationDashboard}
      width="100%"
      height="100%"
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
      }}
    />
  );

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link
        href={"/"}
        aria-label="Logo"
        underline="none"
        className={logoClasses.root}
        sx={[
          {
            flexShrink: 0,
            color: "transparent",
            display: "inline-flex",
            verticalAlign: "middle",
            width: 40,
            height: 40,
          },
        ]}
      >
        {singleLogo}
      </Link>
    </Box>
  );
}
