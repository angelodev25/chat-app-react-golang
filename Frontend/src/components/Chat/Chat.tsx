import { useChatContext } from "@/contexts/chatContext"
import useMessagesActions from "@/hooks/useMessagesActions"
import type { Chat } from "@/types/message"
import { Box, Skeleton, TextField } from "@mui/material"
import { Copy, Send, Trash2 } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard"

type Props = {
	userId: string
	chat: Chat
}

const API_URL = import.meta.env.VITE_API_URL

export default function ChatArea(props: Props) {
	const { chat, userId } = props
	const { chats, setChats } = useChatContext()
	const [message, setMessage] = useState("")
	const { messages, setMessages, loading, deleteMessage } = useMessagesActions(chat.id)
	const [contextMenu, setContextMenu] = useState<{
		visible: boolean
		x: number
		y: number
		messageId: string
		content: string
	} | null>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const { copyToClipboard } = useCopyToClipboard()
	const token = localStorage.getItem("token_chat")
	const wsRef = useRef<WebSocket | null>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		try {
			const ws = new WebSocket(`ws://10.7.0.38:8080/api/ws/${chat.id}?token=${token}`);
			ws.onopen = () => {
				console.log("Websocket conectado.")
				ws.send(JSON.stringify({ "code": "readed", "content": "", "target": "" }))
			}

			ws.onmessage = (event) => {
				const message = JSON.parse(event.data);
				setMessages((prev) => [...prev, message]);
				setChats(chats.map((toUpdate) => toUpdate.id === chat.id ? { ...toUpdate, lastMessage: message } : toUpdate))
			}

			wsRef.current = ws
		} catch (e: any) {
			console.log(e)
		}
		return () => wsRef.current?.close();
	}, [chat.id])

	// Cerrar menú contextual al hacer click fuera
	useEffect(() => {
		const handleClickOutside = () => {
			setContextMenu(null)
		}
		
		const handleScroll = () => {
			setContextMenu(null)
		}

		if (contextMenu?.visible) {
			document.addEventListener('click', handleClickOutside)
			document.addEventListener('scroll', handleScroll, true)
		}

		return () => {
			document.removeEventListener('click', handleClickOutside)
			document.removeEventListener('scroll', handleScroll, true)
		}
	}, [contextMenu?.visible])

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const sendMessage = () => {
		try {
			wsRef.current?.send(JSON.stringify({ "code": "send", "content": message, "target": chat.otherUserID }))
			setMessage('');
		} catch (e: any) {
			console.log(e)
			toast.error("Error al enviar mensaje.", { description: e.message })
		}
	}

	const handleEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault()
			if (message.trim()) {
				sendMessage()
			}
		}
	}

	const handleClick = () => {
		if (message.trim()) {
			sendMessage()
		}
	}

	const handleCopyMessage = (content: string) => {
		copyToClipboard(content)
		setContextMenu(null)
	}

	const handleDeleteMessage = async (messageId: string) => {
		if (confirm("¿Estás seguro de que quieres eliminar este mensaje?")) {
			await deleteMessage(chat.id, messageId)
		}
		setContextMenu(null)
	}

	const handleContextMenu = (e: React.MouseEvent, messageId: string, content: string) => {
		e.preventDefault()
		setContextMenu({
			visible: true,
			x: e.clientX,
			y: e.clientY,
			messageId,
			content
		})
	}

	return (
		<div className="w-full bg-(--chat-box-background) rounded-[20px] flex flex-col overflow-hidden h-full"
			style={{ height: 'calc(100vh - 2rem)' }}>
			{/* Header */}
			<div className="flex p-2 mb-3 border-b border-gray-500 flex-shrink-0" >
				{chat.otherProfileImage ? <img src={`${API_URL}${chat.otherProfileImage}`} className="w-10 h-10 rounded-full" /> : <AccountCircle className="w-10 h-10 rounded-full" />}
				<h2 className="text-xl font-bold px-5 py-2 flex-shrink-0">
					{chat.otherUsername}
				</h2>
			</div>

			{/* Área de mensajes */}
			<div className="flex-1 overflow-y-auto min-h-0 custom-scroll">
				{loading ? (
					<div className="w-full grid grid-cols-1 gap-y-4 p-4" >
						<div className="flex justify-start">
							<Box sx={{ width: "90vh" }}>
								<Skeleton animation="wave" />
								<Skeleton animation="wave" />
								<Skeleton animation="wave" />
							</Box>
						</div>
						<div className="flex justify-end">
							<Box sx={{ width: "90vh" }}>
								<Skeleton animation="wave" />
								<Skeleton animation="wave" />
								<Skeleton animation="wave" />
							</Box>
						</div>
					</div>
				) : (
					<div className="w-full">
						{messages?.map((msg) => {
							if (msg) {
								const fecha = new Date(msg.timestamp)
								const hora = fecha.toLocaleTimeString('es-ES', {
									hour: '2-digit',
									minute: '2-digit',
									hour12: true
								});
								
								if (msg.senderId === "server") {
									return (
										<div key={msg.id} className="flex w-full justify-center my-2">
											<p className="py-1 px-3 rounded-[30px] inline-block max-w-[70%] break-word text-gray-400 bg-[#171921]">
												{msg.content}
												<br />
												<span className="text-[10px] flex justify-center text-[#636975]" >{hora}</span>
											</p>
										</div>
									)
								}
								
								return (
									<div
										key={msg.id}
										className={`m-2 flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
										onContextMenu={(e) => handleContextMenu(e, msg.id, msg.content)}
									>
										<div className="relative group max-w-[70%]">
											<p className={`p-3 rounded-[30px] ${msg.senderId === userId ? 'bg-(--own-message) hover:bg-[#232a35bf]' : 'bg-(--other-message) hover:bg-[#334a4b99]'} 
												text-white transition-all duration-200 cursor-context-menu
											`}>
												{msg.content}
												<br />
												<span className="text-[10px] flex justify-end text-[#636975] mt-1">
													{hora}
												</span>
											</p>
										</div>
									</div>
								)
							}
						})}
						<div ref={messagesEndRef} />
					</div>
				)}
			</div>

			{/* Input fijado al fondo */}
			<div className="flex-shrink-0 mt-auto">
				<TextField
					className="w-full px-4 py-2"
					type="text"
					color="primary"
					variant="filled"
					placeholder="Envía un mensaje"
					onChange={(e) => setMessage(e.target.value)}
					onKeyDown={(e) => handleEnter(e)}
					value={message}
					maxRows={4}
					multiline
					sx={{
						'& .MuiFilledInput-root': {
							color: 'white',
							backgroundColor: 'var(--chat-input)',
							'&:before': {
								borderBottomColor: 'rgba(255,255,255,0.5)'
							},
							'&:after': {
								borderBottomColor: 'white'
							},
							'&:hover:before': {
								borderBottomColor: 'white'
							}
						},
						'& .MuiInputLabel-filled': {
							color: 'rgba(137, 154, 157, 0.7)'
						},
						'& .MuiFilledInput-input': {
							color: 'white'
						},
						'& .MuiInputBase-inputMultiline': {
							color: 'white'
						}
					}}
					slotProps={{
						input: {
							endAdornment: (
								<div className="w-7 h-7 flex hover:bg-slate-600/50 rounded-full items-center cursor-pointer" onClick={handleClick} >
									<Send className="w-5 h-5 ml-1" />
								</div>
							)
						}
					}}
				/>
			</div>

			{/* Menú contextual personalizado */}
			{contextMenu?.visible && (
				<div
					className="fixed z-50 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-1 min-w-[160px]"
					style={{ 
						top: contextMenu.y, 
						left: contextMenu.x,
						transform: 'translate(0, 0)'
					}}
				>
					<button
						className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 text-gray-200 flex items-center gap-2 transition-colors"
						onClick={() => handleCopyMessage(contextMenu.content)}
					>
						<Copy className="h-4 w-4" />
						<span>Copiar texto</span>
					</button>
					
					<button
						className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700 text-red-400 flex items-center gap-2 transition-colors"
						onClick={() => handleDeleteMessage(contextMenu.messageId)}
					>
						<Trash2 className="h-4 w-4" />
						<span>Eliminar mensaje</span>
					</button>
				</div>
			)}
		</div>
	)
}