import { useChatContext } from "@/contexts/chatContext";
import { useChatsActions } from "@/hooks/useChatsActions";
import type { Chat } from "@/types/message";
import { Button, Divider, IconButton, Tooltip } from "@mui/material";
import { Asterisk, LogOut, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../ui/dialog'
import NewChatForm from "../NewChat/NewChatModal";
import { useAuth } from "@/contexts/authContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import ConfirmDeleteChatDialog from "./ConfirmDeleteChat";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import ProfileSettings from "../ProfileSettings/ProfileSettings";
import AccountCircle from '@mui/icons-material/AccountCircle';

const API_URL = import.meta.env.VITE_API_URL

export function Sidebar({ setCurrent }: { setCurrent: Dispatch<SetStateAction<Chat | null>> }) {
	const { chats, setChats } = useChatContext()
	const { user, logOut } = useAuth()
	const { getChats } = useChatsActions()
	const [openCreate, setOpenCreate] = useState(false)
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

	return (
		<aside className="
			fixed right-0 top-0 
			w-100 h-screen 
			bg-gradient-to-b from-(--sidebar-gradient-start) to-(--sidebar-gradient-end)
			text-white
			p-4
			shadow-xl
			overflow-hidden
			z-50
			flex flex-col
		">

			{/* Perfil de usuario */}
			<div className="flex justify-between items-center top-0 left-0 right-0 p-2 rounded-lg bg-(--sidebar-user-info-background)">
				<div className="flex items-center space-x-3">
					<Sheet>
						<SheetTrigger>
							<div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center cursor-pointer">
								{user?.profileImage ? <img src={`${API_URL}${user?.profileImage}`} className="w-10 h-10 rounded-full" /> : <AccountCircle className="w-10 h-10 rounded-full" />}
							</div>
						</SheetTrigger>
						<SheetContent
							aria-describedby=""
							style={{ 
								width: '500px', 
								maxWidth: '90vw', 
								background: 'linear-gradient(to bottom, var(--profile-settings-gradient-start) 0%, var(--profile-settings-gradient-middle) 50%, var(--profile-settings-gradient-end) 100%)' 
							}}
							side="left"
						>
							<SheetHeader>
								<SheetTitle className="text-2xl" >Tu perfil</SheetTitle>
							</SheetHeader>
							<ProfileSettings />
						</SheetContent>
					</Sheet>
					<div>
						<p className="font-medium">{user?.profileName}</p>
						<p className="text-sm text-purple-200">{user?.username}</p>
					</div>
				</div>
				<div className="flex justify-end">
					<Button variant="text" startIcon={<LogOut />} onClick={logOut} >Salir</Button>
				</div>
			</div>

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
					return (
						<div key={chat.id} className="grid gap-y-5 p-1">
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
									<div className="flex w-80">
										<div className="flex  justify-between text-zinc-400 p-2">
											{chat.lastMessage.content.length > 36 ? chat.lastMessage.content.split("\n")[0].substring(0, 33) + "..." : chat.lastMessage.content}
										</div>
									</div>
								</div>

								{/* Menu desplegable al hacer hover sobre un chat */}
								<div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
										<DropdownMenuContent>
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
									<ConfirmDeleteChatDialog chatToDelete={chatToDelete} setChatToDelete={setChatToDelete} />
								</div>
							</div>
						</div>
					)
				})}
			</div>

			{/* Boton para crear nuevo chat */}
			<div className="w-full flex justify-end items-center">
				<Dialog open={openCreate} onOpenChange={setOpenCreate} >
					<DialogTrigger asChild>
						<Tooltip title="Comenzar nuevo chat" placement="left">
							<IconButton aria-label="Add new chat" size="large" color="primary" >
								<PlusCircle className="" />
							</IconButton>
						</Tooltip>
					</DialogTrigger>
					<DialogContent aria-describedby="">
						<DialogTitle>Busca a alguien para chatear</DialogTitle>
						<DialogDescription>Busca a alguien por su...</DialogDescription>
						<NewChatForm setOpen={setOpenCreate} />
					</DialogContent>
				</Dialog>
			</div>
		</aside>
	);
}