/**
 * State management module exports.
 *
 * @since 1.0.0
 */

// TableState types
export {
  type TableState,
  type CellKey,
  type CellAtomOf,
  makeCellKey
} from "./TableState"

// TableAtoms - main state manager
export { make } from "./TableAtoms"
