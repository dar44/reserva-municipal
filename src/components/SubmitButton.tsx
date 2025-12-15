'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
    children: React.ReactNode
    loadingText?: string
}

export function SubmitButton({
    children,
    loadingText = 'Guardando...',
    ...props
}: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending} {...props}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingText}
                </>
            ) : (
                children
            )}
        </Button>
    )
}
