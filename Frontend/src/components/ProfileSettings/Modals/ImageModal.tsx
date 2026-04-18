import { useState, type Dispatch, type SetStateAction } from 'react'
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '@/contexts/authContext';
import { CheckCircle, Upload, X } from 'lucide-react';
import { Backdrop, CircularProgress, IconButton, styled, Tooltip } from '@mui/material';
import { toast } from 'sonner';
import useUserActions from '@/hooks/useUserActions';

interface Props {
  setOpen: Dispatch<SetStateAction<boolean>>
}

const API_URL = import.meta.env.VITE_API_URL

function ImageModal(props: Props) {
  const { setOpen } = props
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [openBackdrop, setOpenBackdrop] = useState(false)
  const { updateProfileImage } = useUserActions()

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
    } else {
      setPreviewUrl(null)
    }
  }

  const onSubmit = async () => {
    setOpenBackdrop(true)
    try {
      await updateProfileImage(selectedFile!)
    } catch (e: any) {
      console.log(e)
    } finally {
      setOpenBackdrop(false)
      setOpen(false)
    }
  }

  if (!previewUrl) {
    return (
      <div
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      //onClick={() => setOpen(false)}
      >
        <button
          className="absolute top-4 right-4 text-white hover:text-gray-300 cursor-pointer"
          onClick={() => setOpen(false)}
        >
          <X className="w-8 h-8" />
        </button>
        <div className="absolute xl:top-16 xl:right-3 top-3 right-16 text-white hover:text-gray-300">
          <Tooltip title="Subir nueva foto de perfil" placement='left'>
            <IconButton aria-label="Subir foto de perfil" color="primary" component="label" >
              <Upload className="w-7 h-7" />
              <VisuallyHiddenInput
                type='file'
                accept='image/*'
                onChange={(e) => handleChangeFile(e)}
              />
            </IconButton>
          </Tooltip>
        </div>

        {user?.profileImage ? (
          <img
            src={`${API_URL}${user?.profileImage}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            alt="Foto de perfil"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <AccountCircle className='w-64 h-64 ' />
        )}
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" >
      <button
        className="absolute top-4 right-4  text-white hover:text-gray-300 cursor-pointer"
        onClick={() => setPreviewUrl(null)}
      >
        <X className="w-8 h-8" />
      </button>

      <div className="absolute xl:top-16 xl:right-3 top-3 right-16 shadow-lg flex justify-center">
        <Tooltip title="Actualizar" placement='left' >
          <IconButton aria-label="Actualizar" color="primary" onClick={onSubmit}  >
            <CheckCircle className="w-7 h-7" />
          </IconButton>
        </Tooltip>
      </div>

      <img
        src={`${previewUrl}`}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        alt="Foto de perfil"
        onClick={(e) => e.stopPropagation()}
      />
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={openBackdrop}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  )
}

export default ImageModal