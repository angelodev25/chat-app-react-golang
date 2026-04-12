import { useAuth } from "@/contexts/authContext"
import useUserActions from "@/hooks/useUserActions";
import AccountCircle from '@mui/icons-material/AccountCircle';
import { AccordionDetails, accordionDetailsClasses, AccordionSummary, Fade, Input, Typography } from "@mui/material";
import { Check, CheckCircle, Edit3, Loader2, Mail, X } from "lucide-react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion, {
	type AccordionSlots,
	accordionClasses,
} from '@mui/material/Accordion';
import { useState } from "react";
import 'react-lazy-load-image-component/src/effects/blur.css';
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useUserPreferences } from "@/contexts/userPreferencesContext";
import { useTheme } from "@/contexts/themeContext";

const API_URL = import.meta.env.VITE_API_URL

function ProfileSettings() {
	const { user } = useAuth()
	const [openImage, setOpenImage] = useState(false)
	const [editProfileName, setEditProfileName] = useState(false)
	const [editUsername, setEditUsername] = useState(false)
	const [newProfileName, setNewProfileName] = useState<string | null>(user?.profileName!)
	const [newUsername, setNewUsername] = useState<string | null>(user?.username!)
	const { updateUsername, updateProfileName } = useUserActions()
	const [expanded, setExpanded] = useState(false);
	const { changeBackground, image } = useUserPreferences()
	const backgrounds = ["image_1.jpg", "image_2.jpg", "image_3.jpg"]
	const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
	const { setTheme } = useTheme()

	const handleImageLoad = (img: string) => {
		setLoadingImages(prev => ({ ...prev, [img]: false }));
	};

	const handleExpansion = () => {
		setExpanded(!expanded)
	};

	return (
		<div className="flex flex-col h-full overflow-y-auto custom-scroll">
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
								{user && user?.profileName.length > 15 ? <p className="text-2xl font-bold text-slate-400">{user?.profileName.substring(0,13) + "..."}</p> : 
								<p className="text-2xl font-bold text-slate-400">{user?.profileName}</p>}
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
										value={newUsername}
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
								{user && user?.username.length > 15 ? <p className="text-2xl font-bold text-slate-400">{user?.username.substring(0,13) + "..."}</p> : 
								<p className="text-2xl font-bold text-slate-400">{user?.username}</p>}
							</div>
						</div>
					</div>
				</div>

				<div className="flex gap-x-3 items-center py-5 px-2 border-t border-gray-700">
					<Mail className="w-5 h-5" />
					<h3 className="font-bold text-gray-400">Email</h3>
					<p className="text-slate-400 ml-2">{user?.email}</p>
				</div>
				<div className="border-t border-gray-700">
					<div className="py-3" style={{ minHeight: '180px' }}>
						<Accordion
							expanded={expanded}
							onChange={handleExpansion}
							slots={{ transition: Fade as AccordionSlots['transition'] }}
							slotProps={{ transition: { timeout: 400 } }}
							sx={[
								{
									backgroundColor: "transparent",
									boxShadow: 'none',
									'&:before': {
										display: 'none',
									},
								},
								expanded
									? {
										[`& .${accordionClasses.region}`]: { height: 'auto', },
										[`& .${accordionDetailsClasses.root}`]: { display: 'block', },
									}
									: {
										[`& .${accordionClasses.region}`]: { height: 0, },
										[`& .${accordionDetailsClasses.root}`]: { display: 'none', },
									},
							]}
						>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="panel1-content"
								id="panel1-header"
							>
								<Typography component="span">Seleccionar el fondo de la aplicación</Typography>
							</AccordionSummary>
							<AccordionDetails>
								<div className="flex gap-3 flex-wrap" >
									{backgrounds.map((img, index) => {
										const isLoading = loadingImages[img] !== false;
										const theme = img === 'image_1.jpg' ? 'black' : img === 'image_2.jpg' ? 'blue' : 'cyan'
										return (
											<div key={index} className="relative flex cursor-pointer" onClick={() => {
												changeBackground(img)
												setTheme(theme)
												}} >
												{isLoading && (
													<div className="w-30 h-20 flex items-center justify-center bg-gray-800 rounded-md shadow-md">
														<Loader2 className="animate-spin text-cyan-500 w-6 h-6" />
													</div>
												)}

												<LazyLoadImage
													alt={`miniatura-${index}`}
													effect="blur"
													src={`/backgrounds/${img}`}
													className={`w-30 h-20 object-cover rounded-md shadow-md ${isLoading ? 'hidden' : 'block'}`}
													onLoad={() => handleImageLoad(img)}
												/>
												{image === img && (
													<div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-cyan-500/50 flex items-center justify-center" >
														<CheckCircle className="text-white w-4 h-4" />
													</div>
												)}
											</div>
										)
									})}
								</div>
							</AccordionDetails>
						</Accordion>
					</div>
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