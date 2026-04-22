import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { Logo } from '@/components/Logo/Logo';
import { useEffect, useState } from 'react';
import SignIn from '@/components/Login/SignIn';
import SignUp from '@/components/Login/SignUp';

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
	width: '100%',
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
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)

	useEffect(() => {
		setLoading(true)

		setTimeout(() => {
			setLoading(false)
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl)
			}
			setPreviewUrl(null)
		}, 600)
	}, [isLogin])

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
						<div className="px-[5px] overflow-auto custom-scroll">
							<Typography
								component="h1"
								variant="h4"
								sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)', marginBottom: '20px' }}
							>
								{isLogin ? <p>Iniciar Sesión</p> : <p>Crear una cuenta</p>}
							</Typography>

							{/* Apartados de SignIn y SignUp */}
							{isLogin ? (
								<SignIn setIsLogin={setIsLogin} />
							) : (
								<SignUp setIsLogin={setIsLogin} />
							)
							}
						</div>
					)}
				</Card>
			</SignUpContainer>
		</div >
	);
} 