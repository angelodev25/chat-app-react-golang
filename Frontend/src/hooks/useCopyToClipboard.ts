// hooks/useCopyToClipboard.ts
import { useState } from 'react'
import { toast } from 'sonner'

export const useCopyToClipboard = () => {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async (text: string) => {
        if (!text) return false

        try {
            // Intentar con el método moderno
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text)
                setCopied(true)
                toast.message("Mensaje copiado")
                setTimeout(() => setCopied(false), 2000)
                return true
            } else {
                // Fallback para contextos no seguros
                const textArea = document.createElement('textarea')
                textArea.value = text
                textArea.style.position = 'fixed'
                textArea.style.left = '-999999px'
                textArea.style.top = '-999999px'
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                
                const successful = document.execCommand('copy')
                document.body.removeChild(textArea)
                
                if (successful) {
                    setCopied(true)
                    toast.message("Mensaje copiado")
                    setTimeout(() => setCopied(false), 2000)
                    return true
                } else {
                    throw new Error('Fallback copy failed')
                }
            }
        } catch (error) {
            console.error('Error al copiar: ', error)
            toast.error("No se pudo copiar el mensaje")
            return false
        }
    }

    return { copyToClipboard, copied }
}