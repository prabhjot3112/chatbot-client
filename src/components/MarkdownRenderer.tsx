import React, { type JSX } from "react";
import ReactMarkdown, { type Components, type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const components: Components = {
    code: (props: JSX.IntrinsicElements["code"] & ExtraProps & { inline?: boolean }) => {
      const { className, children, inline, ...restProps } = props;
      const codeString = String(children).replace(/\n$/, "");
      const match = /language-(\w+)/.exec(className || "");
      // Block code with language
      if (!inline && match) {
        return (
          <div className="relative group my-2">
            <SyntaxHighlighter
              language={match[1]}
              style={atomDark}
              customStyle={{
                borderRadius: "0.375rem",
                padding: "0.5rem",
                margin: 0,
                fontSize: "0.875rem",
              }}
            >
              {codeString}
            </SyntaxHighlighter>
            <button
              onClick={() => navigator.clipboard.writeText(codeString)}
              className="absolute top-1 right-1 text-xs bg-gray-200 text-black px-1 rounded opacity-0 group-hover:opacity-100 transition"
            >
              Copy
            </button>
          </div>
        );
      }

      // Inline code
      return (
        <code className={className} {...restProps}>
          {children}
        </code>
      );
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
