import { useChatContext } from "@/contexts/chatContext"
import axios from "axios"
import { toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL

export function useChatsActions() {
	const { setChats } = useChatContext()
	const token = localStorage.getItem("token_chat")
	const getChats = async () => {
		try {
			const res = await axios.get(`${API_URL}/api/chats`, { headers: { Authorization: token } })
			const data = res.data.chats
			if (data !== null) {
				setChats(Array.isArray(data) ? data : [data])
			} else {
				console.log("No hay datos en la respuesta.")
				setChats([])
			}
		} catch (e: any) {
			console.log(e)
			toast.error("Error loading chats")
		}
	}

	const createChat = async (name: string, email: string) => {
		try {
			const res = await axios.post(`${API_URL}/api/chats`,{ username: name, email: email}, {headers: {Authorization: token} })
			const chat = res.data.chat
			setChats((prev) => [...prev, chat])
		} catch (e: any) {
			console.log(e)
			toast.error(e.response?.data?.error || "Ocurrió un error desconocido :(")
		}
	}

	const deleteChat = async (id: string) => {
		try {
			const res = await axios.delete(`${API_URL}/api/chat/${id}`, {headers: {Authorization: token} })
			console.log(res.data)
			toast.info("Chat eliminado correctamente")
		} catch (e: any) {
			console.log(e)
			toast.error(e.response?.data?.error || "Ocurrió un error desconocido :(")
		}
	} 

	return {
		getChats,
		createChat,
		deleteChat
	}
}
