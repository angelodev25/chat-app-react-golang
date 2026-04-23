import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import type { ContextMenu, CustomContextMenuProps } from "../types";
import { Copy, Trash2 } from "lucide-react";
import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "@/contexts/authContext";

export default function useCustomContesxtMenu(contextMenu: ContextMenu | null, setContextMenu: Dispatch<SetStateAction<ContextMenu | null>>) {
	const {userId} = useAuth()

	const handleContextMenu = (e: React.MouseEvent, messageId: string, sender: string, content: string) => {
		e.preventDefault()
		const menuWidth = 160
		let x = e.clientX
		let y = e.clientY

		if (sender === userId) {
			x = e.clientX - menuWidth
		}

		// Evitar que el menú se salga por la izquierda o derecha
		const windowWidth = window.innerWidth;
		if (x < 10) x = 10;
		if (x + menuWidth > windowWidth - 10) x = windowWidth - menuWidth - 10;

		setContextMenu({
			visible: true,
			x,
			y,
			messageId,
			messageSender: sender,
			content
		});
	};

	const CustomContextMenu = (props: CustomContextMenuProps) => {
		const { setOpenDelete, setMessageId, setMessageSender } = props
		const { copyToClipboard } = useCopyToClipboard()

		const handleCopyMessage = (content: string) => {
			copyToClipboard(content)
			setContextMenu(null)
		}

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

		return (
			<div>
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
							onClick={() => {
								setMessageId(contextMenu.messageId)
								setMessageSender(contextMenu.messageSender)
								setContextMenu(null)
								setOpenDelete(true)
							}}
						>
							<Trash2 className="h-4 w-4" />
							Eliminar mensaje
						</button>
					</div>
				)}
			</div>
		)
	}

	return {
		CustomContextMenu,
		handleContextMenu
	}
}