import { redirect } from "next/navigation";

import { isNotAuth } from "./auth";

export const protectedGuard = async () => {
  if (await isNotAuth()) redirect("/login");
};
