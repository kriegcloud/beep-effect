import type { Model } from "@beep/ui/flexlayout-react";
import * as O from "effect/Option";
import * as Prism from "prismjs";
import * as React from "react";

// -----------------------------------------------------------------------------
// Type definitions
// -----------------------------------------------------------------------------

interface JsonViewProps {
  readonly model: Model;
}

// -----------------------------------------------------------------------------
// JsonView Component
// -----------------------------------------------------------------------------

export function JsonView({ model }: JsonViewProps): React.ReactElement {
  const timer = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const [json, setJson] = React.useState<string>("");

  const update = React.useCallback(() => {
    const grammarOpt = O.fromNullable(Prism.languages.javascript);
    if (O.isSome(grammarOpt)) {
      const jsonText = JSON.stringify(model.toJson(), null, "\t");
      const newJson = Prism.highlight(jsonText, grammarOpt.value, "javascript");
      setJson(newJson);
    }
  }, [model]);

  React.useEffect(() => {
    const onModelChange = (): void => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        update();
        timer.current = undefined;
      }, 1000);
    };

    model.addChangeListener(onModelChange);
    update();

    return () => {
      model.removeChangeListener(onModelChange);
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [model, update]);

  return <pre style={{ tabSize: "20px" }} dangerouslySetInnerHTML={{ __html: json }} />;
}
