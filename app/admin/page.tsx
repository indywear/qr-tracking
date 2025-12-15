'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })

            if (!res.ok) {
                setError('รหัสผ่านไม่ถูกต้อง')
                return
            }

            router.push('/admin/dashboard')
        } catch {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '40px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <h1 style={{
                    color: 'white',
                    fontSize: '28px',
                    marginBottom: '8px',
                    textAlign: 'center'
                }}>
                    🚕 QR Tracking
                </h1>
                <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    Admin Dashboard
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="รหัสผ่าน"
                        style={{
                            width: '100%',
                            padding: '14px 16px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            fontSize: '16px',
                            marginBottom: '16px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />

                    {error && (
                        <p style={{
                            color: '#ff6b6b',
                            fontSize: '14px',
                            marginBottom: '16px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'transform 0.2s, opacity 0.2s'
                        }}
                    >
                        {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>
                </form>
            </div>
        </div>
    )
}
