import ReactDOM from "react-dom/client";
import Chatbot1 from "./components/Chatbot1";
import "./index.css";
import { ChatsProvider } from "./context/ChatsContext";
import { ChatbotOptions } from "./ChatbotOptions";



declare global {
  interface Window {
    initChatbot?: (options?: ChatbotOptions) => void;
  }
}

// ✅ Create a global init function
window.initChatbot = function initChatbot(options = {}) {
  if (document.getElementById("chatbot-container")) return;

  const container = document.createElement("div");
  container.id = "chatbot-container";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.zIndex = "99999";

  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  root.render(
    <ChatsProvider>
      <Chatbot1
        apiSchema={options.apiSchema}
        theme={options.theme}
        chatbotName={options.chatbotName}
        type="first"
        domain={options.domain}
        data={options.data}
      />
    </ChatsProvider>
  );

  console.log("[Chatbot] Initialized with options:", options);
};
