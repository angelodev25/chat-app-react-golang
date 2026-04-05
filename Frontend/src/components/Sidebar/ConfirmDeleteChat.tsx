import { useState, type Dispatch, type SetStateAction } from 'react'
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'
import { Backdrop, Button, CircularProgress } from '@mui/material'
import { useChatsActions } from '@/hooks/useChatsActions'

type Props = {
    chatToDelete: string | null
    setChatToDelete: Dispatch<SetStateAction<string | null>>
}

export default function ConfirmDeleteChatDialog(props: Props) {
    const { chatToDelete, setChatToDelete } = props
    const [openBackdrop, setOpenBackdrop] = useState(false)
    const { deleteChat } = useChatsActions()

    const handleDelete = async (chatId: string) => {
        setOpenBackdrop(true)
        try {
            await deleteChat(chatId)
        } finally {
            setOpenBackdrop(false)
        }
        setChatToDelete(null)
    }

    return (
        <Dialog
            open={!!chatToDelete}
            onOpenChange={(open) => !open && setChatToDelete(null)}
        >
            <DialogContent aria-describedby="" >
                <DialogTitle>¿Seguro que quieres eliminar este chat?</DialogTitle>
                <div className="flex gap-x-3 mt-4 justify-end">
                    <Button
                        variant='text'
                        color='primary'
                        onClick={() => setChatToDelete(null)}
                        disabled={openBackdrop}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(chatToDelete!)}
                        disabled={openBackdrop}
                    >
                        Eliminar
                    </Button>
                </div>
                <Backdrop
                    sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                    open={openBackdrop}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            </DialogContent>
        </Dialog>
    )
}