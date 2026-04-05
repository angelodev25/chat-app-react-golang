import { useAuth } from "@/contexts/auth.context"
import { Loader } from "lucide-react"
import type { JSX } from "react"
import { Navigate } from "react-router-dom"

function ProtectedRoute({children}: {children: JSX.Element}) {
	const {isAuthenticaded, loading} = useAuth()

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<Loader className="animate-spin h-10 w-10" />
				<p className="font-bold ml-3 text-slate-500" >Bienvenido</p>
			</div>
		)
	}

	if (!isAuthenticaded) return <Navigate to="/login" replace />

	return children
}

export default ProtectedRoute