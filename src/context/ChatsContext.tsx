import  { useState, type ReactNode } from "react";
import { ChatsContext, ChatMessage } from "./CreateChatsContext";


interface PropType {
    children: ReactNode
}

export const ChatsProvider = ({children} : PropType) => {
    const [chats, setChats] = useState<ChatMessage[]>([]);
    return <ChatsContext.Provider value={{chats , setChats}}>{children}</ChatsContext.Provider>
}