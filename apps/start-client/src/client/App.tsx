import { useRegisterSW } from "virtual:pwa-register/react";
import { router } from "@client/Router.js";
import { RegistryProvider } from "@effect-atom/atom-react";
import { RouterProvider } from "@tanstack/react-router";

export default function App() {
  useRegisterSW({
    immediate: true,
  });

  return (
    <RegistryProvider>
      <RouterProvider router={router} />
      <Session />
    </RegistryProvider>
  );
}

function Session() {
  // useAtomMount(loginAtom)
  // useAtomMount(EventLogClient.runtime)
  return null;
}
