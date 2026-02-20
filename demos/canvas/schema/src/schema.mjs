/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as S from "@palantir/pack.schema";

// @ts-check

const SHAPE_COMMON = {
  bottom: S.Double,
  left: S.Double,
  right: S.Double,
  top: S.Double,

  color: S.Optional(S.String),
};

const migration000 = S.defineMigration({}, () => {
  const ShapeCircle = S.defineRecord("ShapeCircle", {
    docs: "A circle.",
    fields: SHAPE_COMMON,
  });

  const ShapeBox = S.defineRecord("ShapeBox", {
    docs: "A box.",
    fields: SHAPE_COMMON,
  });

  const NodeShape = S.defineUnion("NodeShape", {
    discriminant: "shapeType",
    docs: "The shape of a node.",
    variants: {
      "box": ShapeBox,
      "circle": ShapeCircle,
    },
  });

  const ActivityShapeAddEvent = S.defineRecord("ActivityShapeAddEvent", {
    docs: "An event representing the addition of a shape node.",
    fields: {
      nodeId: S.String,
    },
  });

  const ActivityShapeDeleteEvent = S.defineRecord("ActivityShapeDeleteEvent", {
    docs: "An event representing the deletion of a shape node.",
    fields: {
      nodeId: S.String,
    },
  });

  const ActivityShapeUpdateEvent = S.defineRecord("ActivityShapeUpdateEvent", {
    docs: "An event representing the update of a shape node.",
    fields: {
      nodeId: S.String,
      oldShape: NodeShape,
      newShape: NodeShape,
    },
  });

  const ActivityEvent = S.defineUnion("ActivityEvent", {
    discriminant: "eventType",
    docs: "An activity event describing a change to the document model.",
    variants: {
      "shapeAdd": ActivityShapeAddEvent,
      "shapeDelete": ActivityShapeDeleteEvent,
      "shapeUpdate": ActivityShapeUpdateEvent,
    },
  });

  const PresenceCursorEvent = S.defineRecord("PresenceCursorEvent", {
    docs: "Cursor position for remote user.",
    fields: {
      x: S.Double,
      y: S.Double,
    },
  });

  const PresenceSelectionEvent = S.defineRecord("PresenceSelectionEvent", {
    docs: "Selected nodes for remote user.",
    fields: {
      selectedNodeIds: S.Array(S.String),
    },
  });

  const PresenceEvent = S.defineUnion("PresenceEvent", {
    discriminant: "eventType",
    docs: "A presence event describing user cursor or selection state.",
    variants: {
      "cursor": PresenceCursorEvent,
      "selection": PresenceSelectionEvent,
    },
  });

  return {
    ActivityEvent,
    ActivityShapeAddEvent,
    ActivityShapeDeleteEvent,
    ActivityShapeUpdateEvent,
    NodeShape,
    PresenceCursorEvent,
    PresenceEvent,
    PresenceSelectionEvent,
    ShapeBox,
    ShapeCircle,
  };
});

export default migration000;
