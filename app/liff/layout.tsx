import { Suspense } from 'react'
import LiffPage from './page'

export const metadata = {
    title: 'QR Tracking - LINE',
}

export default function LiffLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <p>Loading...</p>
            </div>
        }>
            {children}
        </Suspense>
    )
}
