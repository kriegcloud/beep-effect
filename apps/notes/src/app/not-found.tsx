import { MainScreen } from "@beep/notes/components/screens/main-screen";
import { StaticLayout } from "@beep/notes/components/screens/static-layout";
import { routes } from "@beep/notes/lib/navigation/routes";
import { LinkButton } from "@beep/notes/registry/ui/button";

export default function NotFound() {
  return (
    <StaticLayout>
      <MainScreen>
        <div className="space-y-4 pt-32 text-center">
          <h2 className="font-heading text-6xl">404</h2>
          <p className="text-subtle-foreground">Couldn't find this page</p>
          <LinkButton variant="outline" href={routes.home()}>
            Back to home
          </LinkButton>
        </div>
      </MainScreen>
    </StaticLayout>
  );
}
