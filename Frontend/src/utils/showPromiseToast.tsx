import { toast } from "sonner"

export function useToastPromise() {
    const showToast = (message: string) => {
        toast.promise<{name: string}>(
            () => new Promise((resolve) => 
                setTimeout(()=> resolve({name: "Name"}), 2000)
            ),
            {
                loading: message,
            }
        )
    }

    return {
        showToast
    }
} 