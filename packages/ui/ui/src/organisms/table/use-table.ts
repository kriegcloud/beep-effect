"use client";

import * as A from "effect/Array";
import * as F from "effect/Function";
import { useCallback, useState } from "react";

export type UseTableReturn = {
  dense: boolean;
  page: number;
  rowsPerPage: number;
  order: "asc" | "desc";
  orderBy: string;

  selected: string[];
  onSelectRow: (id: string) => void;
  onSelectAllRows: (checked: boolean, newSelecteds: string[]) => void;

  onResetPage: () => void;
  onSort: (id: string) => void;
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDense: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdatePageDeleteRow: (totalRowsInPage: number) => void;
  onUpdatePageDeleteRows: (totalRowsInPage: number, totalRowsFiltered: number) => void;

  setPage: React.Dispatch<React.SetStateAction<number>>;
  setDense: React.Dispatch<React.SetStateAction<boolean>>;
  setOrderBy: React.Dispatch<React.SetStateAction<string>>;
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>;
  setOrder: React.Dispatch<React.SetStateAction<"desc" | "asc">>;
};

export type UseTableProps = {
  defaultDense?: boolean;
  defaultOrderBy?: string;
  defaultSelected?: string[];
  defaultRowsPerPage?: number;
  defaultCurrentPage?: number;
  defaultOrder?: "asc" | "desc";
};

export function useTable(props?: UseTableProps): UseTableReturn {
  const [dense, setDense] = useState(!!props?.defaultDense);

  const [page, setPage] = useState(props?.defaultCurrentPage ?? 0);

  const [orderBy, setOrderBy] = useState(props?.defaultOrderBy ?? "name");

  const [rowsPerPage, setRowsPerPage] = useState(props?.defaultRowsPerPage ?? 5);

  const [order, setOrder] = useState<"asc" | "desc">(props?.defaultOrder ?? "asc");

  const [selected, setSelected] = useState<string[]>(props?.defaultSelected ?? []);

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === "asc";
      if (id !== "") {
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(id);
      }
    },
    [order, orderBy]
  );

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = F.pipe(selected, A.contains(inputValue))
        ? F.pipe(
            selected,
            A.filter((value) => value !== inputValue)
          )
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(Number.parseInt(event.target.value, 10));
  }, []);

  const onChangeDense = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  }, []);

  const onSelectAllRows = useCallback((checked: boolean, inputValue: string[]) => {
    if (checked) {
      setSelected(inputValue);
      return;
    }
    setSelected([]);
  }, []);

  const onChangePage = useCallback((_event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onUpdatePageDeleteRow = useCallback(
    (totalRowsInPage: number) => {
      setSelected([]);
      if (page) {
        if (totalRowsInPage < 2) {
          setPage(page - 1);
        }
      }
    },
    [page]
  );

  const onUpdatePageDeleteRows = useCallback(
    (totalRowsInPage: number, totalRowsFiltered: number) => {
      const totalSelected = selected.length;

      setSelected([]);

      if (page) {
        if (totalSelected === totalRowsInPage) {
          setPage(page - 1);
        } else if (totalSelected === totalRowsFiltered) {
          setPage(0);
        } else if (totalSelected > totalRowsInPage) {
          const newPage = Math.ceil((totalRowsFiltered - totalSelected) / rowsPerPage) - 1;

          setPage(newPage);
        }
      }
    },
    [page, rowsPerPage, selected.length]
  );

  return {
    dense,
    order,
    page,
    orderBy,
    rowsPerPage,

    selected,
    onSelectRow,
    onSelectAllRows,

    onSort,
    onChangePage,
    onChangeDense,
    onResetPage,
    onChangeRowsPerPage,
    onUpdatePageDeleteRow,
    onUpdatePageDeleteRows,

    setPage,
    setDense,
    setOrder,
    setOrderBy,
    setSelected,
    setRowsPerPage,
  };
}
