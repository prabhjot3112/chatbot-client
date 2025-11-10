import React, { useState, useRef, useEffect } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { useChats } from "../context/UseChatsContext";
import { FiRotateCcw } from "react-icons/fi";
import { BiX } from "react-icons/bi";
import { ChatbotOptions } from "../ChatbotOptions";
import { io, Socket } from "socket.io-client";
import VoiceInput from "./VoiceInput";

// ✅ Create a single socket instance outside the component (shared)
const socket: Socket = io("http://localhost:3002", {
  transports: ["websocket"],
  reconnection: true,
});

interface PropType extends ChatbotOptions {
  setIsBotOpened: (v: boolean) => void;
}

const ChatBot: React.FC<PropType> = (props) => {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isThinking, setIsThinking] = useState({ isTrue: false, id: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContext = useChats();

  // Scroll to bottom whenever chats update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatContext.chats]);

  // Debugging connection status
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, []);

  // Listen for bot messages only once
  useEffect(() => {
    const handleBotMessage = (chunk: { content: string }) => {
      console.log("📩 bot_message:", chunk);
      chatContext.setChats((prev) => {
        const lastBotIndex = prev.findIndex(
          (q) => q.from === "system" && q.query === "Thinking..."
        );
        if (lastBotIndex !== -1) {
          const updated = [...prev];
          updated[lastBotIndex] = {
            ...updated[lastBotIndex],
            query: chunk.content,
          };
          return updated;
        }
        return prev;
      });
    };

    const handleBotEnd = () => {
      console.log("✅ Bot finished response");
      setIsThinking({ id: -1, isTrue: false });
    };

    const handleBotError = (errMsg: string) => {
      console.error("❌ Bot error:", errMsg);
      chatContext.setChats((prev) =>
        prev.map((q) =>
          q.query === "Thinking..." ? { ...q, query: errMsg } : q
        )
      );
      setIsThinking({ id: -1, isTrue: false });
    };

    socket.on("bot_message", handleBotMessage);
    socket.on("bot_end", handleBotEnd);
    socket.on("bot_error", handleBotError);

    return () => {
      socket.off("bot_message", handleBotMessage);
      socket.off("bot_end", handleBotEnd);
      socket.off("bot_error", handleBotError);
    };
  }, [chatContext]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      console.log("📁 Selected file:", selectedFile);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isThinking.isTrue) return;
    if (e.key !== "Enter" || !query.trim()) return;
    e.preventDefault();

    const userMessage = query.trim();
    setQuery("");
    setIsThinking({ id: chatContext.chats.length + 1, isTrue: true });

    const newChats = [
      ...chatContext.chats,
      { query: userMessage, from: "user" as const },
      { query: "Thinking...", from: "system" as const },
    ];
    chatContext.setChats(newChats);

    const messagesToSend = [
      {
        role: "system",
        content: `
          RULES:
          1. You are a helpful assistant for ${props.domain}.
          2. Answer only questions related to this domain.
          3. Be concise and friendly (1–3 lines).
          4. Use ${props.data} for reference.
        `,
      },
      ...newChats.map((q) => ({
        role: q.from === "user" ? "user" : "assistant",
        content: q.query,
      })),
    ];

    console.log("🚀 Sending user_message to backend:", messagesToSend);

    socket.emit("user_message", {
      endpoints: props.apiSchema,
      messages: messagesToSend,
      authToken: localStorage.getItem("token") || "",
    });
  };

  if (!chatContext) {
    console.error("ChatBot must be used within a ChatsProvider");
    return null;
  }

  return (
    <div
      className={`flex flex-col 
        max-h-[90vh] h-[80vh] w-full sm:w-96 mx sm:mx-5 rounded-2xl overflow-hidden shadow-2xl border transition-colors duration-300
        ${
          props.theme === "dark"
            ? "bg-slate-900 border-gray-800 text-white"
            : "bg-white border-gray-100 text-gray-900"
        }`}
    >
      {/* Header */}
      <div
        className={`px-6 py-4 flex gap-4 items-center justify-between
        ${
          props.theme === "dark"
            ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h1 className="text-white font-bold text-base">
            {props.chatbotName || "Chat Assistant"}
          </h1>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => chatContext.setChats([])}
            className="p-2 rounded-lg hover:bg-white/10"
            title="Reset conversation"
          >
            <FiRotateCcw className="w-4 h-4 text-white/70 hover:text-white" />
          </button>
          <button
            onClick={() => props.setIsBotOpened(false)}
            className="p-2 rounded-lg hover:bg-white/10"
            title="Close chat"
          >
            <BiX className="w-4 h-4 text-white/70 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Chat body */}
      <div
        className={`flex-1 overflow-y-auto p-4 flex flex-col gap-3
        ${
          props.theme === "dark" ? "bg-slate-900" : "bg-white"
        }`}
      >
        {chatContext.chats.map((q, id) => {
          const isUser = q.from === "user";
          return (
            <div key={id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-4 py-2.5 rounded-2xl break-words transition-colors duration-300 ${
                  isUser
                    ? `${
                        props.theme === "dark"
                          ? "bg-blue-500 text-white"
                          : "bg-blue-600 text-white"
                      } rounded-br-none max-w-[80%]`
                    : `${
                        props.theme === "dark"
                          ? "bg-slate-800 text-white"
                          : "bg-gray-100 text-gray-900"
                      } rounded-bl-none`
                }`}
              >
                {q.query && (
  isUser ? (
    <MarkdownRenderer content={q.query} />
  ) : (
    q.query.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
      <img
        src={q.query}
        alt="Generated"
        className="max-w-full rounded-lg"
      />
    ) : (
      <MarkdownRenderer content={q.query} />
    )
  )
)}

              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className={`p-4 border-t transition-colors duration-300 ${
          props.theme === "dark"
            ? "border-gray-800 bg-slate-900"
            : "border-gray-100 bg-white"
        }`}
      >
        <div className="flex items-end justify-center gap-2">
          <input type="file" id="file-select" className="hidden" onChange={handleFileChange} />
          {file && <p className="text-xs truncate w-16 mt-1">{file.name}</p>}
<div className="flex justify-center gap-2 items-center w-full">

          <textarea
            value={query}
            onChange={handleChange}
            onKeyDown={handleSubmit}
            placeholder="Type a message..."
            className={`border rounded-xl w-full p-2 focus:outline-none resize-none text-sm ${
              props.theme === "dark"
              ? "border-gray-700 focus:border-blue-500 bg-slate-800 text-white"
              : "border-gray-300 focus:border-blue-500 bg-white text-gray-900"
            }`}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
            }}
          />
          <VoiceInput onResult={(text) => setQuery(prev => prev + " " + text) }/>
              </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
