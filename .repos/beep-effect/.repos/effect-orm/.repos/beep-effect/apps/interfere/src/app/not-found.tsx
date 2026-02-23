import { NotFoundView } from "@beep/ui/sections/error";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `404 page not found! | Error - BEEP` };

export default function Page() {
  return <NotFoundView />;
}
