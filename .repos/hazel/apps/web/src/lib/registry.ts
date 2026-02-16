import { Atom, Registry } from "@effect-atom/atom-react"
import { runtimeLayer } from "./services/common/runtime"

export const appRegistry = Registry.make()

const sharedAtomRuntime = Atom.runtime(runtimeLayer)

appRegistry.mount(sharedAtomRuntime)
