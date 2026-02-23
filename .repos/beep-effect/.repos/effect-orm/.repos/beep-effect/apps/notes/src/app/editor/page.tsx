import { PlateEditor } from "@beep/notes/registry/components/editor/plate-editor";

export default function Page() {
  return (
    <div className="h-screen w-full" data-registry="plate">
      <PlateEditor />
    </div>
  );
}
