import {ThemeProvider} from "@beep/ui/themes/theme.js";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import type React from "react";

export const RootLayout: React.FC<React.PropsWithChildren> = ({children}) => {
	return (
		<html lang={"en"} style={{scrollbarGutter: "stable" }} suppressHydrationWarning>
		  <body className={"antialiased"}>
			  <InitColorSchemeScript attribute={"class"} />
				<ThemeProvider>
					{children}
				</ThemeProvider>
			</body>
		</html>
	)
}