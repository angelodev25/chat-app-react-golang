import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { z } from "zod"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Logo } from '@/components/Logo/Logo';
import React, { useEffect, useState } from 'react';
import { CloudUploadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth.context';
import { useNavigate } from 'react-router-dom';

const signInFormSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6, { message: "The password must contain at least 6 characters" }),
})

const signUpFormSchema = z.object({
	name: z.string().min(3, { message: "El nombre debe tener al menos tres caracteres" }),
	email: z.string().email(),
	profileImage: z.string(),
	password: z.string().min(6, { message: "The password must contain at least 6 characters" }),
})

const Card = styled(MuiCard)(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	alignSelf: 'center',
	width: '100%',
	padding: theme.spacing(4),
	gap: theme.spacing(2),
	margin: 'auto',
	backgroundColor: 'rgba(4, 11, 28, 0.59)',
	boxShadow:
		'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
	[theme.breakpoints.up('sm')]: {
		width: '450px',
	},
	...theme.applyStyles('dark', {
		boxShadow:
			'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
	}),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
	height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
	minHeight: '100%',
	padding: theme.spacing(2),
	[theme.breakpoints.up('sm')]: {
		padding: theme.spacing(4),
	},
	'&::before': {
		content: '""',
		display: 'block',
		position: 'absolute',
		zIndex: -1,
		inset: 0,
		backgroundImage:
			'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
		backgroundRepeat: 'no-repeat',
		...theme.applyStyles('dark', {
			backgroundImage:
				'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
		}),
	},
}));

export default function Login() {
	const [isLogin, setIsLogin] = useState(true)
	const [loading, setLoading] = useState(false)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const { login, signUp } = useAuth()
	const navigate = useNavigate()

	const formSignIn = useForm<z.infer<typeof signInFormSchema>>({
		resolver: zodResolver(signInFormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onChange",
	})

	const formSignUp = useForm<z.infer<typeof signUpFormSchema>>({
		resolver: zodResolver(signUpFormSchema),
		defaultValues: {
			name: "",
			email: "",
			profileImage: "",
			password: "",
		},
		mode: "onChange",
	})

	const { isValid } = isLogin ? formSignIn.formState : formSignUp.formState;

	const changeLogin = () => {
		setLoading(true)

		setTimeout(() => {
			setLoading(false)
			setIsLogin(!isLogin)
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl)
			}
			setPreviewUrl(null)
		}, 1200)
	}

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
			formSignUp.setValue("profileImage", preview)
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

	const onSubmitSignIn = async (values: z.infer<typeof signInFormSchema>) => {
		const success = await login(values.email, values.password)
		if (success) return navigate("/")
	};

	const onSubmitSignUp = async (values: z.infer<typeof signUpFormSchema>) => {
		const success = await signUp(values, selectedFile)
		if (success) return navigate("/")
	};

	return (
		<div className="flex justify-center items-center" >
			<SignUpContainer direction="column" justifyContent="space-between">
				<Card variant="outlined">
					<Logo />
					{loading ? (
						<div className="flex justify-center items-center h-full">
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'>
							</div>
						</div>
					) : (
						<div>
							<Typography
								component="h1"
								variant="h4"
								sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', marginBottom: '20px' }}
							>
								{isLogin ? <p>Iniciar Sesión</p> : <p>Crear una cuenta</p>}
							</Typography>

							{/* Apartados de SignIn y SignUp */}
							{isLogin ? (
								<div>
									<Form
										{...formSignIn}
									>
										<form onSubmit={formSignIn.handleSubmit(onSubmitSignIn)} className="space-y-8" >
											<FormField
												control={formSignIn.control}
												name="email"
												render={({ field }) => (
													<FormItem>
														<FormLabel htmlFor="email">Email</FormLabel>
														<FormControl>
															<TextField
																required
																fullWidth
																id="email"
																placeholder="your@email.com"
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
												control={formSignIn.control}
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
											<Button
												type="submit"
												fullWidth
												variant="contained"
												disabled={!isValid}
											>
												Iniciar
											</Button>
										</form>
									</Form>
									<Divider>
										<Typography sx={{ color: 'text.secondary', marginY: '15px' }}>or</Typography>
									</Divider>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
										<Typography sx={{ textAlign: 'center' }}>
											¿No estás registrado?{' '}
											<Button variant='text' color='primary' onClick={changeLogin} >
												Crear cuenta
											</Button>
										</Typography>
									</Box>

								</div>
							) : (
								<div>
									<Form
										{...formSignUp}
									>
										<form onSubmit={formSignUp.handleSubmit(onSubmitSignUp)} className="space-y-8" >
											<div className="grid grid-cols-2 gap-4">
												<FormField
													control={formSignUp.control}
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
														control={formSignUp.control}
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
														control={formSignUp.control}
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
														control={formSignUp.control}
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
										<Typography sx={{ color: 'text.secondary', marginY: '15px' }}>or</Typography>
									</Divider>
									<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
										<Typography sx={{ textAlign: 'center' }}>
											¿Ya estás registrado?{' '}
											<Button variant="text" onClick={changeLogin} >Iniciar sesión</Button>
										</Typography>
									</Box>
								</div>
							)
							}
						</div>
					)}
				</Card>
			</SignUpContainer>
		</div >
	);
} 