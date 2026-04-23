import { useAuth } from "@/contexts/authContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import AccountCircle from '@mui/icons-material/AccountCircle';
import ProfileSettings from "@/components/ProfileSettings/ProfileSettings";
import { Button } from "@mui/material";
import { LogOut } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL

export default function SidebarHeader() {
	const { user, logOut } = useAuth()
	return (
		<div className="flex justify-between items-center top-0 left-0 right-0 p-2 mt-2 rounded-lg bg-(--sidebar-user-info-background)">
			<div className="flex items-center space-x-3">
				<Sheet>
					<SheetTrigger>
						<div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center cursor-pointer">
							{user?.profileImage ? <img src={`${API_URL}${user?.profileImage}`} className="w-10 h-10 rounded-full" /> : <AccountCircle className="w-10 h-10 rounded-full" />}
						</div>
					</SheetTrigger>
					<SheetContent
						aria-describedby=""
						style={{
							width: '500px',
							maxWidth: '90vw',
							background: 'linear-gradient(to bottom, var(--profile-settings-gradient-start) 0%, var(--profile-settings-gradient-middle) 50%, var(--profile-settings-gradient-end) 100%)'
						}}
						side="left"
					>
						<SheetHeader>
							<SheetTitle className="text-2xl" >Tu perfil</SheetTitle>
						</SheetHeader>
						<ProfileSettings />
					</SheetContent>
				</Sheet>
				<div>
					<p className="font-medium">{user?.profileName}</p>
					<p className="text-sm text-purple-200">{user?.username}</p>
				</div>
			</div>
			<div className="flex justify-end">
				<Button variant="text" startIcon={<LogOut />} onClick={logOut} >Salir</Button>
			</div>
		</div>
	)
}