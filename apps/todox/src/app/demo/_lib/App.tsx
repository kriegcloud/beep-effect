"use client";

import type { Action, ITabRenderValues, ITabSetRenderValues, JsonTabNode, Node } from "@beep/ui/flexlayout-react";
import {
  Actions,
  AddIcon,
  BorderNode,
  Layout,
  MenuIcon,
  Model,
  SettingsIcon,
  TabNode,
  TabSetNode,
} from "@beep/ui/flexlayout-react";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Prism from "prismjs";
import * as React from "react";
import { AGGridExample } from "./aggrid";
import BarChart from "./chart";
import { JsonView } from "./JsonView";
import MUIComponent from "./MUIComponent";
import MUIDataGrid from "./MUIDataGrid";
import { NewFeatures } from "./NewFeatures";
import MapComponent from "./openlayter";
import { showPopup } from "./PopupMenu";
import { SimpleForm } from "./SimpleForm";
import { Utils } from "./Utils";
import "prismjs/themes/prism-coy.css";
import "./styles.css";
import "./popupmenu.css";
import "../flexlayout.css";

// -----------------------------------------------------------------------------
// CrossOriginIframe Component
// -----------------------------------------------------------------------------

/**
 * A wrapper component for iframes that prevents React's dev mode logging from
 * traversing into cross-origin contentWindow, which would throw SecurityError.
 *
 * Uses a Custom Element with Shadow DOM to create a true isolation boundary
 * that React cannot traverse into during development mode render logging.
 */
interface CrossOriginIframeProps {
  readonly id: string;
  readonly src: string;
}

// Register the custom element once
const CUSTOM_ELEMENT_NAME = "isolated-iframe";
if (typeof window !== "undefined" && !customElements.get(CUSTOM_ELEMENT_NAME)) {
  class IsolatedIframe extends HTMLElement {
    private shadow: ShadowRoot;

    constructor() {
      super();
      // Create closed shadow root - React cannot access closed shadow DOM
      this.shadow = this.attachShadow({ mode: "closed" });
    }

    static get observedAttributes() {
      return ["src", "title"];
    }

    connectedCallback() {
      this.render();
    }

    attributeChangedCallback() {
      this.render();
    }

    private render() {
      const src = this.getAttribute("src") || "";
      const title = this.getAttribute("title") || "";

      this.shadow.innerHTML = `
        <style>
          :host { display: block; width: 100%; height: 100%; }
          iframe { display: block; border: none; box-sizing: border-box; width: 100%; height: 100%; }
        </style>
        <iframe
          src="${src}"
          title="${title}"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerpolicy="no-referrer"
          loading="lazy"
        ></iframe>
      `;
    }
  }

  customElements.define(CUSTOM_ELEMENT_NAME, IsolatedIframe);
}

const CrossOriginIframe = React.memo(function CrossOriginIframe({ id, src }: CrossOriginIframeProps) {
  // Use the custom element - React treats it as an opaque element and won't traverse its shadow DOM
  return React.createElement(CUSTOM_ELEMENT_NAME, {
    src,
    title: id,
    style: { width: "100%", height: "100%", display: "block" },
  });
});

// -----------------------------------------------------------------------------
// Type-safe field definitions
// -----------------------------------------------------------------------------

const FIELD_NAMES = ["Name", "Field1", "Field2", "Field3", "Field4", "Field5"] as const;
type FieldName = (typeof FIELD_NAMES)[number];

// Type-safe record for fake data
interface FakeDataRecord extends Record<FieldName, string> {}

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const ContextExample = React.createContext("");

// -----------------------------------------------------------------------------
// Utility functions
// -----------------------------------------------------------------------------

const randomString = (len: number, chars: string): string => {
  const charArray = A.fromIterable(chars);
  const indices = A.makeBy(len, () => Math.floor(Math.random() * charArray.length));
  return A.filterMap(indices, (idx) => A.get(charArray, idx)).join("");
};

