import { Suspense } from 'react'

export const metadata = {
    title: 'เปิดใน LINE',
}

export default function OpenLayout({
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
                background: '#ffffff',
                color: '#333'
            }}>
                <p>Loading...</p>
            </div>
        }>
            {children}
        </Suspense>
    )
}
