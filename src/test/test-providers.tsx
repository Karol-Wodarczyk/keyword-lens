import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'

export function TestProviders({ children }: { children: React.ReactNode }) {
    return (
        <BrowserRouter>
            {children}
            <Toaster />
        </BrowserRouter>
    )
}
