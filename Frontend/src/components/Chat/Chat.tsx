import useMessagesActions from "@/hooks/useMessagesActions"
import { Box, Button, Skeleton, TextField } from "@mui/material"
import { ArrowLeft, Send } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import type { ChatProps, ContextMenu } from "./types"
import useCustomContesxtMenu from "./CustomContextMenu/CustomContextMenu"

const API_URL = import.meta.env.VITE_API_URL
const WS_URL = import.meta.env.VITE_WS_URL

export default function ChatArea(props: ChatProps) {
	const { chat, userId, setChats, isMobile, setCurrent } = props
	const { messages, setMessages, loading } = useMessagesActions(chat.id)
	const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)
	const { CustomContextMenu, handleContextMenu } = useCustomContesxtMenu(contextMenu, setContextMenu)
	const [message, setMessage] = useState("")
	const [openDelete, setOpenDelete] = useState(false)
	const [messageId, setMessageId] = useState<string | null>(null)
	const [messageSender, setMessageSender] = useState<string | null>(null)
	const chatId = chat.id
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const token = localStorage.getItem("token_chat")
	const wsRef = useRef<WebSocket | null>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		try {
			const ws = new WebSocket(`${WS_URL}/${chatId}?token=${token}`);
			ws.onopen = () => {
				ws.send(JSON.stringify({ "code": "readed", "content": "", "target": "" }))
			}

			ws.onmessage = (event) => {
				const data = JSON.parse(event.data);
				switch (data.code) {
					case "message":
						handleNewMessage(data.message)
						break
					case "delete":
						handleRemoveMessage(data.id)
						break
					default:
						console.log("codigo inválido")
				}
			}

			wsRef.current = ws
		} catch (e: any) {
			console.log(e)
		}
		return () => wsRef.current?.close();
	}, [chat.id])

	const handleNewMessage = (message: any) => {
		setMessages((prev) => [...prev, message]);
		setChats((prevChats) =>
			prevChats.map((c) =>
				c.id === chatId ? { ...c, lastMessage: message } : c
			)
		);
	}

	const handleRemoveMessage = (id: any) => {
		setMessages((currentMessages) => {
			const filteredMessages = currentMessages.filter((msg) => msg.id !== id)

			setChats((prevChats) => {
				const currentChat = prevChats.find((c) => c.id === chatId)
				if (currentChat?.lastMessage.id === id) {
					const newLastMessage = filteredMessages[filteredMessages.length - 1]
					return prevChats.map((c) =>
						c.id === chatId ? { ...c, lastMessage: newLastMessage } : c
					)
				}
				return prevChats
			})

			return filteredMessages
		})
	}

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const sendMessage = () => {
		try {
			wsRef.current?.send(JSON.stringify({ "code": "send", "content": message, "target": chat.otherUserID }))
			setMessage('');
		} catch (e: any) {
			console.log(e)
			toast.error("Error al enviar mensaje:(. Intenta en un rato")
		}
	}

	const deleteMessage = async (scope: string) => {
		try {
			wsRef.current?.send(JSON.stringify({ "code": `delete-${scope}`, "content": messageId, "target": chat.otherUserID }))
			setOpenDelete(false)
		} catch (e: any) {
			console.log(e)
			toast.error("Ocurrió un error eliminando el mensaje:(. Intenta en un rato")
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

	return (
		<div className="w-full bg-(--chat-box-background) rounded-[20px] flex flex-1 flex-col overflow-hidden"
			style={{ height: `calc(100dvh - 2rem)` }}
		>
			{/* Header */}
			<div className="flex items-center justify-between p-2 mb-3 border-b border-gray-500 flex-shrink-0">
				<div className="flex items-center">
					{chat.otherProfileImage ? (
						<img src={`${API_URL}${chat.otherProfileImage}`} className="w-10 h-10 rounded-full" />
					) : (
						<AccountCircle className="w-10 h-10 rounded-full" />
					)}
					<h2 className="text-xl font-bold px-5 py-2">
						{chat.otherUsername}
					</h2>
				</div>

				{isMobile && setCurrent && (
					<div
						className="w-9 h-9 flex justify-center items-center hover:bg-gray-400/30 rounded-full cursor-pointer"
						onClick={() => setCurrent()}
					>
						<ArrowLeft className="w-7 h-7 text-gray-300" />
					</div>
				)}
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
											<p className="py-2 px-3 leading-[1.2] whitespace-pre-wrap rounded-[30px] inline-block max-w-[70%] break-word text-gray-400 text-center bg-[#171921]">
												{msg.content}
												<br />
												<span className="text-[11px] flex justify-center text-[#777777]" >{hora}</span>
											</p>
										</div>
									)
								}

								return (
									<div
										key={msg.id}
										className={`m-2 flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
										onContextMenu={(e) => handleContextMenu(e, msg.id, msg.senderId, msg.content)}
									>
										<div className="relative group max-w-[70%]">
											<p className={`px-3 py-2 leading-[1.2] whitespace-pre-wrap rounded-[30px] ${msg.senderId === userId ? 'bg-(--own-message) hover:bg-[#232a35bf]' : 'bg-(--other-message) hover:bg-(--other-message-hover)'} 
												text-white transition-all duration-200 cursor-context-menu
											`}>
												{msg.content}
												<br />
												<span className="text-[11px] flex justify-end text-[#777777] mt-1">
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
			<CustomContextMenu setOpenDelete={setOpenDelete} setMessageId={setMessageId} setMessageSender={setMessageSender} />

			<Dialog open={openDelete} onOpenChange={setOpenDelete} >
				<DialogContent aria-describedby="">
					<DialogHeader>
						<DialogTitle>Eliminar mensaje</DialogTitle>
					</DialogHeader>
					<div className="flex justify-end gap-x-5 py-4">
						{messageSender === userId && (
							<Button variant="contained" color="error" onClick={() => deleteMessage("all")} >Eliminar para todos</Button>
						)}
						<Button variant="outlined" color="error" onClick={() => deleteMessage("single")} >Sólo para mí</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}