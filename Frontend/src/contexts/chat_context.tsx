import type { Chat } from "@/types/message";
import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

interface ChatContextTypes {
    chats: Chat[]
    setChats: Dispatch<SetStateAction<Chat[]>>
}

const ChatContext = createContext<ChatContextTypes|undefined>(undefined)

function ChatProvider({children}: {children: ReactNode}) {
    const [chats, setChats] = useState<Chat[]>([])

   return (
        <ChatContext.Provider value={{ chats, setChats }}>
            {children}
        </ChatContext.Provider>
    )
}

function useChatContext() {
    const context = useContext(ChatContext)
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
}

export {ChatContext, ChatProvider, useChatContext}