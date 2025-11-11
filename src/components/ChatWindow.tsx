import React, { useState, useRef, useEffect } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { useChats } from "../context/UseChatsContext";
import { FiRotateCcw } from "react-icons/fi";
import { BiX } from "react-icons/bi";
import { ChatbotOptions } from "../ChatbotOptions";
import { io, Socket } from "socket.io-client";
import VoiceInput from "./VoiceInput";
import './ChatWindow.css'
import {  FaArrowUp, FaVolumeUp } from "react-icons/fa";

// ✅ Create a single socket instance outside the component (shared)
// const socket: Socket = io("https://onita-unpercussed-kole.ngrok-free.dev", {
// const socket: Socket = io("http://localhost:3002", {
const socket: Socket = io('https://ishop-server-7di1.onrender.com',{
  transports: ["websocket"],
  reconnection: true,
});
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

interface PropType extends ChatbotOptions {
  setIsBotOpened: (v: boolean) => void;
}


interface isThinkingType{
  isTrue:boolean,
  id: string | number | undefined
}

const ChatBot: React.FC<PropType> = (props) => {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isThinking, setIsThinking] = useState<isThinkingType>({ isTrue: false, id: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContext = useChats();

  const normalizeMarkdown = (text: string) => {
  // Convert <a href="...png">text</a> → ![text](...)
  return text.replace(
    /<a href="([^"]+\.(?:png|jpg|jpeg|gif|webp))"[^>]*>(.*?)<\/a>/gi,
    "![$2]($1)"
  );
};

