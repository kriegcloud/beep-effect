import { testFilePathPattern } from "../../test/pattern-test-harness.ts"

testFilePathPattern({
  name: "vm-in-wrong-file",
  tag: "vm-location",
  shouldMatch: [
    { code: "interface ComponentVM {", filePath: "Component.ts" },
    { code: "Context.GenericTag<SettingsVM>", filePath: "Settings.tsx" },
    { code: "Layer.effect(ComponentVM", filePath: "component.ts" },
    { code: "Layer.scoped(  PageVM", filePath: "page.tsx" },
    { code: "interface UserVM { name: string }", filePath: "User.tsx" },
  ],
  shouldNotMatch: [
    { code: "interface ComponentVM {", filePath: "Component.vm.ts" },
    { code: "Context.GenericTag<SettingsVM>", filePath: "Settings.vm.ts" },
    { code: "Layer.effect(PageVM", filePath: "page.vm.ts" },
    { code: "const vm = useVM()", filePath: "Component.tsx" },
    { code: "interface Component {", filePath: "Component.ts" },
    { code: "const UserService = Context.GenericTag<UserService>()", filePath: "User.ts" },
  ],
})
