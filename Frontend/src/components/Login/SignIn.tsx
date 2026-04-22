import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useAuth } from "@/contexts/authContext"
import { useNavigate } from "react-router-dom"
import { Box, Button, Divider, TextField, Typography } from "@mui/material"
import type { Dispatch, SetStateAction } from "react"

const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres de largo" }),
})

interface Props {
	setIsLogin: Dispatch<SetStateAction<boolean>>
}

export default function SignIn(props: Props) {
	const { setIsLogin } = props
	const { login } = useAuth()
	const navigate = useNavigate()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onChange",
	})

	const { isValid } = form.formState

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const success = await login(values.email, values.password)
		if (success) return navigate("/")
	};

	return (
		<div>
			<Form
				{...form}
			>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" >
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
				<Typography sx={{ color: 'text.secondary', marginY: '15px' }}>o</Typography>
			</Divider>
			<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
				<Typography sx={{ textAlign: 'center' }}>
					¿No estás registrado?{' '}
					<Button variant='text' color='primary' onClick={() => setIsLogin(false)} >
						Crear cuenta
					</Button>
				</Typography>
			</Box>

		</div>
	)
}