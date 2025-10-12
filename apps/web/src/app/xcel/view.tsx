"use client";
import "@univerjs/preset-sheets-core/lib/index.css";
import { useSettingsContext } from "@beep/ui/settings";
import { background } from "@beep/ui-core/theme/core/palette";
import Box from "@mui/material/Box";
import docsCoreEnUS from "@univerjs/preset-docs-core/locales/en-US";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";

import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { greenTheme } from "@univerjs/themes";
import React from "react";

const View = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { state } = useSettingsContext();
  React.useEffect(() => {
    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      theme: {
        ...greenTheme,
        black: background.dark.default,
        white: background.light.default,
      },
      darkMode: state.mode === "dark",
      locales: {
        [LocaleType.EN_US]: mergeLocales(docsCoreEnUS),
      },
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current ?? undefined,
        }),
      ],
    });

    univerAPI.addEvent(univerAPI.Event.SheetEditEnded, async (params) => {
      console.log("Saving...");
      const { workbook } = params;
      const data = workbook.save();
      if (data) localStorage.setItem("univer-save", JSON.stringify(data));
      console.log("Saved!");
    });

    const savedDataString = localStorage.getItem("univer-save");
    const savedData = savedDataString ? JSON.parse(savedDataString) : null;

    univerAPI.createWorkbook(savedData ?? { name: "Test Sheet" });

    return () => {
      univerAPI.dispose();
    };
  }, [state]);

  return <Box sx={{ height: "100%", marginX: 2 }} ref={containerRef} />;
};

export default View;
