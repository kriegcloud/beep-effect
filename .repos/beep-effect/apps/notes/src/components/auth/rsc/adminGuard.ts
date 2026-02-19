import { notFound } from "next/navigation";

import { auth } from "./auth";

export const adminGuard = async () => {
  const { user } = await auth();

  if (!user?.isAdmin) {
    notFound();
  }
};