const makeFakeData = (): ReadonlyArray<FakeDataRecord> => {
  const count = Math.floor(Math.random() * 50);

  return A.makeBy(count, () => {
    // Start with the Name field
    const baseRecord: FakeDataRecord = {
      Name: randomString(5, "BCDFGHJKLMNPQRSTVWXYZ"),
      Field1: "",
      Field2: "",
      Field3: "",
      Field4: "",
      Field5: "",
    };

    // Get all fields except "Name" (indices 1-5)
    const dataFields = A.drop(A.fromIterable(FIELD_NAMES), 1);

    // Build the record immutably using Array reduce
    return A.reduce(dataFields, baseRecord, (acc, fieldName) => ({
      ...acc,
      [fieldName]: (1.5 + Math.random() * 2).toFixed(2),
    }));
  });
};

// -----------------------------------------------------------------------------
// SimpleTable Component
// -----------------------------------------------------------------------------

interface SimpleTableProps {
  readonly fields: ReadonlyArray<FieldName>;
  readonly node: Node;
  readonly data: ReadonlyArray<FakeDataRecord>;
  readonly onDragStart: (event: React.DragEvent<HTMLDivElement>, node: Node) => void;
}

function SimpleTable(props: SimpleTableProps) {
  const { fields, data } = props;

  const headercells = A.map(fields, (field) => <th key={field}>{field}</th>);

  const rows = A.map(data, (record, i) => {
    const cells = A.map(fields, (field) => {
      const value = O.getOrElse(R.get(record, field), () => "");
      return <td key={field}>{String(value)}</td>;
    });
    return <tr key={i}>{cells}</tr>;
  });

  return (
    <table className="simple_table">
      <tbody>
        <tr>{headercells}</tr>
        {rows}
      </tbody>
    </table>
  );
}

// -----------------------------------------------------------------------------
// App Component
// -----------------------------------------------------------------------------

