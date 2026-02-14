import { Button } from "@beep/todox/components/ui/button";
import { Input } from "@beep/todox/components/ui/input";
import { Label } from "@beep/todox/components/ui/label";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_TABLE_COMMAND, TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import type { EditorThemeClasses, Klass, LexicalEditor, LexicalNode } from "lexical";
import type { JSX } from "react";
import { createContext, useContext, useEffect, useId, useMemo, useState } from "react";

import { NodeNotRegisteredError } from "../schema/errors";

export type InsertTableCommandPayload = Readonly<{
  columns: string;
  rows: string;
  includeHeaders?: undefined | boolean;
}>;

export type CellContextShape = {
  readonly cellEditorConfig: null | CellEditorConfig;
  readonly cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
  readonly set: (
    cellEditorConfig: null | CellEditorConfig,
    cellEditorPlugins: null | JSX.Element | Array<JSX.Element>
  ) => void;
};

export type CellEditorConfig = Readonly<{
  namespace: string;
  nodes?: undefined | ReadonlyArray<Klass<LexicalNode>>;
  onError: (error: Error, editor: LexicalEditor) => void;
  readOnly?: undefined | boolean;
  theme?: undefined | EditorThemeClasses;
}>;

export const CellContext = createContext<CellContextShape>({
  cellEditorConfig: null,
  cellEditorPlugins: null,
  set: () => {
    // Empty
  },
});

export function TableContext({ children }: { children: JSX.Element }) {
  const [contextValue, setContextValue] = useState<{
    readonly cellEditorConfig: null | CellEditorConfig;
    readonly cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
  }>({
    cellEditorConfig: null,
    cellEditorPlugins: null,
  });
  return (
    <CellContext.Provider
      value={useMemo(
        () => ({
          cellEditorConfig: contextValue.cellEditorConfig,
          cellEditorPlugins: contextValue.cellEditorPlugins,
          set: (cellEditorConfig, cellEditorPlugins) => {
            setContextValue({ cellEditorConfig, cellEditorPlugins });
          },
        }),
        [contextValue.cellEditorConfig, contextValue.cellEditorPlugins]
      )}
    >
      {children}
    </CellContext.Provider>
  );
}

export function InsertTableDialog({
  activeEditor,
  onClose,
}: {
  readonly activeEditor: LexicalEditor;
  readonly onClose: () => void;
}): JSX.Element {
  const [rows, setRows] = useState("5");
  const [columns, setColumns] = useState("5");
  const [isDisabled, setIsDisabled] = useState(true);
  const rowsId = useId();
  const columnsId = useId();

  useEffect(() => {
    const row = Number(rows);
    const column = Number(columns);
    if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [rows, columns]);

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      rows,
    });

    onClose();
  };

  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor={rowsId}>Number of rows</Label>
        <Input
          id={rowsId}
          type="number"
          placeholder="5"
          value={rows}
          onChange={(e) => setRows(e.target.value)}
          data-testid="table-modal-rows"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor={columnsId}>Number of columns</Label>
        <Input
          id={columnsId}
          type="number"
          placeholder="5"
          value={columns}
          onChange={(e) => setColumns(e.target.value)}
          data-testid="table-modal-columns"
        />
      </div>
      <div className="flex justify-end pt-2" data-test-id="table-model-confirm-insert">
        <Button variant="outline" disabled={isDisabled} onClick={onClick}>
          Confirm
        </Button>
      </div>
    </div>
  );
}

export function TablePlugin({
  cellEditorConfig,
  children,
}: {
  readonly cellEditorConfig: CellEditorConfig;
  readonly children: JSX.Element | Array<JSX.Element>;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const cellContext = useContext(CellContext);
  useEffect(() => {
    if (!editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
      throw new NodeNotRegisteredError({
        message: "TablePlugin: TableNode, TableRowNode, or TableCellNode is not registered on editor",
        plugin: "TablePlugin",
        nodeType: "TableNode, TableRowNode, TableCellNode",
      });
    }
  }, [editor]);
  useEffect(() => {
    cellContext.set(cellEditorConfig, children);
  }, [cellContext, cellEditorConfig, children]);
  return null;
}
