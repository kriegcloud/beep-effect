import * as Data from "effect/Data";

export class NoNodesInSession extends Data.TaggedError("NoNodesInSession") {
  get message() {
    return "No nodes in session";
  }
}