function App() {
  const [layoutFile, setLayoutFile] = React.useState<string | null>(null);
  const [model, setModel] = React.useState<Model | null>(null);
  const [, setJson] = React.useState<string>("");
  const [, setFontSize] = React.useState<string>("medium");
  const [realtimeResize, setRealtimeResize] = React.useState<boolean>(false);
  const [showLayout, setShowLayout] = React.useState<boolean>(false);
  const [popoutClassName, setPopoutClassName] = React.useState<string>("flexlayout__theme_light");

  // ---------------------------------------------------------------------------
  // Dev-mode error suppression for cross-origin Window access
  // ---------------------------------------------------------------------------
  // React's development mode render logging traverses props/state and encounters
  // cross-origin Window references in FlexLayout's LayoutWindow model, causing
  // SecurityError. This is a known React issue (facebook/react#34840) that is
  // benign and doesn't affect functionality. We suppress it to reduce console noise.
  // ---------------------------------------------------------------------------
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const originalError = window.onerror;

    window.onerror = (message, _source, _lineno, _colno, error) => {
      // Check for the specific SecurityError pattern from React's dev mode logging
      const isReactDevSecurityError =
        error instanceof DOMException &&
        error.name === "SecurityError" &&
        typeof message === "string" &&
        (message.includes("Blocked a frame with origin") ||
          message.includes("cross-origin frame") ||
          message.includes("$typeof"));

      if (isReactDevSecurityError) {
        // Suppress this known benign error - return true to prevent default handling
        return true;
      }

      // Pass through to original handler for other errors
      if (originalError) {
        return originalError(message, _source, _lineno, _colno, error);
      }
      return false;
    };

    return () => {
      window.onerror = originalError;
    };
  }, []);

  const loadingLayoutName = React.useRef<string | null>(null);
  const nextGridIndex = React.useRef<number>(1);
  const showingPopupMenu = React.useRef<boolean>(false);
  const layoutRef = React.useRef<Layout | null>(null);

  // latest values to prevent closure problems
  const latestModel = React.useRef<Model | null>(model);
  const latestLayoutFile = React.useRef<string | null>(layoutFile);

  latestModel.current = model;
  latestLayoutFile.current = layoutFile;

  const save = React.useCallback(() => {
    const currentModel = latestModel.current;
    const currentLayoutFile = latestLayoutFile.current;

    if (currentModel && currentLayoutFile) {
      try {
        const jsonStr = JSON.stringify(currentModel.toJson(), null, "\t");
        localStorage.setItem(currentLayoutFile, jsonStr);
      } catch (e) {
        // Ignore serialization errors (can happen with cross-origin iframes)
        console.warn("Failed to save layout:", e instanceof Error ? e.message : String(e));
      }
    }
  }, []);

  const load = React.useCallback((jsonText: string) => {
    const grammarOpt = O.fromNullable(Prism.languages.javascript);
    if (O.isSome(grammarOpt)) {
      const grammar = grammarOpt.value;
      const json = JSON.parse(jsonText);
      const loadedModel = Model.fromJson(json);
      const html = Prism.highlight(jsonText, grammar, "javascript");
      setLayoutFile(loadingLayoutName.current);
      setModel(loadedModel);
      setJson(html);
    }
  }, []);

  const error = React.useCallback((reason: string | Event) => {
    const message = typeof reason === "string" ? reason : "Network error";
    alert(`Error loading json config file: ${loadingLayoutName.current}\n${message}`);
  }, []);

  const loadLayout = React.useCallback(
    (layoutName: string, reload?: boolean) => {
      if (layoutFile !== null) {
        save();
      }

      loadingLayoutName.current = layoutName;
      let loaded = false;
      if (!reload) {
        const json = localStorage.getItem(layoutName);
        if (json != null) {
          load(json);
          loaded = true;
        }
      }

      if (!loaded) {
        Utils.downloadFile(`layouts/${layoutName}.layout`, load, error);
      }
    },
    [layoutFile, save, load, error]
  );

  React.useEffect(() => {
    // save layout when unloading page
    window.onbeforeunload = () => {
      save();
    };

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const layout = params.get("layout") ?? "default";

    loadLayout(layout, false);
  }, []);

  const onAddActiveClick = React.useCallback(
    (_event: React.MouseEvent) => {
      const layout = layoutRef.current;
      if (!layout) return;

      if (layoutFile?.startsWith("test_")) {
        layout.addTabToActiveTabSet({
          component: "testing",
          name: `Text${nextGridIndex.current++}`,
          enableWindowReMount: false,
          type: "tab" as const,
        });
      } else {
        layout.addTabToActiveTabSet({
          component: "grid",
          icon: "images/article.svg",
          name: `Grid ${nextGridIndex.current++}`,
          enableWindowReMount: false,
          type: "tab" as const,
        });
      }
    },
    [layoutFile]
  );

  const onAddFromTabSetButton = React.useCallback((node: TabSetNode | BorderNode) => {
    const layout = layoutRef.current;
    if (!layout) return;

    const addedTab = layout.addTabToTabSet(node.getId(), {
      component: "grid",
      name: `Grid ${nextGridIndex.current++}`,
      enableWindowReMount: false,
      type: "tab" as const,
    });
    // Note: Avoid logging TabNode objects directly as serialization can hit cross-origin
    // iframe windows and throw SecurityError. Log only primitive identifiers.
    if (addedTab) {
      console.log("Added tab:", addedTab.getId(), addedTab.getName());
    }
  }, []);

  const onRealtimeResize = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRealtimeResize(event.target.checked);
  }, []);

  const onShowLayout = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setShowLayout(event.target.checked);
  }, []);

  const onRenderDragRect = React.useCallback(
    (content: React.ReactNode | undefined, _node?: Node, _json?: JsonTabNode) => {
      if (layoutFile === "newfeatures") {
        return (
          <>
            {content}
            <div style={{ whiteSpace: "pre" }}>
              <br />
              This is a customized
              <br />
              drag rectangle
            </div>
          </>
        );
      }
      return undefined;
    },
    [layoutFile]
  );

  const onContextMenu = React.useCallback(
    (node: TabNode | TabSetNode | BorderNode, event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (showingPopupMenu.current) return;

      event.preventDefault();
      event.stopPropagation();

      const layout = layoutRef.current;
      const rootDiv = layout?.getRootDiv();
      if (!rootDiv) return;

      showPopup(
        `Menu for ${node instanceof TabNode ? `Tab: ${node.getName()}` : node.getType()}`,
        rootDiv,
        event.clientX,
        event.clientY,
        ["Option 1", "Option 2"],
        (_item: string | undefined) => {
          showingPopupMenu.current = false;
        }
      );
      showingPopupMenu.current = true;
    },
    []
  );

  const onAuxMouseClick = React.useCallback(
    (_node: TabNode | TabSetNode | BorderNode, _event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      // Reserved for future use
    },
    []
  );

  const onTableDragStart = React.useCallback((event: React.DragEvent<HTMLDivElement>, node: Node) => {
    layoutRef.current?.moveTabWithDragAndDrop(event.nativeEvent, node as TabNode);
  }, []);

  const onDragStart = React.useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.stopPropagation();
      const layout = layoutRef.current;
      if (!layout) return;

      if (layoutFile?.startsWith("test_")) {
        const gridName = `Text${nextGridIndex.current++}`;
        event.dataTransfer.setData("text/plain", `FlexLayoutTab:${JSON.stringify({ name: gridName })}`);
        layout.setDragComponent(event.nativeEvent, gridName, 10, 10);
        layout.addTabWithDragAndDrop(event.nativeEvent, {
          name: gridName,
          component: "testing",
          icon: "images/article.svg",
          enableWindowReMount: false,
          type: "tab" as const,
        });
      } else {
        const gridName = `Grid ${nextGridIndex.current++}`;
        event.dataTransfer.setData("text/plain", `FlexLayoutTab:${JSON.stringify({ name: gridName })}`);
        layout.setDragComponent(event.nativeEvent, gridName, 10, 10);
        layout.addTabWithDragAndDrop(event.nativeEvent, {
          name: gridName,
          component: "grid",
          icon: "images/article.svg",
          enableWindowReMount: false,
          type: "tab" as const,
        });
      }
    },
    [layoutFile]
  );

  const onExternalDrag = React.useCallback(
    (
      e: React.DragEvent<HTMLElement>
    ): { json: JsonTabNode; onDrop?: (node?: Node, event?: React.DragEvent<HTMLElement>) => void } | undefined => {
      // Check for supported content type
      const validTypes = ["text/uri-list", "text/html", "text/plain"];
      const types = A.fromIterable(e.dataTransfer.types);
      const hasValidType = A.some(types, (t) => A.contains(validTypes, t));

      if (!hasValidType) return undefined;

      // Set dropEffect (icon)
      e.dataTransfer.dropEffect = "link";

      return {
        json: {
          type: "tab" as const,
          component: "multitype",
          name: "External Drop",
          enableWindowReMount: false,
        },
        onDrop: (node?: Node, event?: React.DragEvent<HTMLElement>) => {
          if (!node || !event || !model) return;

          if (node instanceof TabNode && event.dataTransfer) {
            const dtTypes = A.fromIterable(event.dataTransfer.types);

            if (A.contains(dtTypes, "text/uri-list")) {
              const data = event.dataTransfer.getData("text/uri-list");
              model.doAction(
                Actions.updateNodeAttributes(node.getId(), { name: "Url", config: { data, type: "url" } })
              );
            } else if (A.contains(dtTypes, "text/html")) {
              const data = event.dataTransfer.getData("text/html");
              model.doAction(
                Actions.updateNodeAttributes(node.getId(), { name: "Html", config: { data, type: "html" } })
              );
            } else if (A.contains(dtTypes, "text/plain")) {
              const data = event.dataTransfer.getData("text/plain");
              model.doAction(
                Actions.updateNodeAttributes(node.getId(), { name: "Text", config: { data, type: "text" } })
              );
            }
          }
        },
      };
    },
    [model]
  );

  const onShowLayoutClick = React.useCallback(
    (_event: React.MouseEvent) => {
      if (model) {
        console.log(JSON.stringify(model.toJson(), null, "\t"));
      }
    },
    [model]
  );

  const onAction = React.useCallback((action: Action) => {
    return action;
  }, []);

  const factory = React.useCallback(
    (node: TabNode): React.ReactNode => {
      const component = node.getComponent();
      const currentModel = latestModel.current;

      if (component === "json" && currentModel) {
        return <JsonView model={currentModel} />;
      }
      if (component === "simpleform") {
        return <SimpleForm />;
      }
      if (component === "mui") {
        return <MUIComponent />;
      }
      if (component === "muigrid") {
        return <MUIDataGrid />;
      }
      if (component === "aggrid") {
        return <AGGridExample />;
      }
      if (component === "chart") {
        return <BarChart />;
      }
      if (component === "map") {
        return <MapComponent />;
      }
      if (component === "grid") {
        if (node.getExtraData().data == null) {
          node.getExtraData().data = makeFakeData();
        }
        return (
          <SimpleTable
            fields={A.fromIterable(FIELD_NAMES)}
            data={node.getExtraData().data}
            node={node}
            onDragStart={onTableDragStart}
          />
        );
      }
      if (component === "sub") {
        let subModel = node.getExtraData().model;
        if (subModel == null) {
          node.getExtraData().model = Model.fromJson(node.getConfig().model);
          subModel = node.getExtraData().model;
          node.setEventListener("save", () => {
            if (latestModel.current) {
              latestModel.current.doAction(
                Actions.updateNodeAttributes(node.getId(), {
                  config: { model: node.getExtraData().model.toJson() },
                })
              );
            }
          });
        }
        return <Layout model={subModel} factory={factory} />;
      }
      if (component === "text") {
        try {
          return <div dangerouslySetInnerHTML={{ __html: node.getConfig().text }} />;
        } catch (e) {
          console.log(e);
        }
      }
      if (component === "newfeatures") {
        return <NewFeatures />;
      }
      if (component === "multitype") {
        try {
          const config = node.getConfig();
          if (config.type === "url") {
            // Use CrossOriginIframe wrapper to prevent DevTools SecurityError
            // when inspecting cross-origin iframes (e.g., Wikipedia)
            return <CrossOriginIframe id={node.getId()} src={config.data} />;
          }
          if (config.type === "html") {
            return <div dangerouslySetInnerHTML={{ __html: config.data }} />;
          }
          if (config.type === "text") {
            return (
              <textarea
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  resize: "none",
                  boxSizing: "border-box",
                  border: "none",
                }}
                defaultValue={config.data}
              />
            );
          }
        } catch (e) {
          return <div>{String(e)}</div>;
        }
      }
      if (component === "testing") {
        return <div className="tab_content">{node.getName()}</div>;
      }

      return null;
    },
    [onTableDragStart]
  );

  const onSelectLayout = React.useCallback(
    (event: React.FormEvent) => {
      const target = event.target as HTMLSelectElement;
      loadLayout(target.value);
    },
    [loadLayout]
  );

  const onReloadFromFile = React.useCallback(
    (_event: React.MouseEvent) => {
      if (layoutFile) {
        loadLayout(layoutFile, true);
      }
    },
    [layoutFile, loadLayout]
  );

  const onThemeChange = React.useCallback((event: React.FormEvent) => {
    const target = event.target as HTMLSelectElement;
    const theme = target.value;

    // For Tailwind dark mode compatibility, toggle the 'dark' class
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Keep the flexlayout theme class for any legacy compatibility
    const themeClassName = `flexlayout__theme_${theme}`;
    setPopoutClassName(themeClassName);
  }, []);

  const onFontSizeChange = React.useCallback((event: React.FormEvent) => {
    const target = event.target as HTMLSelectElement;
    setFontSize(target.value);

    const flexLayoutElement = document.querySelector(".flexlayout__layout") as HTMLElement | null;
    if (flexLayoutElement) {
      flexLayoutElement.style.setProperty("--font-size", target.value);
    }
  }, []);

  const createButton = React.useCallback(
    (title: string, key: string, handler: React.MouseEventHandler | undefined, content: React.ReactNode) => {
      return (
        <button
          type="button"
          className="flexlayout__tab_toolbar_button"
          title={title}
          key={key}
          style={{ display: "flex", alignItems: "center" }}
          onClick={handler}
        >
          {content}
        </button>
      );
    },
    []
  );

  const onRenderTab = React.useCallback(
    (node: TabNode, renderValues: ITabRenderValues) => {
      if (layoutFile === "newfeatures" && node.getComponent() === "newfeatures") {
        renderValues.buttons.push(createButton("Tab settings", "settingbtn", undefined, <SettingsIcon />));
      }

      if (layoutFile?.startsWith("test_")) {
        if (node.getId() === "onRenderTab1") {
          renderValues.leading = (
            <img alt="beep" src="images/settings.svg" key="1" style={{ width: "1em", height: "1em" }} />
          );
          renderValues.content = "onRenderTab1";
          renderValues.buttons.push(
            <img alt="beep" src="images/folder.svg" key="1" style={{ width: "1em", height: "1em" }} />
          );
        } else if (node.getId() === "onRenderTab2") {
          renderValues.leading = (
            <img alt="beep" src="images/settings.svg" key="1" style={{ width: "1em", height: "1em" }} />
          );
          renderValues.content = "onRenderTab2";
          renderValues.buttons.push(
            <img alt="beep" src="images/folder.svg" key="1" style={{ width: "1em", height: "1em" }} />
          );
        }
      }
    },
    [layoutFile, createButton]
  );

  const onRenderTabSet = React.useCallback(
    (node: TabSetNode | BorderNode, renderValues: ITabSetRenderValues) => {
      if (node instanceof TabSetNode) {
        if (layoutFile === "newfeatures") {
          const button = createButton(
            "Tabset menu",
            "menubtn",
            (e: React.MouseEvent<HTMLElement, MouseEvent>) => onContextMenu(node, e),
            <MenuIcon />
          );
          renderValues.leading = (
            <div style={{ display: "flex", alignItems: "center", alignContent: "center", padding: 3 }}>{button}</div>
          );
        }

        if (layoutFile === "newfeatures") {
          renderValues.buttons.push(createButton("Tabset settings", "settingbtn", undefined, <SettingsIcon />));
        }

        if (layoutFile === "default") {
          const button = createButton(
            "Add tab",
            "addtab",
            (_e: React.MouseEvent<HTMLElement, MouseEvent>) => onAddFromTabSetButton(node),
            <AddIcon />
          );
          renderValues.stickyButtons.push(button);
        }
      }

      if (layoutFile?.startsWith("test_")) {
        if (node.getId() === "onRenderTabSet1") {
          renderValues.buttons.push(<img alt="beep" src="images/folder.svg" key="1" />);
          renderValues.buttons.push(<img alt="beep" src="images/settings.svg" key="2" />);
        } else if (node.getId() === "onRenderTabSet2") {
          renderValues.buttons.push(<img alt="beep" src="images/folder.svg" key="1" />);
          renderValues.buttons.push(<img alt="beep" src="images/settings.svg" key="2" />);
        } else if (node.getId() === "onRenderTabSet3") {
          renderValues.stickyButtons.push(
            <img
              src="images/add.svg"
              alt="Add"
              key="Add button"
              title="Add Tab (using onRenderTabSet callback, see Demo)"
              style={{ marginLeft: 5, width: 24, height: 24 }}
            />
          );
        } else if (node instanceof BorderNode) {
          renderValues.buttons.push(<img alt="beep" src="images/folder.svg" key="1" />);
          renderValues.buttons.push(<img alt="beep" src="images/settings.svg" key="2" />);
        }
      }
    },
    [layoutFile, createButton, onContextMenu, onAddFromTabSetButton]
  );

  const onTabSetPlaceHolder = React.useCallback((_node: TabSetNode) => {
    return (
      <div
        key="placeholder"
        style={{
          display: "flex",
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Drag tabs to this area
      </div>
    );
  }, []);

  let contents: React.ReactNode = "loading ...";
  if (model !== null) {
    contents = (
      <Layout
        ref={layoutRef}
        model={model}
        popoutClassName={popoutClassName}
        popoutWindowName="Demo Popout"
        factory={factory}
        onAction={onAction}
        onRenderTab={onRenderTab}
        onRenderTabSet={onRenderTabSet}
        onRenderDragRect={onRenderDragRect}
        onExternalDrag={onExternalDrag}
        realtimeResize={realtimeResize}
        onContextMenu={layoutFile === "newfeatures" ? onContextMenu : undefined}
        onAuxMouseClick={layoutFile === "newfeatures" ? onAuxMouseClick : undefined}
        onTabSetPlaceHolder={onTabSetPlaceHolder}
      />
    );
  }

  return (
    <React.StrictMode>
      <ContextExample.Provider value="from context">
        <div className="app">
          <div className="toolbar" dir="ltr">
            <select className="toolbar_control" onChange={onSelectLayout}>
              <option value="default">Default</option>
              <option value="newfeatures">New Features</option>
              <option value="simple">Simple</option>
              <option value="mosaic">Mosaic Style</option>
              <option value="sub">SubLayout</option>
              <option value="complex">Complex</option>
            </select>
            <button
              type="button"
              key="reloadbutton"
              className="toolbar_control"
              onClick={onReloadFromFile}
              style={{ marginLeft: 5 }}
            >
              Reload
            </button>
            <div style={{ flexGrow: 1 }} />
            <span style={{ fontSize: "14px" }}>Realtime resize</span>
            <input name="realtimeResize" type="checkbox" checked={realtimeResize} onChange={onRealtimeResize} />
            <span style={{ marginLeft: 5, fontSize: "14px" }}>Show layout</span>
            <input name="show layout" type="checkbox" checked={showLayout} onChange={onShowLayout} />
            <select
              className="toolbar_control"
              style={{ marginLeft: 5 }}
              onChange={onFontSizeChange}
              defaultValue="medium"
            >
              <option value="xx-small">Size xx-small</option>
              <option value="x-small">Size x-small</option>
              <option value="small">Size small</option>
              <option value="medium">Size medium</option>
              <option value="large">Size large</option>
              <option value="8px">Size 8px</option>
              <option value="10px">Size 10px</option>
              <option value="12px">Size 12px</option>
              <option value="14px">Size 14px</option>
              <option value="16px">Size 16px</option>
              <option value="18px">Size 18px</option>
              <option value="20px">Size 20px</option>
              <option value="25px">Size 25px</option>
              <option value="30px">Size 30px</option>
            </select>
            <select className="toolbar_control" style={{ marginLeft: 5 }} defaultValue="light" onChange={onThemeChange}>
              <option value="light">Light</option>
              <option value="underline">Underline</option>
              <option value="gray">Gray</option>
              <option value="dark">Dark</option>
              <option value="rounded">Rounded</option>
            </select>
            <button type="button" className="toolbar_control" style={{ marginLeft: 5 }} onClick={onShowLayoutClick}>
              Show Layout JSON in Console
            </button>
            <button
              type="button"
              className="toolbar_control drag-from"
              data-id="add-drag"
              draggable={true}
              style={{ height: "30px", marginLeft: 5, border: "none", outline: "none" }}
              title="Add tab by starting a drag on a draggable element"
              onDragStart={onDragStart}
            >
              Add Drag
            </button>
            <button
              type="button"
              className="toolbar_control"
              data-id="add-active"
              style={{ marginLeft: 5 }}
              title="Add using Layout.addTabToActiveTabSet"
              onClick={onAddActiveClick}
            >
              Add Active
            </button>
          </div>
          <div className={`contents${showLayout ? " showLayout" : ""}`}>{contents}</div>
        </div>
      </ContextExample.Provider>
    </React.StrictMode>
  );
}

export default App;
