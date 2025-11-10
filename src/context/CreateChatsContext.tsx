import { createContext, Dispatch, SetStateAction } from "react";
export interface ChatMessage {
  from: "user" | "system";
  generatedImageUrl?:string,
  query: string;
  file?: File;
  fileUrl?: string; // optional preview URL
  
}


export interface ChatsContextType {
  chats: ChatMessage[];
  setChats: Dispatch<SetStateAction<ChatMessage[]>>;
}

export const ChatsContext = createContext<ChatsContextType>({
  chats: [],
  setChats: () => {},
});
