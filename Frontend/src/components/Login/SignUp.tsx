import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useAuth } from "@/contexts/authContext"
import { useNavigate } from "react-router-dom"
import { Box, Button, Divider, styled, TextField, Typography } from "@mui/material"
import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { toast } from "sonner"
import { CloudUploadIcon } from "lucide-react"

const formSchema = z.object({
	name: z.string().min(3, { message: "El nombre debe tener al menos tres caracteres" }),
	email: z.string().email(),
	profileImage: z.string(),
	password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres de largo" }),
})

interface Props {
	setIsLogin: Dispatch<SetStateAction<boolean>>
}

function SignUp(props: Props) {
	const { setIsLogin } = props
	const { signUp } = useAuth()
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const navigate = useNavigate()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			profileImage: "",
			password: "",
		},
		mode: "onChange",
	})

	const { isValid } = form.formState

	const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null
		const maxFileSizeMB = 4
		setSelectedFile(file)

		if (file) {
			if (file.size > maxFileSizeMB * 1024 * 1024) {
				toast.error("Archivo muy grande")
				setSelectedFile(null)
				return
			}
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl)
			}
			const preview = URL.createObjectURL(file)
			setPreviewUrl(preview)
			console.log(selectedFile)
			console.log(preview)
			form.setValue("profileImage", preview)
		} else {
			setPreviewUrl(null)
		}
	}

	useEffect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl)
			}
		}
	}, [])

	const VisuallyHiddenInput = styled('input')({
		clip: 'rect(0 0 0 0)',
		clipPath: 'inset(50%)',
		height: 1,
		overflow: 'hidden',
		position: 'absolute',
		bottom: 0,
		left: 0,
		whiteSpace: 'nowrap',
		width: 1,
	});

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const success = await signUp(values, selectedFile)
		if (success) return navigate("/")
	};

	return (
		<div>
			<Form
				{...form}
			>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" >
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto custom-scroll">
						<FormField
							control={form.control}
							name="profileImage"
							render={({ }) => (
								<FormItem>
									<FormLabel className="text-[17px]">Imagen de perfil</FormLabel>
									<FormControl>
										<div>
											{previewUrl ? (
												<div className="flex flex-col items-center gap-2">
													<div className="relative group">
														<img src={previewUrl} className="w-30 h-30 rounded-full border-1 border-gray-200 group-hover:border-blue-400 transition-all" />
														<label
															htmlFor='profile-image-input'
															className="absolute inset-0 flex items-center justify-center bg-black/60 bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
														>
															<CloudUploadIcon className="text-white" />
														</label>
														<VisuallyHiddenInput
															id="profile-image-input"
															type='file'
															accept='image/*'
															onChange={(e) => handleChangeFile(e)}
														/>
													</div>
												</div>
											) : (
												<Button
													component="label"
													role={undefined}
													variant="outlined"
													tabIndex={-1}
													startIcon={<CloudUploadIcon />}
												>
													Seleccionar
													<VisuallyHiddenInput
														type='file'
														accept='image/*'
														onChange={(e) => handleChangeFile(e)}
													/>
												</Button>
											)}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="grid gap-y-3">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel htmlFor="name">Nombre de perfil</FormLabel>
										<FormControl>
											<TextField
												autoComplete="name"
												required
												fullWidth
												id="name"
												placeholder="Jack Reacher"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel htmlFor="email">Email</FormLabel>
										<FormControl>
											<TextField
												required
												fullWidth
												id="email"
												placeholder="tucorreo@email.com"
												autoComplete="email"
												variant="outlined"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel htmlFor="password">Contraseña</FormLabel>
										<FormControl>
											<TextField
												fullWidth
												placeholder="••••••"
												type="password"
												id="password"
												autoComplete="new-password"
												variant="outlined"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						disabled={!isValid}
					>
						Crear
					</Button>
				</form>
			</Form>
			<Divider>
				<Typography sx={{ color: 'text.secondary', marginY: '15px' }}>o</Typography>
			</Divider>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Typography sx={{ textAlign: 'center' }}>
					¿Ya estás registrado?{' '}
					<Button variant="text" onClick={() => setIsLogin(true)} >Iniciar sesión</Button>
				</Typography>
			</Box>
		</div>
	)
}

export default SignUp