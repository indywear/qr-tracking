'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import liff from '@line/liff'

export default function LiffPage() {
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('กำลังโหลด...')
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

            // Initialize LIFF
            await liff.init({ liffId })

            // Check if user is logged in
            if (!liff.isLoggedIn()) {
                liff.login({ redirectUri: window.location.href })
                return
            }

            // Get user profile
            const profile = await liff.getProfile()

            setMessage('กำลังบันทึกข้อมูล...')

            // Save customer data to our API
            const response = await fetch('/api/liff/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lineUserId: profile.userId,
                    displayName: profile.displayName,
                    pictureUrl: profile.pictureUrl,
                    taxiCode: taxiCode
                })
            })

            if (!response.ok) {
                throw new Error('Failed to register')
            }

            setStatus('success')
            setMessage('สำเร็จ! กำลังเปิด LINE...')

            // Redirect to LINE OA chat
            const lineOaId = process.env.NEXT_PUBLIC_LINE_OA_ID || ''
            const lineOaUrl = `https://line.me/R/ti/p/${lineOaId}`

            // Small delay before redirect
            setTimeout(() => {
                if (liff.isInClient()) {
                    // In LINE app, open chat directly
                    liff.openWindow({ url: lineOaUrl, external: false })
                } else {
                    // In external browser, redirect
                    window.location.href = lineOaUrl
                }
            }, 1500)

        } catch (error) {
            console.error('LIFF Error:', error)
            setStatus('error')
            setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '20px',
            textAlign: 'center'
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '400px',
                width: '100%'
            }}>
                {status === 'loading' && (
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                )}
                {status === 'success' && (
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                )}
                {status === 'error' && (
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
                )}

                <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>
                    {status === 'success' ? 'ยินดีต้อนรับ!' : 'QR Tracking'}
                </h1>

                <p style={{ fontSize: '16px', opacity: 0.9 }}>
                    {message}
                </p>

                {taxiCode && (
                    <p style={{ fontSize: '14px', marginTop: '20px', opacity: 0.7 }}>
                        รหัสรถ: {taxiCode}
                    </p>
                )}
            </div>
        </div>
    )
}
