import { DevProvider } from "@beep/notes/components/dev/dev-provider";
import { DevTools } from "@beep/notes/components/dev/dev-tools";

export default function TailwindIndicator({ children }: { children: React.ReactNode }) {
  return (
    <DevProvider>
      {children}

      <div className="fixed bottom-11 left-3 z-50 print:hidden">
        <DevTools className="block sm:hidden">xs</DevTools>
        <DevTools className="hidden sm:block md:hidden lg:hidden xl:hidden 2xl:hidden">sm</DevTools>
        <DevTools className="hidden md:block lg:hidden xl:hidden 2xl:hidden">md</DevTools>
        <DevTools className="hidden lg:block xl:hidden 2xl:hidden">lg</DevTools>
        <DevTools className="hidden xl:block 2xl:hidden">xl</DevTools>
        <DevTools className="hidden 2xl:block">2xl</DevTools>
      </div>
    </DevProvider>
  );
}
