import { useChatContext } from "@/contexts/chatContext";
import { useChatsActions } from "@/hooks/useChatsActions";
import type { Chat } from "@/types/message";
import { Divider, IconButton } from "@mui/material";
import { Asterisk, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import ConfirmDeleteChatDialog from "./ConfirmDeleteChat";
import SidebarHeader from "./SidebarHeader/SidebarHeader";
import NewChatButton from "../NewChat/NewChatButton";

interface Props {
	setCurrent: (chat: Chat | null) => void
	isMobile: boolean
}

export function Sidebar(props: Props) {
	const { setCurrent, isMobile } = props
	const { chats, setChats } = useChatContext()
	const { getChats } = useChatsActions()
	const [deleted, setDeleted] = useState(false)
	const [chatToDelete, setChatToDelete] = useState<string | null>(null)

	const handleOpenChat = (currentChat: Chat) => {
		setCurrent(currentChat)
		setChats((prev) => prev.map((chat) =>
			currentChat.id === chat.id ? { ...chat, lastMessage: { ...chat.lastMessage, readed: true } } : chat
		))
	}

	useEffect(() => {
		getChats()
	}, [])

	useEffect(() => {
		if (deleted) {
			setCurrent(null)
			setDeleted(false)
		}
	}, [deleted])

	return (
		<aside className={`
			fixed right-0 top-0 
			${isMobile ? "w-screen px-4" : "w-100 px-4"} h-full
			bg-gradient-to-b from-(--sidebar-gradient-start) to-(--sidebar-gradient-end)
			text-white
			shadow-xl
			overflow-hidden
			z-50 pt-safe pb-safe
			flex flex-col
		`}>

			{/* Perfil de usuario */}
			<SidebarHeader />

			{/* Título del sidebar */}
			<div className="mb-5 mt-5">
				<h2 className="text-2xl text-center font-bold">Chats</h2>
			</div>

			<Divider variant="middle" className="bg-slate-500" />

			<div className="flex-1 flex flex-col min-h-0 mt-2">
				{chats.length === 0 &&
					<div className="flex w-full h-130 justify-center items-center">
						<p className="flex text-center text-xl">Aún no has tenido ninguna conversación</p>
					</div>
				}

				{/* Chats */}
				{chats.length !== 0 && chats.map((chat) => {
					const maxMessageLength = isMobile ? 30 : 40
					return (
						<div key={chat.id} className="grid my-1">
							<div className="group relative bg-(--sidebar-chat-background) rounded-lg gap-y-2 p-3 max-h-[80px] hover:bg-(--sidebar-chat-background)/50 transition-all animation-all cursor-pointer">
								<div onClick={() => handleOpenChat(chat)}>
									<div className="flex gap-x-4 items-center">
										<h4 className="text-xl font-bold">{chat.otherUsername}</h4>
										{!chat.lastMessage.readed &&
											<div className="rounded-full w-6 h-6 bg-[#4489a5d9] text-white flex justify-center items-center text-[10px] p-1">
												<Asterisk className="h-4 w-4" />
											</div>
										}
									</div>
									<div className="flex">
										<div className="flex  justify-between text-zinc-400 p-2">
											{chat.lastMessage.content.length > maxMessageLength ? chat.lastMessage.content.split("\n")[0].substring(0, maxMessageLength - 3) + "..." : chat.lastMessage.content}
										</div>
									</div>
								</div>

								{/* Menu desplegable al hacer hover sobre un chat */}
								<div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<IconButton
												size="small"
												sx={{
													backgroundColor: 'rgba(0,0,0,0.6)',
													'&:hover': {
														backgroundColor: 'rgba(0,0,0,0.8)',
													}
												}}
											>
												<MoreHorizontal className="h-4 w-4" />
											</IconButton>
										</DropdownMenuTrigger>
										<DropdownMenuContent side="left">
											<DropdownMenuItem onSelect={(e) => {
												e.preventDefault()
												setChatToDelete(chat.id)
											}}>
												<div className="flex justify-between items-center gap-x-2">
													<Trash2 className="h-4 w-4" />
													Eliminar
												</div>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
									<ConfirmDeleteChatDialog chatToDelete={chatToDelete} setChatToDelete={setChatToDelete} setDeleted={setDeleted} />
								</div>
							</div>
						</div>
					)
				})}
			</div>

			{/* Boton para crear nuevo chat */}
			<NewChatButton />
		</aside>
	);
}