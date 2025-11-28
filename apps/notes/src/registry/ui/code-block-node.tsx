"use client";

import { cn } from "@beep/notes/lib/utils";
import { useCopyToClipboard } from "@beep/notes/registry/hooks/use-copy-to-clipboard";

import { CheckIcon, ChevronDownIcon, FilesIcon } from "lucide-react";
import type { TCodeBlockElement } from "platejs";
import { NodeApi } from "platejs";
import {
  PlateElement,
  type PlateElementProps,
  PlateLeaf,
  type PlateLeafProps,
  useEditorRef,
  useElement,
  useReadOnly,
} from "platejs/react";
import * as React from "react";

import { BlockActionButton } from "./block-context-menu";
import { Button } from "./button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "./command";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function CodeBlockElement(props: PlateElementProps) {
  const { element } = props;
  const { copyToClipboard } = useCopyToClipboard();

  return (
    <PlateElement
      className={cn(
        "group my-1",
        "**:[.hljs-comment,.hljs-code,.hljs-formula]:text-[#6a737d]",
        "**:[.hljs-keyword,.hljs-doctag,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_]:text-[#d73a49]",
        "**:[.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_]:text-[#6f42c1]",
        "**:[.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable]:text-[#005cc5]",
        "**:[.hljs-regexp,.hljs-string,.hljs-meta_.hljs-string]:text-[#032f62]",
        "**:[.hljs-built_in,.hljs-symbol]:text-[#e36209]",
        "**:[.hljs-name,.hljs-quote,.hljs-selector-tag,.hljs-selector-pseudo]:text-[#22863a]",
        "**:[.hljs-emphasis]:italic",
        "**:[.hljs-strong]:font-bold",
        "**:[.hljs-section]:font-bold **:[.hljs-section]:text-[#005cc5]",
        "**:[.hljs-bullet]:text-[#735c0f]",
        "**:[.hljs-addition]:bg-[#f0fff4] **:[.hljs-addition]:text-[#22863a]",
        "**:[.hljs-deletion]:bg-[#ffeef0] **:[.hljs-deletion]:text-[#b31d28]"
      )}
      {...props}
    >
      <pre
        className="overflow-x-auto rounded-md bg-muted pt-[34px] pr-4 pb-8 pl-8 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid"
        data-plate-open-context-menu
      >
        <code>{props.children}</code>
      </pre>

      <div className="absolute top-2 left-2 z-10 h-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <CodeBlockCombobox />
      </div>

      <div
        className="absolute top-1 right-1 z-10 flex gap-px opacity-0 transition-opacity duration-300 select-none group-hover:opacity-100"
        contentEditable={false}
      >
        <Button
          size="blockAction"
          variant="blockActionSecondary"
          className="relative top-0 right-0 w-auto"
          onClick={() => {
            const lines = element.children.map((child) => NodeApi.string(child));
            copyToClipboard(lines.join("\n\n"), {
              tooltip: "Copied code to clipboard",
            });
          }}
        >
          <FilesIcon className="!size-3.5" />
          Copy
        </Button>

        <BlockActionButton variant="blockActionSecondary" defaultStyles={false} />
      </div>
    </PlateElement>
  );
}

