import { Home } from "@beep/notes/app/(dynamic)/(main)/(protected)/home";
import { isAuth } from "@beep/notes/components/auth/rsc/auth";
import { HydrateClient, trpc } from "@beep/notes/trpc/server";

export default async function HomePage() {
  const session = await isAuth();

  if (session) {
    void trpc.document.documents.prefetch({});
  }

  return (
    <HydrateClient>
      <Home />
    </HydrateClient>
  );
}
