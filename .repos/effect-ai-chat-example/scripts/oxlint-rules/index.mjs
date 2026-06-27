import enforceReactNamespace from "./rules/enforce-react-namespace.mjs";
import noDeepRelativeImports from "./rules/no-deep-relative-imports.mjs";
import noRelativeImportOutsidePackage from "./rules/no-relative-import-outside-package.mjs";

export default {
  meta: {
    name: "app",
  },
  rules: {
    "enforce-react-namespace": enforceReactNamespace,
    "no-deep-relative-imports": noDeepRelativeImports,
    "no-relative-import-outside-package": noRelativeImportOutsidePackage,
  },
};
