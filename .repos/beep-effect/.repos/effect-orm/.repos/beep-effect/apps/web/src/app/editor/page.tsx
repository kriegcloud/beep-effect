import { SimpleLayout } from "@beep/ui/layouts/simple";
import { Editor } from "@beep/ui/lexical";
import "@beep/ui/lexical/styles.css";
const Page = () => {
  return (
    <SimpleLayout>
      <Editor />
    </SimpleLayout>
  );
};

export default Page;
