import { Main } from "@beep/notes/app/(dynamic)/(main)/main";
import { isAuth } from "@beep/notes/components/auth/rsc/auth";
import { DocumentPlate, PublicPlate } from "@beep/notes/components/editor/plate-provider";
import { Panels } from "@beep/notes/components/layouts/panels";
import { RightPanelType } from "@beep/notes/hooks/useResizablePanel";
import { parseLayout } from "@beep/notes/lib/layout-schema";
import type { LayoutProps } from "@beep/notes/lib/navigation/next-types";
import { getCookie } from "cookies-next/server";
import { pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { cookies } from "next/headers";
export default async function MainLayout({ children }: LayoutProps) {
  const session = await isAuth();

  const PlateProvider = session ? DocumentPlate : PublicPlate;

  const navCookie = await getCookie("nav", { cookies });
  const rightPanelTypeCookie = await getCookie("right-panel-type", {
    cookies,
  });

  const initialLayout = pipe(
    navCookie,
    O.fromNullable,
    O.flatMap(parseLayout),
    O.match({
      onNone: () => ({ leftSize: 300, rightSize: 240 }),
      onSome: (layout) => layout,
    })
  );

  const initialRightPanelType = pipe(
    rightPanelTypeCookie,
    O.fromNullable,
    O.flatMap(S.decodeUnknownOption(S.parseJson(S.Literal(0, 1)))),
    O.match({
      onNone: () => RightPanelType.comment,
      onSome: (rightPanelType) => rightPanelType,
    })
  );

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
