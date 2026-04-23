import { IconButton, Tooltip } from '@mui/material'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../ui/dialog'
import { PlusCircle } from 'lucide-react'
import NewChatForm from './NewChatModal'
import { useState } from 'react'


export default function NewChatButton() {
    const [openCreate, setOpenCreate] = useState(false)
    return (
        <div className="w-full flex justify-end items-center mb-2">
            <Dialog open={openCreate} onOpenChange={setOpenCreate} >
                <DialogTrigger asChild>
                    <Tooltip title="Comenzar nuevo chat" placement="left">
                        <IconButton aria-label="Add new chat" size="large" color="primary" >
                            <PlusCircle className="" />
                        </IconButton>
                    </Tooltip>
                </DialogTrigger>
                <DialogContent aria-describedby="">
                    <DialogTitle>Busca a alguien para chatear</DialogTitle>
                    <DialogDescription>Busca a alguien por su...</DialogDescription>
                    <NewChatForm setOpen={setOpenCreate} />
                </DialogContent>
            </Dialog>
        </div>
    )
}