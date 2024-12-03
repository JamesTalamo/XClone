import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {

    const queryClient = useQueryClient()

    const { mutate: follow, isPending } = useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URI}/api/users/follow/${userId}`, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    credentials: 'include'
                })
                let data = await res.json()
                if (!res.ok) throw new Error(data.error || "Something Went Wrong.")
                return data
            } catch (error) {
                throw new Error(error)
            }
        },
        onSuccess: () => {
            Promise.all([
                queryClient.invalidateQueries({ querryKey: ['suggestedUsers'] }),
                queryClient.invalidateQueries({ querryKey: ['authUser'] })
            ])
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    return { follow, isPending }
}

export default useFollow