'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import liff from '@line/liff'

export default function LiffPage() {
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('กำลังเชื่อมต่อ...')
    const taxiCode = searchParams.get('taxi')

    useEffect(() => {
        initializeLiff()
    }, [])

    const initializeLiff = async () => {
        try {
            const liffId = process.env.NEXT_PUBLIC_LIFF_ID
            if (!liffId) {
                throw new Error('LIFF ID not configured')
            }

            await liff.init({ liffId })

            const isInClient = liff.isInClient()

            if (!isInClient && !liff.isLoggedIn()) {
                if (taxiCode) {
                    sessionStorage.setItem('taxiCode', taxiCode)
                }
                liff.login()
                return
            }

            const storedTaxiCode = sessionStorage.getItem('taxiCode') || taxiCode
            const profile = await liff.getProfile()

            setMessage('กำลังบันทึกข้อมูล...')

            const response = await fetch('/api/liff/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lineUserId: profile.userId,
                    displayName: profile.displayName,
                    pictureUrl: profile.pictureUrl,
                    taxiCode: storedTaxiCode
                })
            })

            sessionStorage.removeItem('taxiCode')

            if (!response.ok) {
                throw new Error('Failed to register')
            }

            setStatus('success')
            setMessage('สำเร็จ! กำลังพาคุณไป LINE...')

            const lineOaId = process.env.NEXT_PUBLIC_LINE_OA_ID || ''

            setTimeout(() => {
                if (lineOaId) {
                    const lineOaUrl = `https://line.me/R/ti/p/${lineOaId}`
                    if (liff.isInClient()) {
                        liff.openWindow({ url: lineOaUrl, external: false })
                    } else {
                        window.location.href = lineOaUrl
                    }
                } else {
                    setMessage('ขอบคุณที่สนใจ!')
                    if (liff.isInClient()) {
                        setTimeout(() => liff.closeWindow(), 2000)
                    }
                }
            }, 1500)

        } catch (error) {
            console.error('LIFF Error:', error)
            setStatus('error')
            setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่')
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            color: '#333',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: '20px',
            textAlign: 'center'
        }}>
            {/* Logo/Brand Area */}
            <div style={{
                marginBottom: '40px'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #06C755, #00B900)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 4px 15px rgba(6, 199, 85, 0.3)'
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                </div>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '30px' }}>
                {status === 'loading' && (
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #f0f0f0',
                        borderTop: '3px solid #06C755',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                )}
                {status === 'success' && (
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: '#06C755',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                    </div>
                )}
                {status === 'error' && (
                    <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: '#ff4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Message */}
            <h1 style={{
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '10px',
                color: '#333'
            }}>
                {status === 'success' ? 'ยินดีต้อนรับ!' : 'กรุณารอสักครู่'}
            </h1>

            <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '20px'
            }}>
                {message}
            </p>

            {/* LINE Branding */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#999',
                fontSize: '13px',
                marginTop: '40px'
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#06C755">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
                <span>เชื่อมต่อผ่าน LINE</span>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
