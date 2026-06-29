import * as React from "react";
import ReactMarkdown from "react-markdown";

const components: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  p({ children }) {
    return <p className="mb-2 last:mb-0">{children}</p>;
  },
  pre({ children }) {
    return (
      <pre className="bg-elevated p-3 rounded-lg overflow-x-auto my-2 text-sm font-mono">
        {children}
      </pre>
    );
  },
  code({ children, className, ...props }) {
    if (className?.startsWith("language-")) {
      return <code {...props}>{children}</code>;
    }
    return (
      <code className="bg-elevated px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  ul({ children }) {
    return <ul className="list-disc pl-4 mb-2">{children}</ul>;
  },
  ol({ children }) {
    return <ol className="list-decimal pl-4 mb-2">{children}</ol>;
  },
  li({ children }) {
    return <li className="mb-1">{children}</li>;
  },
  a({ children, href, ...props }) {
    return (
      <a className="text-primary underline" href={href} {...props}>
        {children}
      </a>
    );
  },
  strong({ children }) {
    return <strong className="font-semibold">{children}</strong>;
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-2 border-border pl-3 text-muted italic">
        {children}
      </blockquote>
    );
  },
};

export const Markdown = React.memo(function Markdown({
  content,
  className,
}: {
  readonly content: string;
  readonly className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
});
