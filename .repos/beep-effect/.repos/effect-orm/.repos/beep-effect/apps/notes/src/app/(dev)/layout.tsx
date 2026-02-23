import { MainScreen } from "@beep/notes/components/screens/main-screen";
import type { LayoutProps } from "@beep/notes/lib/navigation/next-types";

export default function Layout({ children }: LayoutProps) {
  return (
    <MainScreen size="full" className="flex justify-center">
      {children}
    </MainScreen>
  );
}
