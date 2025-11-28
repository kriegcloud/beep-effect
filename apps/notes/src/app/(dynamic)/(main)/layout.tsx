import { Main } from "@beep/notes/app/(dynamic)/(main)/main";
import { isAuth } from "@beep/notes/components/auth/rsc/auth";
import { DocumentPlate, PublicPlate } from "@beep/notes/components/editor/plate-provider";
import { Panels } from "@beep/notes/components/layouts/panels";
import { RightPanelType } from "@beep/notes/hooks/useResizablePanel";
import type { LayoutProps } from "@beep/notes/lib/navigation/next-types";
import { getCookie } from "cookies-next/server";
import { cookies } from "next/headers";

export default async function MainLayout({ children }: LayoutProps) {
  const session = await isAuth();

  const PlateProvider = session ? DocumentPlate : PublicPlate;

  const navCookie = await getCookie("nav", { cookies });
  const rightPanelTypeCookie = await getCookie("right-panel-type", {
    cookies,
  });

  const initialLayout = navCookie ? JSON.parse(navCookie) : { leftSize: 300, rightSize: 240 };

  const initialRightPanelType = rightPanelTypeCookie ? JSON.parse(rightPanelTypeCookie) : RightPanelType.comment;

  return (
    <div className="flex h-full min-h-dvh dark:bg-[#1F1F1F]">
      <PlateProvider>
        <Panels initialLayout={initialLayout} initialRightPanelType={initialRightPanelType}>
          <Main>{children}</Main>
        </Panels>
      </PlateProvider>
    </div>
  );
}