function CodeBlockCombobox({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false);
  const readOnly = useReadOnly();
  const editor = useEditorRef();
  const element = useElement<TCodeBlockElement>();
  const value = element?.lang || "plaintext";
  const [searchValue, setSearchValue] = React.useState("");

  const items = React.useMemo(
    () =>
      languages.filter((language) => !searchValue || language.label.toLowerCase().includes(searchValue.toLowerCase())),
    [searchValue]
  );

  if (readOnly) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="none"
          variant="menuAction"
          className={cn(
            "h-5 w-auto justify-between gap-1 rounded-sm px-[5px] align-top text-xs text-muted-foreground select-none",
            className
          )}
          aria-expanded={open}
          contentEditable={false}
          role="combobox"
        >
          {languages.find((language) => language.value === value)?.label ?? "Plain Text"}
          <ChevronDownIcon className="!size-3 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" onCloseAutoFocus={() => setSearchValue("")}>
        <Command shouldFilter={false}>
          <CommandInput asChild value={searchValue} onValueChange={(value) => setSearchValue(value)}>
            <Input placeholder="Search language..." />
          </CommandInput>

          <CommandEmpty>No language found.</CommandEmpty>

          <CommandList className="h-[344px] overflow-y-auto">
            {items.map((language) => (
              <CommandItem
                key={language.label}
                className="cursor-pointer"
                value={language.value}
                onSelect={(value) => {
                  editor.tf.setNodes<TCodeBlockElement>({ lang: value }, { at: element });
                  setSearchValue(value);
                  setOpen(false);
                }}
              >
                <CheckIcon className={cn("mr-2 size-4", value === language.value ? "opacity-100" : "opacity-0")} />
                {language.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CodeLineElement(props: PlateElementProps) {
  return <PlateElement {...props} />;
}

export function CodeSyntaxLeaf(props: PlateLeafProps) {
  const tokenClassName = props.leaf.className as string;

  return <PlateLeaf {...props} className={tokenClassName} />;
}

const languages: { label: string; value: string }[] = [
  { label: "Auto", value: "auto" },
  { label: "Plain Text", value: "plaintext" },
  { label: "ABAP", value: "abap" },
  { label: "Agda", value: "agda" },
  { label: "Arduino", value: "arduino" },
  { label: "ASCII Art", value: "ascii" },
  { label: "Assembly", value: "x86asm" },
  { label: "Bash", value: "bash" },
  { label: "BASIC", value: "basic" },
  { label: "BNF", value: "bnf" },
  { label: "C", value: "c" },
  { label: "C#", value: "csharp" },
  { label: "C++", value: "cpp" },
  { label: "Clojure", value: "clojure" },
  { label: "CoffeeScript", value: "coffeescript" },
  { label: "Coq", value: "coq" },
  { label: "CSS", value: "css" },
  { label: "Dart", value: "dart" },
  { label: "Dhall", value: "dhall" },
  { label: "Diff", value: "diff" },
  { label: "Docker", value: "dockerfile" },
  { label: "EBNF", value: "ebnf" },
  { label: "Elixir", value: "elixir" },
  { label: "Elm", value: "elm" },
  { label: "Erlang", value: "erlang" },
  { label: "F#", value: "fsharp" },
  { label: "Flow", value: "flow" },
  { label: "Fortran", value: "fortran" },
  { label: "Gherkin", value: "gherkin" },
  { label: "GLSL", value: "glsl" },
  { label: "Go", value: "go" },
  { label: "GraphQL", value: "graphql" },
  { label: "Groovy", value: "groovy" },
  { label: "Haskell", value: "haskell" },
  { label: "HCL", value: "hcl" },
  { label: "HTML", value: "html" },
  { label: "Idris", value: "idris" },
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "JSON", value: "json" },
  { label: "Julia", value: "julia" },
  { label: "Kotlin", value: "kotlin" },
  { label: "LaTeX", value: "latex" },
  { label: "Less", value: "less" },
  { label: "Lisp", value: "lisp" },
  { label: "LiveScript", value: "livescript" },
  { label: "LLVM IR", value: "llvm" },
  { label: "Lua", value: "lua" },
  { label: "Makefile", value: "makefile" },
  { label: "Markdown", value: "markdown" },
  { label: "Markup", value: "markup" },
  { label: "MATLAB", value: "matlab" },
  { label: "Mathematica", value: "mathematica" },
  { label: "Mermaid", value: "mermaid" },
  { label: "Nix", value: "nix" },
  { label: "Notion Formula", value: "notion" },
  { label: "Objective-C", value: "objectivec" },
  { label: "OCaml", value: "ocaml" },
  { label: "Pascal", value: "pascal" },
  { label: "Perl", value: "perl" },
  { label: "PHP", value: "php" },
  { label: "PowerShell", value: "powershell" },
  { label: "Prolog", value: "prolog" },
  { label: "Protocol Buffers", value: "protobuf" },
  { label: "PureScript", value: "purescript" },
  { label: "Python", value: "python" },
  { label: "R", value: "r" },
  { label: "Racket", value: "racket" },
  { label: "Reason", value: "reasonml" },
  { label: "Ruby", value: "ruby" },
  { label: "Rust", value: "rust" },
  { label: "Sass", value: "scss" },
  { label: "Scala", value: "scala" },
  { label: "Scheme", value: "scheme" },
  { label: "SCSS", value: "scss" },
  { label: "Shell", value: "shell" },
  { label: "Smalltalk", value: "smalltalk" },
  { label: "Solidity", value: "solidity" },
  { label: "SQL", value: "sql" },
  { label: "Swift", value: "swift" },
  { label: "TOML", value: "toml" },
  { label: "TypeScript", value: "typescript" },
  { label: "VB.Net", value: "vbnet" },
  { label: "Verilog", value: "verilog" },
  { label: "VHDL", value: "vhdl" },
  { label: "Visual Basic", value: "vbnet" },
  { label: "WebAssembly", value: "wasm" },
  { label: "XML", value: "xml" },
  { label: "YAML", value: "yaml" },
];
