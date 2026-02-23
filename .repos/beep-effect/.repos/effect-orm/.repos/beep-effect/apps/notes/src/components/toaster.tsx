import { Spinner } from "@beep/notes/registry/ui/spinner";
import { Toaster as ToasterPrimitive } from "sonner";

export function Toaster() {
  return (
    <ToasterPrimitive
      icons={{
        loading: <Spinner />,
      }}
      position="bottom-center"
      toastOptions={{
        duration: 3000,
      }}
      visibleToasts={1}
    />
  );
}
