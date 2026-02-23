"use client";
import { createCtx } from "@beep/ui-core/utils";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import React from "react";

interface Identification {
  readonly id: number;
}

interface BulkSelectContextValue<T extends Identification> {
  readonly selectedIds: ReadonlyArray<number>;
  readonly isAllSelected: boolean;
  readonly isIndeterminate: boolean;
  readonly handleToggleAll: (checked: boolean) => void;
  readonly handleToggleCheck: (id: T["id"]) => void;
}

const [useBulkSelect, Provider] = createCtx<BulkSelectContextValue<Identification>>("BulkSelectContext");

type Props<T extends Identification> = React.PropsWithChildren<{
  data: ReadonlyArray<T>;
}>;

export const BulkSelectProvider = <T extends Identification>({ children, data }: Props<T>) => {
  const [selectedIds, setSelectedIds] = React.useState<ReadonlyArray<number>>([]);

  const isAllSelected = A.length(data) > 0 && A.length(selectedIds) === A.length(data);

  const isIndeterminate = A.length(selectedIds) > 0 && !isAllSelected;

  const handleToggleAll = (checked: boolean) =>
    checked && !isIndeterminate ? setSelectedIds(A.map(data, (item) => item.id)) : setSelectedIds([]);

  const handleToggleCheck = (id: T["id"]) =>
    setSelectedIds((prev) => (prev.includes(id) ? A.filter(prev, (itemId) => itemId !== id) : [...prev, id]));

  React.useEffect(() => {
    setSelectedIds((prev) =>
      A.filter(prev, (id) =>
        F.pipe(
          A.findFirstIndex(data, (item) => item.id === id),
          O.match({
            onNone: () => false,
            onSome: (idx) => idx !== -1,
          })
        )
      )
    );
  }, [data]);

  return (
    <Provider
      value={{
        selectedIds,
        isAllSelected,
        isIndeterminate,
        handleToggleAll,
        handleToggleCheck,
      }}
    >
      {children}
    </Provider>
  );
};

export { useBulkSelect };