const cleanOllamaContent = (text = "") => {
  return text
    // remove Ollama's internal markers
    .replace(/<\|.*?\|>/g, "")
    // trim any excessive newlines/whitespace
    .trim();
};



  // Scroll to bottom whenever chats update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatContext.chats]);

  // Debugging connection status
  useEffect(() => {
    socket.on("connect", () => {
      //console.log("✅ Connected to Socket.IO:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, []);


  const [isInputEmpty, setIsInputEmpty] = useState(true);


  useEffect(() => {
  const handleBotMessage = (chunk: { content: string }) => {
    chatContext.setChats((prev) =>
      prev.map((msg) =>
        msg.id === isThinking.id ? { ...msg, query: chunk.content } : msg
      )
    );
  };

  const handleBotEnd = () => {
    chatContext.setChats(prev =>
      prev.map(msg =>
        msg.id === isThinking.id && msg.from === "system"
          ? { ...msg, completed: true }
          : msg
      )
    );
    setIsThinking({ id: 0, isTrue: false });
  };

  socket.on("bot_message", handleBotMessage);
  socket.on("bot_end", handleBotEnd);
  socket.on("bot_error", console.error);

  return () => {
    socket.off("bot_message", handleBotMessage);
    socket.off("bot_end", handleBotEnd);
    socket.off("bot_error", console.error);
  };
}, [isThinking.id]); // ✅ only re-run when thinkingId changes

const fileInputRef = useRef<HTMLInputElement>(null);

const [imgURL, setImgURL] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const selected = e.target.files?.[0];
  if (!selected) return;

  if (!selected.type.startsWith("image/")) {
    alert("Please upload an image file only.");
    return;
  }

  setFile(selected);
  // // Optionally show the image immediately in chat as preview
  const imgURL = URL.createObjectURL(selected);
  setImgURL(imgURL)
  // chatContext.setChats((prev) => [
  //   ...prev,
  //   { id: crypto.randomUUID(), query: imgURL, from: "user" },
  // ]);
};
const getFileBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
  useEffect(() => {
        if(query.trim().length > 0) setIsInputEmpty(false)
          else setIsInputEmpty(true)
  
    return () => {
      
    }
  }, [query])
  

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };

  const voiceOutput = (text:string) => {
  if (!window.speechSynthesis) {
    //console.error("Speech Synthesis not supported in this browser.");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
};



const handleSubmit = async () => {
  if (isThinking.isTrue) return;
  const userMessage = query.trim();

  // 🧩 If user uploaded a file, send it as well
  let imageBase64 = null;
  let imgURLPreview = null;

  if (file) {
    imageBase64 = await getFileBase64(file);
    imgURLPreview = URL.createObjectURL(file); // 👈 local preview
    setFile(null); // clear after sending
  }

  setQuery("");

  const thinkingId = crypto.randomUUID();

  // 🧠 Add image message if exists
  const newChats = [
    ...chatContext.chats,
    ...(userMessage
      ? [{ id: crypto.randomUUID(), query: userMessage, from: "user" as const }]
      : []),
    ...(imgURLPreview
      ? [{ id: crypto.randomUUID(), query: imageBase64, from: "user" as const }]
      : []),
    { id: thinkingId, query: "Thinking...", from: "system" as const },
  ];

  chatContext.setChats(newChats);
  setIsThinking({ id: thinkingId, isTrue: true });

  const messagesToSend = [
    {
      role: "system",
      content: `
        RULES:
        1. You are a helpful assistant for ${props.domain}.
        2. Be concise and friendly.
        3. Use ${props.data} for reference.
      `,
    },
    ...newChats.map((q) => ({
      role: q.from === "user" ? "user" : "assistant",
      content: q.query,
    })),
  ];

  socket.emit("user_message", {
    endpoints: props.apiSchema,
    messages: messagesToSend,
    authToken: localStorage.getItem("token") || "",
    domain: props.domain,
    extraData: props.data,
    file: imageBase64, // 🧩 send image if exists
  });

  setImgURL('')
};




  const sendMessage = (text?: string) => {
  if (isThinking.isTrue) return;
  //console.log('isThinking.id:',isThinking.id)

  // Use passed text (from VoiceInput) or current query
  const userMessage = text?.trim() || query.trim();
  if (!userMessage) return;

  // Clear input
  setQuery("");
  setIsThinking({ id: chatContext.chats.length, isTrue: true });


  // Add user message + thinking placeholder
  const newChats = [
    ...chatContext.chats,
    { id: crypto.randomUUID() , query: userMessage, from: "user" as const },
    { id: crypto.randomUUID() , query: "Thinking...", from: "system" as const },
  ];
  chatContext.setChats(newChats);

  // Prepare messages for backend
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

  //console.log("🚀 Sending user_message to backend:", messagesToSend);

  socket.emit("user_message", {
    endpoints: props.apiSchema,
    messages: messagesToSend,
    authToken: localStorage.getItem("token") || "",
  });
};

  if (!chatContext) {
    //console.error("ChatBot must be used within a ChatsProvider");
    return null;
  }

  return (
    <div
      className={`flex flex-col
        max-h-[90vh] h-[80vh] w-full xs:w-96 mx sm:mx-5 rounded-2xl overflow-hidden shadow-2xl border transition-colors duration-300
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
            <div key={id} className={`flex ${id} ${isUser ? "justify-end" : "justify-start"}`}>
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
  /^blob:|^data:image\//.test(q.query) ? (
    <img src={q.query} alt="User upload" className="max-w-full rounded-lg" />
  ) : (
    <MarkdownRenderer
      content={normalizeMarkdown(cleanOllamaContent(q.query))}
      theme={props.theme}
    />
  )
  ) : q.query.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
    <img
      src={q.query}
      alt="Generated"
      className="max-w-full rounded-lg"
    />
  ) : (
    <div>
      <MarkdownRenderer
        content={normalizeMarkdown(cleanOllamaContent(q.query))}
        theme={props.theme}
      />
     {q.from === "system" && q.completed && (
  <button
  className={`mt-2 flex justify-center items-center gap-2 p-1 text-sm rounded ${props.theme == 'dark' ? 'bg-gray-200 text-black' : 'bg-blue-500 text-white '}`}
    onClick={() =>
      voiceOutput(normalizeMarkdown(cleanOllamaContent(q.query)))
    }
  >
    <FaVolumeUp /> Read aloud
  </button>
)}

    </div>
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
        {
          
          imgURL &&
          <div className="relative w-fit">
          <img src={imgURL} className="w-32 h-32 mt-2 mb-2 rounded"/>
          <button className="absolute px-2 py-1 bg-red-500 rounded top-2 right-2" onClick={() => setImgURL('')}>X</button>
          </div>
        }
        <div className="flex items-end justify-center gap-2">
  {/* 🧩 Hidden file input */}
  <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handleFileChange}
  />

  {/* 🧩 Upload Button */}
  <button
    onClick={() => fileInputRef.current?.click()}
    className={`p-2 rounded-lg border ${
      props.theme === "dark"
        ? "border-gray-700 text-white hover:bg-slate-800"
        : "border-gray-300 text-gray-800 hover:bg-gray-100"
    }`}
    title="Upload image"
  >
    📷
  </button>


  <div className="flex-1 flex items-center relative">
    <textarea
      value={query}
      onChange={handleChange}
      placeholder="Type a message..."
      className={`border rounded-xl w-full p-2 pr-10 text-sm ${
        props.theme === "dark"
          ? "border-gray-700 bg-slate-800 text-white"
          : "border-gray-300 bg-white text-gray-900"
      }`}
      rows={1}
      onKeyDown={(e) => {
        if (!isMobile && e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (query.trim() || file) handleSubmit();
        }
      }}
    />

    {!isInputEmpty && (
      <button
        onClick={handleSubmit}
        className="absolute right-2 bottom-1 border-2 rounded-full p-1 text-blue-500 hover:text-blue-600 transition"
      >
        <FaArrowUp size={13} />
      </button>
    )}
  </div>

  {/* Voice input */}
  <VoiceInput
    onResult={(text) => {
      const newQuery = query ? query + " " + text : text;
      setQuery(newQuery);
      setTimeout(() => sendMessage(newQuery), 100);
    }}
  />
</div>

      </div>
    </div>
  );
};

export default ChatBot;
