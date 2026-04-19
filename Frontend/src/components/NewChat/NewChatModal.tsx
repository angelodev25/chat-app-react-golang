import { type Dispatch, type SetStateAction } from 'react'
import { z } from "zod"
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Button, Divider, Input } from '@mui/material'
import { useChatsActions } from '@/hooks/useChatsActions'

interface formProps {
	setOpen: Dispatch<SetStateAction<boolean>>
}

const formSchema = z.object({
	username: z.string().optional(),
	email: z.string().optional().refine(
		(email) => email === "" || z.string().email().safeParse(email).success,
		"Email inválido"
	)
}).refine(data => data.username?.trim() !== "" || data.email?.trim() !== "", {
	message: "Debes proporcionar al menos un campo",
	path: ["username"] // Puedes poner el error en cualquier campo
})

export default function NewChatForm(props: formProps) {
	const { setOpen } = props
	const { createChat } = useChatsActions()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: "",
			email: ""
		}
	})

	const username = form.watch("username")
	const email = form.watch("email")

	const isFormValid = (username?.trim() !== "" || email?.trim() !== "") && (email?.trim() === "" || (email?.trim() !== "" && !form.formState.errors.email))

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await createChat(values.username ? values.username : "", values.email ? values.email : "")
			setOpen(false)
		} catch(e: any) {
			console.log(e)
		} 
	}

	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" >
					<div className="grid grid-cols-1">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nombre de usuario</FormLabel>
									<FormControl>
										<Input placeholder="Nombre de usuario" type="text" color='primary' {...field} sx={{
											backgroundColor: 'rgba(28, 31, 39, 0.82)',
											padding: "10px",
											'&:before': {
												borderBottomColor: 'rgba(255, 255, 255, 0.2)',
											},
											'&:hover:not(.Mui-disabled):before': {
												borderBottomColor: 'rgba(255, 255, 255, 0.42)',
											},
											'&:after': {
												borderBottomColor: '#9dd2c8',
											}
										}} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Divider sx={{
							'&::before, &::after': {
								borderColor: 'rgba(168, 164, 130, 0.46)',
							},
							color: "rgb(185, 221, 226)",
							my: 3,
						}} >O</Divider>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Correo Electrónico</FormLabel>
									<FormControl>
										<Input placeholder="Email" type="text" {...field} sx={{
											backgroundColor: 'rgba(28, 31, 39, 0.82)',
											padding: "10px",
											'&:before': {
												borderBottomColor: 'rgba(255, 255, 255, 0.2)',
											},
											'&:hover:not(.Mui-disabled):before': {
												borderBottomColor: 'rgba(255, 255, 255, 0.42)',
											},
											'&:after': {
												borderBottomColor: '#9dd2c8',
											}
										}} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button type="submit" variant='outlined' color='primary' disabled={!isFormValid} sx={{
						backgroundColor: '#0e2231d1',
						'&:hover': {
							backgroundColor: '#17232a',
						},
						'&.Mui-disabled': {
							backgroundColor: 'rgba(85, 86, 111, 0.3)', // Mismo color pero con opacidad
							color: 'rgba(179, 179, 179, 0.7)',
						}
					}}>
						Enviar solicitud
					</Button>
				</form>
			</Form>
		</div>
	)
}