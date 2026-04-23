import type { Chat } from "@/types/message"
import type { Dispatch, SetStateAction } from "react"

export type ContextMenu = {
    visible: boolean
    x: number
    y: number
    messageId: string
    messageSender: string
    content: string
}

export interface CustomContextMenuProps {
    setOpenDelete: Dispatch<SetStateAction<boolean>>
    setMessageId: Dispatch<SetStateAction<string|null>>
    setMessageSender: Dispatch<SetStateAction<string|null>>
}

export interface ChatProps {
    userId: string
    chat: Chat
    chats: Chat[]
    setChats: Dispatch<SetStateAction<Chat[]>>
    isMobile: boolean
    setCurrent?: () => void
}