import type { User } from "@/types/user";
import axios from "axios";
import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL

interface UserContextTypes {
	user: User | null
	userId: string | undefined
	isAuthenticaded: boolean
	loading: boolean
	setUser: Dispatch<SetStateAction<User | null>>
	login: (email: string, password: string) => Promise<boolean>;
	signUp: (values: any, file: File | null) => Promise<boolean>;
	logOut: () => void
}

const UserContext = createContext<UserContextTypes | undefined>(undefined)

function UserProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const token = localStorage.getItem("token_chat")
		if (token) {
			axios.get(`${API_URL}/api/user/verify`, {
				headers: { Authorization: token }
			})
				.then(response => {
					setUser(response.data.user);
				})
				.catch(() => {
					localStorage.removeItem('token_chat');
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			setLoading(false);
		}
	}, [])

	const login = async (email: string, password: string) => {
		try {
			const res = await axios.post(`${API_URL}/api/user/login`, { email, password })
			const { token, user } = res.data
			localStorage.setItem("token_chat", token)
			setUser(user)
			toast.success("Hecho!")
			return true
		} catch (e: any) {
			console.log(e)
			toast.error(e.response?.data?.error || "Ocurrió un error deconocido :(")
			return false
		}
	}

	const signUp = async (values: any, file: File | null) => {
		try {
			const formData = new FormData()
			formData.append('file', file ? file : "")
			formData.append('name', values.name)
			formData.append('email', values.email)
			formData.append('password', values.password)

			const res = await axios.post(`${API_URL}/api/user/register`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
			})

			const { token, user } = res.data
			localStorage.setItem("token_chat", token)
			setUser(user)
			toast.success("Hecho!")
			return true
		} catch (e: any) {
			console.log(e)
			toast.error(e.response?.data?.error || "Ocurrió un error deconocido :(")
			return false
		}
	}

	const logOut = () => {
		localStorage.removeItem("token_chat")
		setUser(null)
	}

	return (
		<UserContext.Provider value={{
			user,
			userId: user?.id,
			isAuthenticaded: !!user,
			loading,
			login,
			signUp,
			setUser,
			logOut
		}}>
			{children}
		</UserContext.Provider>
	)
}

function useAuth() {
	const context = useContext(UserContext)
	if (context === undefined) {
		throw new Error("useUer must be used within a UserProvider");
	}
	return context;
}

export { UserContext, UserProvider, useAuth }