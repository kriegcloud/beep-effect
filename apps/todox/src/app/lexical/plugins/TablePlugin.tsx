import { Button } from "@beep/ui/components/button";
import { Input } from "@beep/ui/components/input";
import { Label } from "@beep/ui/components/label";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_TABLE_COMMAND, TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import type { EditorThemeClasses, Klass, LexicalEditor, LexicalNode } from "lexical";
import type { JSX } from "react";
import { createContext, useContext, useEffect, useId, useMemo, useState } from "react";

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
    <>
      <div className="flex flex-row items-center mb-2.5 gap-3">
        <Label className="flex flex-1 text-muted-foreground text-sm" htmlFor={rowsId}>
          Rows
        </Label>
        <Input
          id={rowsId}
          type="number"
          className="flex flex-[2]"
          placeholder="# of rows (1-500)"
          value={rows}
          onChange={(e) => setRows(e.target.value)}
          data-testid="table-modal-rows"
        />
      </div>
      <div className="flex flex-row items-center mb-2.5 gap-3">
        <Label className="flex flex-1 text-muted-foreground text-sm" htmlFor={columnsId}>
          Columns
        </Label>
        <Input
          id={columnsId}
          type="number"
          className="flex flex-[2]"
          placeholder="# of columns (1-50)"
          value={columns}
          onChange={(e) => setColumns(e.target.value)}
          data-testid="table-modal-columns"
        />
      </div>
      <div className="flex flex-row justify-end mt-5 gap-2" data-test-id="table-model-confirm-insert">
        <Button variant="outline" disabled={isDisabled} onClick={onClick}>
          Confirm
        </Button>
      </div>
    </>
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
      throw new Error("TablePlugin: TableNode, TableRowNode, or TableCellNode is not registered on editor");
    }
  }, [editor]);
  useEffect(() => {
    cellContext.set(cellEditorConfig, children);
  }, [cellContext, cellEditorConfig, children]);
  return null;
}
