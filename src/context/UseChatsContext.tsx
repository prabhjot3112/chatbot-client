import { useContext } from "react"
import { ChatsContext } from "./CreateChatsContext"

export const useChats = () =>  useContext(ChatsContext)