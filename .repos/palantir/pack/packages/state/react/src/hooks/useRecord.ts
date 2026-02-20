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

import type { Model, ModelData, RecordRef } from "@palantir/pack.document-schema.model-types";
import { useEffect, useState } from "react";

type UseRecordResult<M extends Model> =
  | { status: "loading"; data: undefined }
  | { status: "loaded"; data: ModelData<M> }
  | { status: "deleted"; data: undefined };

/**
 * Subscribes to an individual record and subscribes to its changes.
 *
 * @param ref The record to subscribe to.
 * @returns The latest data and status.
 * @example
 * ```tsx
 * import { useRecord } from "@palantir/pack.state.react";
 * import { MyModel } from "@myapp/schema";
 *
 * const MyComponent: React.FC<{ recordRef: RecordRef<MyModel> }> = ({ recordRef }) => {
 *   const record = useRecord(recordRef);
 *
 *   if (record.status === "loading") {
 *     return <Spinner />;
 *   }
 *
 *   if (record.status === "deleted") {
 *     return <div>Record not found</div>;
 *   }
 *
 *   return <div>Hello, {record.data.myFieldName}</div>;
 * }
 * ```
 */
export function useRecord<M extends Model>(
  ref: RecordRef<M>,
): UseRecordResult<M> {
  const [result, setResult] = useState<UseRecordResult<M>>({ status: "loading", data: undefined });

  useEffect(() => {
    setResult({ status: "loading", data: undefined });

    const unsubscribeToOnChange = ref.onChange(newSnapshot => {
      setResult({ status: "loaded", data: newSnapshot });
    });

    const unsubscribeToOnDeleted = ref.onDeleted(() => {
      setResult({ status: "deleted", data: undefined });
    });

    return () => {
      unsubscribeToOnChange();
      unsubscribeToOnDeleted();
    };
  }, [ref]);

  return result;
}
