import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";
import * as A from "effect/Array";
import * as R from "effect/Record";
export const dynamicParams = false;

export function generateStaticParams() {
  return A.map(R.values(authViewPaths), (path) => ({ path }));
}

export default async function AuthPage({ params }: { readonly params: Promise<{ readonly path: string }> }) {
  const { path } = await params;

  return (
    <main className="container flex grow flex-col items-center justify-center self-center p-4 md:p-6">
      <AuthView path={path} />
    </main>
  );
}
