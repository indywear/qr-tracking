'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function OpenLinePage() {
    const searchParams = useSearchParams()
    const [showButton, setShowButton] = useState(false)
    const taxiCode = searchParams.get('taxi') || ''
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID || ''

    // LINE URL Scheme to open LIFF directly in LINE app
    const lineAppUrl = `line://app/${liffId}?taxi=${taxiCode}`
    // Fallback web URL
    const liffWebUrl = `https://liff.line.me/${liffId}?taxi=${taxiCode}`

    useEffect(() => {
        // Try to open LINE app immediately
        tryOpenLineApp()
    }, [])

    const tryOpenLineApp = () => {
        // Create a hidden iframe to try opening LINE
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = lineAppUrl
        document.body.appendChild(iframe)

        // Also try window.location for some iOS versions
        setTimeout(() => {
            window.location.href = lineAppUrl
        }, 100)

        // If LINE doesn't open within 2 seconds, show the button
        setTimeout(() => {
            setShowButton(true)
        }, 2000)

        // Cleanup iframe
        setTimeout(() => {
            document.body.removeChild(iframe)
        }, 3000)
    }

    const handleOpenLine = () => {
        // Try LINE app first
        window.location.href = lineAppUrl

        // Fallback to web after a short delay
        setTimeout(() => {
            window.location.href = liffWebUrl
        }, 1500)
    }

    const handleOpenWeb = () => {
        window.location.href = liffWebUrl
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
            {/* LINE Logo */}
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: '#06C755',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '30px',
                boxShadow: '0 4px 15px rgba(6, 199, 85, 0.3)'
            }}>
                <svg width="50" height="50" viewBox="0 0 24 24" fill="white">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                </svg>
            </div>

            {/* Loading State */}
            {!showButton && (
                <>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #f0f0f0',
                        borderTop: '3px solid #06C755',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '20px'
                    }} />
                    <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>
                        กำลังเปิด LINE...
                    </h1>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                        กรุณารอสักครู่
                    </p>
                </>
            )}

            {/* Button State */}
            {showButton && (
                <>
                    <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '10px' }}>
                        เปิด LINE เพื่อดำเนินการต่อ
                    </h1>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>
                        กดปุ่มด้านล่างเพื่อเปิดใน LINE
                    </p>

                    <button
                        onClick={handleOpenLine}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            width: '100%',
                            maxWidth: '280px',
                            padding: '16px 24px',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'white',
                            background: '#06C755',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(6, 199, 85, 0.3)',
                            marginBottom: '15px'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                        </svg>
                        เปิดใน LINE
                    </button>

                    <button
                        onClick={handleOpenWeb}
                        style={{
                            width: '100%',
                            maxWidth: '280px',
                            padding: '12px 24px',
                            fontSize: '14px',
                            color: '#666',
                            background: 'transparent',
                            border: '1px solid #ddd',
                            borderRadius: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        เปิดในเบราว์เซอร์แทน
                    </button>
                </>
            )}

            {/* Footer */}
            <p style={{
                position: 'fixed',
                bottom: '20px',
                fontSize: '12px',
                color: '#999'
            }}>
                ปลอดภัย • เชื่อมต่อผ่าน LINE Official Account
            </p>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
