import { useAuth } from "@/contexts/auth.context"
import useUserActions from "@/hooks/useUserActions";
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Input } from "@mui/material";
import { Check, Edit3, Mail, X } from "lucide-react";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL

function ProfileSettings() {
	const { user } = useAuth()
	const [openImage, setOpenImage] = useState(false)
	const [editProfileName, setEditProfileName] = useState(false)
	const [editUsername, setEditUsername] = useState(false)
	const [newProfileName, setNewProfileName] = useState<string | null>(user?.profileName!)
	const [newUsername, setNewUsername] = useState<string | null>(user?.username!)
	const { updateUsername, updateProfileName } = useUserActions()

	return (
		<div className="flex flex-col h-full">
			{/* Sección 1: Imagen de perfil - Centrada independiente */}
			<div className="flex justify-center py-8">
				<div
					className="w-50 h-50 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
					onClick={() => setOpenImage(true)}
				>
					{user?.profileImage ?
						<img src={`${API_URL}${user?.profileImage}`} className="w-50 h-50 rounded-full object-cover" />
						:
						<AccountCircle className="w-45 h-45 rounded-full" />}
				</div>
			</div>

			{/* Sección 2: Información del perfil - En columnas */}
			<div className="flex-1 px-6">
				<div className="grid grid-cols-2 gap-8">
					{/* Columna izquierda: Nombre de perfil */}
					<div>
						<div className="flex gap-x-3 items-center mb-2">
							<h2 className="font-bold text-gray-400">Nombre de perfil</h2>
							<div className="w-5 h-5 flex justify-center items-center rounded-md hover:bg-gray-300/20">
								<Edit3 className="w-4 h-4 cursor-pointer" onClick={() => setEditProfileName(true)} />
							</div>
						</div>

						<div className="relative min-h-[48px]">
							{/* Input en modo edición */}
							<div
								className={`
									absolute inset-0 transition-all duration-200 ease-out
									${editProfileName
										? 'opacity-100 translate-y-0'
										: 'opacity-0 -translate-y-2 pointer-events-none'
									}
								`}
							>
								<div className="flex gap-x-3 items-center">
									<Input
										value={newProfileName}
										onChange={(e) => setNewProfileName(e.target.value)}
										className="flex-1"
										autoFocus
									/>
									<Check
										className="w-4 h-4 cursor-pointer hover:text-green-500 transition-colors"
										onClick={async () => {
											if (newProfileName) {
												await updateProfileName(newProfileName)
											}
											setNewProfileName(null)
											setEditProfileName(false)
										}}
									/>
									<X
										className="w-4 h-4 text-red-600 cursor-pointer hover:text-red-400 transition-colors"
										onClick={() => {
											setEditProfileName(false)
											setNewProfileName(null)
										}}
									/>
								</div>
							</div>

							{/* Texto en modo visualización */}
							<div
								className={`
									transition-all duration-200 ease-out
									${!editProfileName
										? 'opacity-100 translate-y-0'
										: 'opacity-0 translate-y-2 pointer-events-none'
									}
								`}
							>
								<p className="text-2xl font-bold text-slate-400">{user?.profileName}</p>
							</div>
						</div>
					</div>
					{/* Columna derecha: Nombre de usuario */}
					<div>
						<div className="flex gap-x-3 items-center mb-2">
							<h2 className="font-bold text-gray-400">Nombre de Usuario</h2>
							<div className="w-5 h-5 flex justify-center items-center rounded-md hover:bg-gray-300/20">
								<Edit3 className="w-4 h-4 cursor-pointer" onClick={() => setEditUsername(true)} />
							</div>
						</div>

						<div className="relative min-h-[48px]">
							{/* Input en modo edición */}
							<div
								className={`
									absolute inset-0 transition-all duration-200 ease-out
									${editUsername
										? 'opacity-100 translate-y-0'
										: 'opacity-0 -translate-y-2 pointer-events-none'
									}
								`}
							>
								<div className="flex gap-x-3 items-center">
									<Input
										value={newUsername || user?.username}
										onChange={(e) => setNewUsername(e.target.value)}
										className="flex-1"
										autoFocus
									/>
									<Check
										className="w-4 h-4 cursor-pointer hover:text-green-500 transition-colors"
										onClick={async () => {
											if (newUsername) {
												await updateUsername(newUsername)
											}
											setNewProfileName(null)
											setEditUsername(false)
										}}
									/>
									<X
										className="w-4 h-4 text-red-600 cursor-pointer hover:text-red-400 transition-colors"
										onClick={() => {
											setEditUsername(false)
											setNewUsername(null)
										}}
									/>
								</div>
							</div>

							{/* Texto en modo visualización */}
							<div
								className={`
									transition-all duration-200 ease-out
									${!editUsername
										? 'opacity-100 translate-y-0'
										: 'opacity-0 translate-y-2 pointer-events-none'
									}
								`}
							>
								<p className="text-2xl font-bold text-slate-400">{user?.username}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Sección 3: Más elementos (puedes agregar más cosas aquí) */}
				<div className="mt-4 pt-6 border-t border-gray-700">
					<div className="flex gap-x-3 items-center mb-3" >  
						<Mail className="w-5 h-5" />
						<h3 className="font-bold text-gray-400">Email</h3>
					</div>
					<p className="text-slate-400 ml-2">{user?.email}</p>
				</div>
			</div>

			{/* Modal de imagen */}
			{openImage && (
				<div
					className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
					onClick={() => setOpenImage(false)}
				>
					<button
						className="absolute top-4 right-4 text-white hover:text-gray-300"
						onClick={() => setOpenImage(false)}
					>
						<X className="w-8 h-8" />
					</button>
					{user?.profileImage ? (
						<img
							src={`${API_URL}${user?.profileImage}`}
							className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
							alt="Foto de perfil"
							onClick={(e) => e.stopPropagation()}
						/>
					) : (
						<AccountCircle className="w-64 h-64 text-gray-400" />
					)}
				</div>
			)}
		</div>
	)
}

export default ProfileSettings