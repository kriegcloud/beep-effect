"use client";
import { AccountManagementProvider } from "@beep/iam-ui/account-management/account-management.provider";
import { SimpleBar } from "@beep/ui/molecules/SimpleBar";
import { useBreakpoints } from "@beep/ui/providers";
import { useSettingsContext } from "@beep/ui/settings";
import { TabContext } from "@mui/lab";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import * as A from "effect/Array";
import React from "react";
import { accountTabs } from "./account-tab";
import { AccountTabPanel } from "./components/common/AccountTabPanel";
import { SideTabList } from "./components/SideTabList";

export const AccountManagementView = () => {
  const [activeTab, setActiveTab] = React.useState<string>(accountTabs[0].value);
  const { down } = useBreakpoints();
  const [showTabList, setShowTabList] = React.useState(true);
  const {
    state: { direction },
  } = useSettingsContext();

  const downMd = down("md");
  const handleChange = (_event: React.SyntheticEvent, newValue: string): void => setActiveTab(newValue);

  return (
    <AccountManagementProvider>
      <TabContext value={activeTab}>
        <Stack>
          {downMd ? (
            <Drawer
              hideBackdrop
              anchor={direction === "ltr" ? "left" : "right"}
              open={showTabList}
              onClose={() => setShowTabList(false)}
              ModalProps={{
                keepMounted: true,
                disablePortal: true,
              }}
              slotProps={{
                paper: {
                  sx: {
                    bgcolor: "background.elevation1",
                    width: 1,
                    overflow: "hidden",
                    pointerEvents: "auto",
                    // height: ({ mixins }) => mixins.contentHeight(topbarHeight),
                    // top: ({ mixins }) => mixins.topOffset(topbarHeight, 1),
                  },
                },
              }}
              sx={{
                pointerEvents: "none",
              }}
            >
              <SimpleBar>
                <SideTabList setShowTabList={setShowTabList} handleChange={handleChange} />
              </SimpleBar>
            </Drawer>
          ) : (
            <Paper
              component={"div"}
              sx={{
                width: { md: 324, lg: 405 },
                position: "sticky",
                // top: ({ mixins }) => mixins.topOffset(topbarHeight),
                // height: ({ mixins }) => mixins.contentHeight(topbarHeight),
              }}
            >
              <SimpleBar>
                <SideTabList setShowTabList={setShowTabList} handleChange={handleChange} />
              </SimpleBar>
            </Paper>
          )}

          <Paper sx={{ flex: 1, maxWidth: 1 }}>
            <Container
              maxWidth={false}
              sx={{
                px: { xs: 3, md: 5 },
                py: 5,
                maxWidth: { xs: 628, md: 660 },
                overflowY: "hidden",
                height: downMd ? 1 : "auto",
              }}
            >
              {A.map(accountTabs, (tab, index) => (
                <AccountTabPanel
                  key={`${tab}-${index}`}
                  label={tab.label}
                  value={tab.value}
                  title={tab.title}
                  panelIcon={tab.panelIcon}
                  setShowTabList={setShowTabList}
                >
                  {tab.tabPanel}
                </AccountTabPanel>
              ))}
            </Container>
          </Paper>
        </Stack>
      </TabContext>
    </AccountManagementProvider>
  );
};
