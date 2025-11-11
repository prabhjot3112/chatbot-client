import React, { JSX } from "react";
import ReactMarkdown, { Components, ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
  theme: string | undefined;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, theme }) => {
  const isDark = theme === "dark";

  

  const components: Components = {
    code: (props: JSX.IntrinsicElements["code"] & ExtraProps & { inline?: boolean }) => {
      const { className, children, inline, ...restProps } = props;
      const codeString = String(children).replace(/\n$/, "");
      const match = /language-(\w+)/.exec(className || "");

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
                background: isDark ? "#1e293b" : "#f3f4f6",
              }}
            >
              {codeString}
            </SyntaxHighlighter>
            <button
              onClick={() => navigator.clipboard.writeText(codeString)}
              className={`absolute top-1 right-1 text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition ${
                isDark ? "bg-slate-700 text-white" : "bg-gray-200 text-black"
              }`}
            >
              Copy
            </button>
          </div>
        );
      }

      return (
        <code
          className={`${className} ${
            isDark ? "bg-slate-800 text-blue-300" : "bg-gray-100 text-blue-800"
          } px-1.5 py-0.5 rounded`}
          {...restProps}
        >
          {children}
        </code>
      );
    },

    // 🧱 Table styling
    table: (props) => (
      <div className="overflow-x-auto my-4">
        <table
          className={`min-w-full border rounded-lg text-left ${
            isDark ? "border-gray-700" : "border-gray-300"
          }`}
        >
          {props.children}
        </table>
      </div>
    ),
    thead: (props) => (
      <thead className={isDark ? "bg-slate-800 text-gray-100" : "bg-gray-200 text-gray-900"}>
        {props.children}
      </thead>
    ),
    tbody: (props) => (
      <tbody
        className={`divide-y ${isDark ? "divide-gray-700" : "divide-gray-300"}`}
      >
        {props.children}
      </tbody>
    ),
    th: (props) => (
      <th
        className={`px-4 py-2 text-left font-semibold ${
          isDark ? "text-gray-100" : "text-gray-900"
        }`}
      >
        {props.children}
      </th>
    ),

    // 👇 TD fix for images
    td: (props) => (
      <td
        className={`px-4 py-2 align-top ${
          isDark ? "text-gray-200" : "text-gray-800"
        }`}
      >
        {React.Children.map(props.children, (child) => {
          if (React.isValidElement(child) && child.type === "img") {
            const imgElement = child as React.ReactElement<
              React.ImgHTMLAttributes<HTMLImageElement>
            >;
            return React.cloneElement(imgElement, {
              ...imgElement.props,
              className: `max-w-full h-auto rounded-md my-2 object-contain border ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`,
            });
          }
          return child;
        })}
      </td>
    ),

   tr: (props) => (
  <tr
    className={`transition-colors ${
      isDark
        // 🧠 darker + lighter contrast for alternating rows
        ? "odd:bg-slate-800 even:bg-slate-700 hover:bg-slate-600"
        : "odd:bg-white even:bg-gray-50 hover:bg-gray-100"
    }`}
  >
    {props.children}
  </tr>
),

  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}
 rehypePlugins={[rehypeRaw]}
     components={components}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
