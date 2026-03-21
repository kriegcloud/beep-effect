import { memo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

type MarkdownProps = {
  content: string;
};

export const Markdown = memo(function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <code className={className} {...props}>
              {children}
            </code>
          ) : (
            <code
              className="bg-muted px-1.5 py-0.5 rounded-none text-xs font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },
        a({ children, ...props }) {
          return (
            <a
              className="text-primary hover:underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          );
        },
        blockquote({ children, ...props }) {
          return (
            <blockquote
              className="border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground"
              {...props}
            >
              {children}
            </blockquote>
          );
        },
        ul({ children, ...props }) {
          return (
            <ul
              className="list-disc list-outside ml-6 space-y-2 my-4"
              {...props}
            >
              {children}
            </ul>
          );
        },
        ol({ children, ...props }) {
          return (
            <ol
              className="list-decimal list-outside ml-6 space-y-2 my-4"
              {...props}
            >
              {children}
            </ol>
          );
        },
        h1({ children, ...props }) {
          return (
            <h1
              className="text-xl font-extrabold mt-6 mb-3 tracking-tight"
              {...props}
            >
              {children}
            </h1>
          );
        },
        h2({ children, ...props }) {
          return (
            <h2 className="text-lg font-bold mt-5 mb-3" {...props}>
              {children}
            </h2>
          );
        },
        h3({ children, ...props }) {
          return (
            <h3 className="text-base font-semibold mt-4 mb-2" {...props}>
              {children}
            </h3>
          );
        },
        p({ children, ...props }) {
          return (
            <p className="mb-4 leading-relaxed last:mb-0" {...props}>
              {children}
            </p>
          );
        },
        pre({ children, ...props }) {
          return (
            <pre
              className="bg-muted p-4 rounded-none overflow-x-auto my-4 border border-border"
              {...props}
            >
              {children}
            </pre>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
});
