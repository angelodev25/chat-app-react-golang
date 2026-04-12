import { useAuth } from "@/contexts/authContext"
import { useToastPromise } from "@/utils/showPromiseToast"
import axios from "axios"
import { toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL

export default function useUserActions() {
    const {user, setUser} = useAuth()
    const {showToast} = useToastPromise()
    const token = localStorage.getItem("token_chat")

    const updateProfileName = async (name: string) => {
        try {
            showToast("Actualizando...")
            const res = await axios.put(`${API_URL}/api/user/update`, {...user!, profileName: name} , {headers: {Authorization: `Bearer ${token}`}})
            setUser(res.data.user)
            toast.success("Nombre de perfil actualizado")
        }catch(e: any) {
            console.log(e)
            toast.error(e.response?.data?.error || "Ocurrió un error inesperado :(")
        }
    }

    const updateUsername = async (username: string) => {
        try {
            showToast("Actualizando...")
            const res = await axios.put(`${API_URL}/api/user/update`, {...user!, username: username}, {headers: {Authorization: `Bearer ${token}`}})
            setUser(res.data.user)
            toast.success("Nombre de usuario actualizado")
        }catch(e: any) {
            console.log(e)
            if (e.response?.data?.error === "ya existe") {
                toast.error("Ya existe alguien con ese nombre de usuario, prueba otro.")
            } else {
                toast.error(e.response?.data?.error || "Ocurrió un error inesperado :(")
            }
        }
    }   
    
    return {
        updateProfileName,
        updateUsername
    }
}