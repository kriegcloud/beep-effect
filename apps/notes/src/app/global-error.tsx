"use client";

import { ErrorScreen } from "@beep/notes/components/screens/error-screen";
import { StaticLayout } from "@beep/notes/components/screens/static-layout";
import type { ErrorProps } from "@beep/notes/lib/navigation/next-types";

export default function GlobalError(props: ErrorProps) {
  return (
    <html lang="en">
      <body>
        <StaticLayout>
          <ErrorScreen {...props} />
        </StaticLayout>
      </body>
    </html>
  );
}
