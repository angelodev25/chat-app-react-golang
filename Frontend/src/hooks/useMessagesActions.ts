import type { Message } from "@/types/message"
import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL

export default function useMessagesActions(chatId: string) {
	const [messages, setMessages] = useState<Message[]>([])
	const [loading, setLoading] = useState(false)
	const token = localStorage.getItem("token_chat")

	const loadMessages = async () => {
		setLoading(true)
		try {
			const res = await axios.get(`${API_URL}/api/chat/${chatId}`, { headers: { Authorization: token } })
			const list = Array.isArray(res.data.messages) ? res.data.messages : [res.data.messages]
			setMessages(list)
		} catch (e: any) {
			console.log(e)
			toast.error("Cannot load chat")
		} finally {
			setLoading(false)
		}
	}

	const deleteMessage = async (chatId: string, messageId: string) => {
		try {
			const res = await axios.delete(`${API_URL}/api/chat/${chatId}/msg/${messageId}`, { headers: { Authorization: token }})
			setMessages((prev) => prev.filter(msg => msg.id !== res.data.id))
		} catch (e: any) {
			console.log(e)
			toast.error(e.response?.data?.error || "No se pudo borrar el mensaje")
		}
	}

	useEffect(() => {
		loadMessages()
	}, [chatId])

	return { messages, loading, loadMessages, setMessages, deleteMessage }
}
