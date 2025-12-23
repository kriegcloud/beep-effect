import { type FC, type JSX, useState } from "react";
import { Display } from "../display";
import { Editor, type IEditorProps } from "./Editor";
import type { IToolbarControls } from "./types";

type Meta<T> = { title: string; component: T; parameters?: object; decorators?: Array<(Story: FC) => JSX.Element> };
type StoryObj<_T> = { name?: string; render?: () => JSX.Element };

const meta: Meta<typeof Editor> = {
  title: "Editor/Editor",
  component: Editor,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Full-featured Lexical Editor with all plugins enabled. Includes toolbar, markdown shortcuts, code highlighting, tables, images, videos, and more.",
      },
    },
  },
  decorators: [(Story: FC) => <Story />],
};

export default meta;
type Story = StoryObj<typeof Editor>;

export const Default: Story = {
  name: "Default Editor",
  render: () => (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Editor />
    </div>
  ),
};

export const BottomToolbar: Story = {
  name: "Bottom Toolbar Editor",
  render: () => <Editor toolbarPlacement="bottom" />,
};

export const InContainer: Story = {
  name: "Editor in Container",
  render: () => (
    <div
      style={{
        maxWidth: "1200px",
        margin: "40px auto",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
      }}
    >
      <Editor />
    </div>
  ),
};

export const WithCustomHeight: Story = {
  name: "Editor with Fixed Height",
  render: () => (
    <div
      style={{
        maxWidth: "1200px",
        margin: "40px auto",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        height: "800px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Editor />
    </div>
  ),
};

export const Compact: Story = {
  name: "Compact Editor",
  render: () => (
    <div
      style={{
        maxWidth: "800px",
        margin: "20px auto",
        border: "1px solid #e0e0e0",
        borderRadius: "4px",
        backgroundColor: "#fff",
      }}
    >
      <Editor />
    </div>
  ),
};

export const WithMinimalControls: Story = {
  name: "Editor with Minimal Controls",
  render: () => {
    const minimalControls: IToolbarControls = {
      history: ["undo", "redo"],
      textFormat: ["bold", "italic", "underline"],
      blockFormat: ["paragraph", "h1", "h2", "h3"],
    };

    return (
      <div
        style={{
          maxWidth: "1200px",
          margin: "40px auto",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
        }}
      >
        <Editor controls={minimalControls} />
      </div>
    );
  },
};

export const WithCustomControls: Story = {
  name: "Editor with Custom Controls",
  render: () => {
    const customControls: IToolbarControls = {
      history: ["undo", "redo"],
      blockFormat: ["paragraph", "h1", "h2", "h3", "h4", "quote", "code"],
      textFormat: ["bold", "italic", "strikethrough", "link", "leftAlign", "centerAlign", "rightAlign"],
      viewFormat: ["image", "table"],
      clear: ["formatting"],
    };

    return (
      <div
        style={{
          maxWidth: "1200px",
          margin: "40px auto",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          backgroundColor: "#fff",
        }}
      >
        <Editor controls={customControls} />
      </div>
    );
  },
};

export const WithDisplay: Story = {
  name: "Editor with Display Component",
  render: () => {
    const [value, setValue] = useState("");

    const onChangeState: IEditorProps["onStateChange"] = (state) => {
      const json = JSON.stringify(state.toJSON());
      setValue(json);
    };

    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "40px auto",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
          }}
        >
          <Editor onStateChange={onChangeState} />
        </div>
        <div
          style={{
            padding: "20px 40px",
            minHeight: "300px",
            margin: "20px auto",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
          }}
        >
          <Display data={value} />
        </div>
      </div>
    );
  },
};
