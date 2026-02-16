import { AccountView } from "@daveyplate/better-auth-ui";
import { accountViewPaths } from "@daveyplate/better-auth-ui/server";
import * as A from "effect/Array";
import * as R from "effect/Record";
export const dynamicParams = false;

export function generateStaticParams() {
  return A.map(R.values(accountViewPaths), (path) => ({ path }));
}

export default async function AccountPage({ params }: { readonly params: Promise<{ readonly path: string }> }) {
  const { path } = await params;

  return (
    <main className="container p-4 md:p-6">
      <AccountView path={path} />
    </main>
  );
}
