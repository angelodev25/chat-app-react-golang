export type Chat = {
    id: string
    otherProfileImage: string
    otherUsername: string
    otherUserID: string
    lastMessage: Message
    createdAt: string
}

export interface Message {
    id: string
    chatId: string
    senderId: string
    content: string
    timestamp: string
    readed: boolean
}